const prisma = require("../utils/prisma");

// ─── REALIZAR CHECK-IN ────────────────────────────────────────────────────────
const doCheckin = async (req, res) => {
  try {
    const { code, eventId, method = "QR_CODE" } = req.body;

    // buscar reserva pelo código
    const reservation = await prisma.reservation.findFirst({
      where: {
        code,
        eventId: Number(eventId),
      },
      include: {
        user:  { select: { id: true, name: true, email: true, phone: true } },
        event: { select: { id: true, name: true, date: true } },
        items: {
          include: {
            ticket: { select: { type: true } },
            seat:   { select: { label: true, row: true, number: true } },
          },
        },
        checkins: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    // verificar se reserva está confirmada
    if (reservation.status !== "CONFIRMED") {
      return res.status(400).json({
        error: `Reserva com status inválido: ${reservation.status}`,
      });
    }

    // verificar se já fez check-in
    if (reservation.checkins.length > 0) {
      return res.status(400).json({
        error:   "Check-in já realizado",
        checkin: reservation.checkins[0],
      });
    }

    // realizar check-in
    const checkin = await prisma.checkin.create({
      data: {
        reservationId: reservation.id,
        userId:        reservation.userId,
        eventId:       Number(eventId),
        method,
      },
    });

    return res.status(201).json({
      message:     "Check-in realizado com sucesso",
      checkin,
      reservation: {
        id:     reservation.id,
        code:   reservation.code,
        user:   reservation.user,
        event:  reservation.event,
        items:  reservation.items,
        total:  reservation.total,
        paidAt: reservation.paidAt,
      },
    });
  } catch (err) {
    console.error("Erro ao realizar check-in:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── BUSCAR POR CÓDIGO ────────────────────────────────────────────────────────
const getByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const reservation = await prisma.reservation.findFirst({
      where: { code },
      include: {
        user:  { select: { id: true, name: true, email: true, phone: true } },
        event: {
          select: {
            id:   true,
            name: true,
            date: true,
            room: { select: { name: true } },
          },
        },
        items: {
          include: {
            ticket: { select: { type: true, price: true } },
            seat:   { select: { label: true, row: true, number: true } },
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

// ─── LISTAR CHECK-INS DO EVENTO ───────────────────────────────────────────────
const getByEvent = async (req, res) => {
  try {
    const { eventId }              = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [checkins, total] = await Promise.all([
      prisma.checkin.findMany({
        where:   { eventId: Number(eventId) },
        skip,
        take:    Number(limit),
        orderBy: { checkedAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          reservation: {
            select: {
              code:  true,
              total: true,
              items: {
                include: {
                  ticket: { select: { type: true } },
                  seat:   { select: { label: true } },
                },
              },
            },
          },
        },
      }),
      prisma.checkin.count({ where: { eventId: Number(eventId) } }),
    ]);

    // buscar estatísticas do evento
    const event = await prisma.event.findUnique({
      where:   { id: Number(eventId) },
      include: {
        tickets: {
          select: { quantity: true, sold: true },
        },
        _count: {
          select: {
            checkins:     true,
            reservations: true,
          },
        },
      },
    });

    const totalSold     = event.tickets.reduce((acc, t) => acc + t.sold,     0);
    const totalCapacity = event.tickets.reduce((acc, t) => acc + t.quantity, 0);

    return res.status(200).json({
      checkins,
      stats: {
        totalCheckins:    total,
        totalSold,
        totalCapacity,
        waiting:          totalSold - total,
        occupancyRate:    totalCapacity > 0
          ? Math.round((total / totalCapacity) * 100)
          : 0,
      },
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar check-ins:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── HISTÓRICO DE CHECK-INS DO USUÁRIO ───────────────────────────────────────
const getByUser = async (req, res) => {
  try {
    const userId = req.user.role === "CLIENT"
      ? req.user.id
      : Number(req.params.userId);

    const checkins = await prisma.checkin.findMany({
      where:   { userId },
      orderBy: { checkedAt: "desc" },
      include: {
        event: {
          select: {
            id:   true,
            name: true,
            date: true,
            type: true,
            room: { select: { name: true } },
          },
        },
        reservation: {
          select: {
            code:  true,
            total: true,
          },
        },
      },
    });

    return res.status(200).json({ checkins });
  } catch (err) {
    console.error("Erro ao listar check-ins do usuário:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { doCheckin, getByCode, getByEvent, getByUser };