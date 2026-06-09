const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");

// ─── LISTAR TODOS ─────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;

    const skip  = (Number(page) - 1) * Number(limit);
    const where = {};

    if (search) {
      where.OR = [
        { name:  { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role)   where.role   = role;
    if (status) where.active = status === "active";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id:        true,
          name:      true,
          email:     true,
          role:      true,
          phone:     true,
          group:     true,
          active:    true,
          createdAt: true,
          _count: {
            select: { reservations: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      users,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── BUSCAR POR ID ────────────────────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        phone:     true,
        document:  true,
        birthDate: true,
        group:     true,
        active:    true,
        createdAt: true,
        reservations: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id:        true,
            code:      true,
            status:    true,
            total:     true,
            createdAt: true,
            event: {
              select: { name: true, date: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CRIAR ────────────────────────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, email, password, phone, role, document, birthDate, group } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:  hashedPassword,
        phone:     phone     || null,
        role:      role      || "CLIENT",
        document:  document  || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        group:     group     || "Regular",
      },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        phone:     true,
        group:     true,
        active:    true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ATUALIZAR ────────────────────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, document, birthDate, group, role, active } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name:      name      || existing.name,
        phone:     phone     !== undefined ? phone     : existing.phone,
        document:  document  !== undefined ? document  : existing.document,
        birthDate: birthDate ? new Date(birthDate)     : existing.birthDate,
        group:     group     || existing.group,
        role:      role      || existing.role,
        active:    active    !== undefined ? active    : existing.active,
      },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        phone:     true,
        group:     true,
        active:    true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ message: "Usuário atualizado com sucesso", user });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── DELETAR ──────────────────────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // soft delete — apenas desativa
    await prisma.user.update({
      where: { id: Number(id) },
      data:  { active: false },
    });

    return res.status(200).json({ message: "Usuário desativado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar usuário:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ATUALIZAR PERFIL (usuário logado) ───────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, document, birthDate } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name:      name      || undefined,
        phone:     phone     !== undefined ? phone    : undefined,
        document:  document  !== undefined ? document : undefined,
        birthDate: birthDate ? new Date(birthDate)    : undefined,
      },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        phone:     true,
        document:  true,
        birthDate: true,
        group:     true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ message: "Perfil atualizado com sucesso", user });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { getAll, getById, create, update, remove, updateProfile };