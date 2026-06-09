const prisma = require("../utils/prisma");

// ─── GERAR CÓDIGO ÚNICO ───────────────────────────────────────────────────────
const generateCode = () => {
  const prefix = "RES";
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const date   = new Date().getFullYear();
  return `${prefix}-${date}-${random}`;
};

// ─── LISTAR TODAS ─────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, eventId, userId } = req.query;

    const skip  = (Number(page) - 1) * Number(limit);
    const where = {};

    if (search) {
      where.OR = [
        { code:        { contains: search } },
        { user:  { name:  { contains: search } } },
        { user:  { email: { contains: search } } },
        { event: { name:  { contains: search } } },
      ];
    }

    if (status)  where.status  = status;
    if (eventId) where.eventId = Number(eventId);
    if (userId)  where.userId  = Number(userId);

    // clientes só veem suas próprias reservas
    if (req.user.role === "CLIENT") {
      where.userId = req.user.id;
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          event: {
            select: {
              id:     true,
              name:   true,
              date:   true,
              type:   true,
              room: { select: { id: true, name: true } },
            },
          },
          items: {
            include: {
              ticket: { select: { type: true, price: true } },
              seat:   { select: { label: true, row: true, number: true } },
            },
          },
        },
      }),
      prisma.reservation.count({ where }),
    ]);

    return res.status(200).json({
      reservations,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar reservas:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── BUSCAR POR ID ────────────────────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const where  = { id: Number(id) };

    if (req.user.role === "CLIENT") {
      where.userId = req.user.id;
    }

    const reservation = await prisma.reservation.findFirst({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        event: {
          include: {
            room: { select: { id: true, name: true, location: true } },
          },
        },
        items: {
          include: {
            ticket: true,
            seat:   true,
          },
        },
        checkins: {
          select: { id: true, checkedAt: true, method: true },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    return res.status(200).json({ reservation });
  } catch (err) {
    console.error("Erro ao buscar reserva:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CRIAR ────────────────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { eventId, items, payment } = req.body;

    // verificar se evento existe e está ativo
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: { tickets: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    if (event.status === "CANCELLED" || event.status === "FINISHED") {
      return res.status(400).json({ error: "Evento não está disponível para reservas" });
    }

    // calcular total e validar itens
    let total = 0;
    const reservationItems = [];

    for (const item of items) {
      const ticket = event.tickets.find((t) => t.id === Number(item.ticketId));

      if (!ticket) {
        return res.status(400).json({ error: `Ingresso ${item.ticketId} não encontrado` });
      }

      const available = ticket.quantity - ticket.sold;
      if (available < Number(item.quantity)) {
        return res.status(400).json({ error: `Ingressos insuficientes para ${ticket.type}` });
      }

      const itemTotal = Number(ticket.price) * Number(item.quantity);
      total += itemTotal;

      reservationItems.push({
        ticketId: Number(item.ticketId),
        seatId:   item.seatId ? Number(item.seatId) : null,
        price:    Number(ticket.price),
        quantity: Number(item.quantity),
      });
    }

    // criar reserva e atualizar ingressos vendidos
    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          code:    generateCode(),
          userId:  req.user.id,
          eventId: Number(eventId),
          status:  "PENDING",
          total,
          payment: payment || null,
          items: {
            create: reservationItems,
          },
        },
        include: {
          items: {
            include: {
              ticket: true,
              seat:   true,
            },
          },
          event: {
            select: { id: true, name: true, date: true },
          },
        },
      });

      // atualizar contagem de vendidos
      for (const item of reservationItems) {
        await tx.ticket.update({
          where: { id: item.ticketId },
          data:  { sold: { increment: item.quantity } },
        });
      }

      return newReservation;
    });

    return res.status(201).json({
      message: "Reserva criada com sucesso",
      reservation,
    });
  } catch (err) {
    console.error("Erro ao criar reserva:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CONFIRMAR ────────────────────────────────────────────────────────────────
const confirm = async (req, res) => {
  try {
    const { id }      = req.params;
    const { payment } = req.body;

    const existing = await prisma.reservation.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    if (existing.status !== "PENDING") {
      return res.status(400).json({ error: "Apenas reservas pendentes podem ser confirmadas" });
    }

    const reservation = await prisma.reservation.update({
      where: { id: Number(id) },
      data: {
        status:  "CONFIRMED",
        payment: payment || existing.payment,
        paidAt:  new Date(),
      },
    });

    return res.status(200).json({ message: "Reserva confirmada com sucesso", reservation });
  } catch (err) {
    console.error("Erro ao confirmar reserva:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CANCELAR ─────────────────────────────────────────────────────────────────
const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const where  = { id: Number(id) };

    if (req.user.role === "CLIENT") {
      where.userId = req.user.id;
    }

    const existing = await prisma.reservation.findFirst({ where });
    if (!existing) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    if (existing.status === "CANCELLED") {
      return res.status(400).json({ error: "Reserva já cancelada" });
    }

    // cancelar e devolver ingressos
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: Number(id) },
        data:  { status: "CANCELLED" },
      });

      const items = await tx.reservationItem.findMany({
        where: { reservationId: Number(id) },
      });

      for (const item of items) {
        await tx.ticket.update({
          where: { id: item.ticketId },
          data:  { sold: { decrement: item.quantity } },
        });
      }
    });

    return res.status(200).json({ message: "Reserva cancelada com sucesso" });
  } catch (err) {
    console.error("Erro ao cancelar reserva:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── REEMBOLSAR ───────────────────────────────────────────────────────────────
const refund = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.reservation.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    if (existing.status !== "CONFIRMED") {
      return res.status(400).json({ error: "Apenas reservas confirmadas podem ser reembolsadas" });
    }

    await prisma.reservation.update({
      where: { id: Number(id) },
      data:  { status: "REFUNDED" },
    });

    return res.status(200).json({ message: "Reserva reembolsada com sucesso" });
  } catch (err) {
    console.error("Erro ao reembolsar reserva:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { getAll, getById, create, confirm, cancel, refund };