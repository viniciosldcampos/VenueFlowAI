const prisma = require("../utils/prisma");

// ─── LISTAR TODAS ─────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;

    const skip  = (Number(page) - 1) * Number(limit);
    const where = {};

    if (search) {
      where.OR = [
        { name:     { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (type)   where.type   = type;
    if (status) where.active = status === "active";

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          sectors: {
            select: {
              id:       true,
              name:     true,
              color:    true,
              capacity: true,
            },
          },
          _count: {
            select: { events: true },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return res.status(200).json({
      rooms,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar salas:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── BUSCAR POR ID ────────────────────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
      include: {
        sectors: {
          include: {
            seats: true,
          },
        },
        events: {
          take: 5,
          orderBy: { date: "desc" },
          select: {
            id:     true,
            name:   true,
            date:   true,
            status: true,
            type:   true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    return res.status(200).json({ room });
  } catch (err) {
    console.error("Erro ao buscar sala:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CRIAR ────────────────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const {
      name, description, type, capacity,
      width, height, location, layout, sectors,
    } = req.body;

    const room = await prisma.room.create({
      data: {
        name,
        description: description || null,
        type,
        capacity:    Number(capacity),
        width:       width  ? Number(width)  : null,
        height:      height ? Number(height) : null,
        location:    location || null,
        layout:      layout   || null,
        sectors: sectors ? {
          create: sectors.map((s) => ({
            name:     s.name,
            color:    s.color    || "#705EBD",
            capacity: Number(s.capacity),
          })),
        } : undefined,
      },
      include: {
        sectors: true,
      },
    });

    return res.status(201).json({ message: "Sala criada com sucesso", room });
  } catch (err) {
    console.error("Erro ao criar sala:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ATUALIZAR ────────────────────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, type, capacity,
      width, height, location, active, layout,
    } = req.body;

    const existing = await prisma.room.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    const room = await prisma.room.update({
      where: { id: Number(id) },
      data: {
        name:        name        || existing.name,
        description: description !== undefined ? description : existing.description,
        type:        type        || existing.type,
        capacity:    capacity    ? Number(capacity) : existing.capacity,
        width:       width       ? Number(width)    : existing.width,
        height:      height      ? Number(height)   : existing.height,
        location:    location    !== undefined ? location : existing.location,
        active:      active      !== undefined ? active   : existing.active,
        layout:      layout      !== undefined ? layout   : existing.layout,
      },
      include: { sectors: true },
    });

    return res.status(200).json({ message: "Sala atualizada com sucesso", room });
  } catch (err) {
    console.error("Erro ao atualizar sala:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── DELETAR ──────────────────────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.room.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    await prisma.room.update({
      where: { id: Number(id) },
      data:  { active: false },
    });

    return res.status(200).json({ message: "Sala desativada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar sala:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── SALVAR LAYOUT ────────────────────────────────────────────────────────────
const saveLayout = async (req, res) => {
  try {
    const { id }     = req.params;
    const { layout } = req.body;

    const existing = await prisma.room.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    const room = await prisma.room.update({
      where: { id: Number(id) },
      data:  { layout },
    });

    return res.status(200).json({ message: "Layout salvo com sucesso", room });
  } catch (err) {
    console.error("Erro ao salvar layout:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── LISTAR SETORES ───────────────────────────────────────────────────────────
const getSectors = async (req, res) => {
  try {
    const { id } = req.params;

    const sectors = await prisma.sector.findMany({
      where: { roomId: Number(id) },
      include: {
        _count: { select: { seats: true } },
      },
    });

    return res.status(200).json({ sectors });
  } catch (err) {
    console.error("Erro ao listar setores:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CRIAR SETOR ──────────────────────────────────────────────────────────────
const createSector = async (req, res) => {
  try {
    const { id }                   = req.params;
    const { name, color, capacity } = req.body;

    const room = await prisma.room.findUnique({ where: { id: Number(id) } });
    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    const sector = await prisma.sector.create({
      data: {
        name,
        color:    color    || "#705EBD",
        capacity: Number(capacity),
        roomId:   Number(id),
      },
    });

    return res.status(201).json({ message: "Setor criado com sucesso", sector });
  } catch (err) {
    console.error("Erro ao criar setor:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = {
  getAll, getById, create, update, remove,
  saveLayout, getSectors, createSector,
};