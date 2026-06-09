const { verifyToken } = require("../utils/jwt");
const prisma          = require("../utils/prisma");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:     true,
        name:   true,
        email:  true,
        role:   true,
        active: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (!user.active) {
      return res.status(401).json({ error: "Usuário inativo" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }
    next();
  };
};

module.exports = { authenticate, authorize };