const prisma = require("../utils/prisma");

// ─── LISTAR TODOS ─────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status, roomId } = req.query;

    const skip  = (Number(page) - 1) * Number(limit);
    const where = {};

    if (search) {
      where.OR = [
        { name:        { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (type)   where.type   = type;
    if (status) where.status = status;
    if (roomId) where.roomId = Number(roomId);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { date: "asc" },
        include: {
          room: {
            select: { id: true, name: true, location: true },
          },
          tickets: {
            select: {
              id:       true,
              type:     true,
              price:    true,
              quantity: true,
              sold:     true,
            },
          },
          _count: {
            select: {
              reservations: true,
              checkins:     true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return res.status(200).json({
      events,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar eventos:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── BUSCAR POR ID ────────────────────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        room: {
          include: {
            sectors: {
              include: { seats: true },
            },
          },
        },
        tickets: true,
        reservations: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id:        true,
            code:      true,
            status:    true,
            total:     true,
            createdAt: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            reservations: true,
            checkins:     true,
            waitlist:     true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.error("Erro ao buscar evento:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CRIAR ────────────────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const {
      name, description, type, date, endDate,
      roomId, highlight, tickets,
    } = req.body;

    // verificar se sala existe
    const room = await prisma.room.findUnique({ where: { id: Number(roomId) } });
    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        type,
        date:        new Date(date),
        endDate:     endDate ? new Date(endDate) : null,
        roomId:      Number(roomId),
        highlight:   highlight || false,
        status:      "SCHEDULED",
        tickets: tickets ? {
          create: tickets.map((t) => ({
            type:        t.type,
            price:       Number(t.price),
            quantity:    Number(t.quantity),
            description: t.description || null,
          })),
        } : undefined,
      },
      include: {
        room:    { select: { id: true, name: true } },
        tickets: true,
      },
    });

    return res.status(201).json({ message: "Evento criado com sucesso", event });
  } catch (err) {
    console.error("Erro ao criar evento:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ATUALIZAR ────────────────────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, type, date,
      endDate, status, highlight,
    } = req.body;

    const existing = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        name:        name        || existing.name,
        description: description !== undefined ? description : existing.description,
        type:        type        || existing.type,
        date:        date        ? new Date(date)    : existing.date,
        endDate:     endDate     ? new Date(endDate) : existing.endDate,
        status:      status      || existing.status,
        highlight:   highlight   !== undefined ? highlight : existing.highlight,
      },
      include: {
        room:    { select: { id: true, name: true } },
        tickets: true,
      },
    });

    return res.status(200).json({ message: "Evento atualizado com sucesso", event });
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── DELETAR ──────────────────────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    await prisma.event.update({
      where: { id: Number(id) },
      data:  { status: "CANCELLED" },
    });

    return res.status(200).json({ message: "Evento cancelado com sucesso" });
  } catch (err) {
    console.error("Erro ao cancelar evento:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ADICIONAR INGRESSO ───────────────────────────────────────────────────────
const addTicket = async (req, res) => {
  try {
    const { id }                               = req.params;
    const { type, price, quantity, description } = req.body;

    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    const ticket = await prisma.ticket.create({
      data: {
        eventId:     Number(id),
        type,
        price:       Number(price),
        quantity:    Number(quantity),
        description: description || null,
      },
    });

    return res.status(201).json({ message: "Ingresso adicionado com sucesso", ticket });
  } catch (err) {
    console.error("Erro ao adicionar ingresso:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── MAPA DE ASSENTOS ─────────────────────────────────────────────────────────
const getSeatMap = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        room: {
          include: {
            sectors: {
              include: {
                seats: {
                  include: {
                    reservationItems: {
                      where: {
                        reservation: {
                          status: { in: ["CONFIRMED", "PENDING"] },
                        },
                      },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    return res.status(200).json({ seatMap: event.room });
  } catch (err) {
    console.error("Erro ao buscar mapa de assentos:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { getAll, getById, create, update, remove, addTicket, getSeatMap };