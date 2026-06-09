const bcrypt          = require("bcryptjs");
const prisma          = require("../utils/prisma");
const { generateToken } = require("../utils/jwt");

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // verificar se email já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    // criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone:    phone || null,
        role:     "CLIENT",
      },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        phone:     true,
        createdAt: true,
      },
    });

    // gerar token
    const token = generateToken({ id: user.id, role: user.role });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user,
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    // verificar se está ativo
    if (!user.active) {
      return res.status(401).json({ error: "Usuário inativo" });
    }

    // verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    // gerar token
    const token = generateToken({ id: user.id, role: user.role });

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ME ───────────────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      },
    });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── ALTERAR SENHA ────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Senha atual incorreta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data:  { password: hashedPassword },
    });

    return res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { register, login, me, changePassword };