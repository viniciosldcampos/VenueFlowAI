const prisma = require("../utils/prisma");

// ─── ENTRAR NA FILA ───────────────────────────────────────────────────────────
const join = async (req, res) => {
  try {
    const { eventId, ticketType } = req.body;

    // verificar se evento existe
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: { tickets: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    // verificar se já está na fila
    const existing = await prisma.waitlist.findFirst({
      where: {
        userId:  req.user.id,
        eventId: Number(eventId),
        status:  { in: ["WAITING", "CALLED"] },
      },
    });

    if (existing) {
      return res.status(400).json({
        error:    "Você já está na lista de espera deste evento",
        waitlist: existing,
      });
    }

    // calcular posição na fila
    const lastPosition = await prisma.waitlist.findFirst({
      where:   { eventId: Number(eventId), status: "WAITING" },
      orderBy: { position: "desc" },
      select:  { position: true },
    });

    const position = lastPosition ? lastPosition.position + 1 : 1;

    const waitlist = await prisma.waitlist.create({
      data: {
        userId:     req.user.id,
        eventId:    Number(eventId),
        ticketType: ticketType || "Inteira",
        position,
        status:     "WAITING",
      },
      include: {
        event: { select: { id: true, name: true, date: true } },
      },
    });

    return res.status(201).json({
      message:  "Você entrou na lista de espera",
      waitlist,
    });
  } catch (err) {
    console.error("Erro ao entrar na fila:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── LISTAR FILA POR EVENTO ───────────────────────────────────────────────────
const getByEvent = async (req, res) => {
  try {
    const { eventId }              = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip  = (Number(page) - 1) * Number(limit);
    const where = { eventId: Number(eventId) };

    if (status) where.status = status;

    const [waitlist, total] = await Promise.all([
      prisma.waitlist.findMany({
        where,
        skip,
        take:    Number(limit),
        orderBy: { position: "asc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),
      prisma.waitlist.count({ where }),
    ]);

    // estatísticas
    const stats = await prisma.waitlist.groupBy({
      by:    ["status"],
      where: { eventId: Number(eventId) },
      _count: { status: true },
    });

    return res.status(200).json({
      waitlist,
      stats,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar fila:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CHAMAR PRÓXIMO DA FILA ───────────────────────────────────────────────────
const callNext = async (req, res) => {
  try {
    const { eventId } = req.params;

    // buscar próximo na fila
    const next = await prisma.waitlist.findFirst({
      where: {
        eventId: Number(eventId),
        status:  "WAITING",
      },
      orderBy: { position: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!next) {
      return res.status(404).json({ error: "Nenhuma pessoa na fila de espera" });
    }

    // atualizar status para CALLED
    const updated = await prisma.waitlist.update({
      where: { id: next.id },
      data: {
        status:     "CALLED",
        notifiedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return res.status(200).json({
      message:  "Próximo chamado com sucesso",
      waitlist: updated,
    });
  } catch (err) {
    console.error("Erro ao chamar próximo:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── CONVERTER (comprou o ingresso) ──────────────────────────────────────────
const convert = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.waitlist.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Entrada não encontrada na fila" });
    }

    if (existing.status !== "CALLED") {
      return res.status(400).json({ error: "Apenas entradas com status CALLED podem ser convertidas" });
    }

    const waitlist = await prisma.waitlist.update({
      where: { id: Number(id) },
      data:  { status: "CONVERTED" },
    });

    return res.status(200).json({ message: "Convertido com sucesso", waitlist });
  } catch (err) {
    console.error("Erro ao converter:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── SAIR DA FILA ─────────────────────────────────────────────────────────────
const leave = async (req, res) => {
  try {
    const { id } = req.params;
    const where  = { id: Number(id) };

    // cliente só pode sair da própria fila
    if (req.user.role === "CLIENT") {
      where.userId = req.user.id;
    }

    const existing = await prisma.waitlist.findFirst({ where });
    if (!existing) {
      return res.status(404).json({ error: "Entrada não encontrada na fila" });
    }

    await prisma.waitlist.update({
      where: { id: Number(id) },
      data:  { status: "EXPIRED" },
    });

    // reordenar posições
    await prisma.$executeRaw`
      UPDATE waitlist
      SET position = position - 1
      WHERE eventId = ${existing.eventId}
        AND position > ${existing.position}
        AND status = 'WAITING'
    `;

    return res.status(200).json({ message: "Saiu da fila com sucesso" });
  } catch (err) {
    console.error("Erro ao sair da fila:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── MINHA POSIÇÃO NA FILA ────────────────────────────────────────────────────
const myPosition = async (req, res) => {
  try {
    const { eventId } = req.params;

    const waitlist = await prisma.waitlist.findFirst({
      where: {
        userId:  req.user.id,
        eventId: Number(eventId),
        status:  { in: ["WAITING", "CALLED"] },
      },
      include: {
        event: { select: { id: true, name: true, date: true } },
      },
    });

    if (!waitlist) {
      return res.status(404).json({ error: "Você não está na lista de espera deste evento" });
    }

    // total de pessoas na frente
    const ahead = await prisma.waitlist.count({
      where: {
        eventId:  Number(eventId),
        position: { lt: waitlist.position },
        status:   "WAITING",
      },
    });

    return res.status(200).json({ waitlist, aheadOfYou: ahead });
  } catch (err) {
    console.error("Erro ao buscar posição:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { join, getByEvent, callNext, convert, leave, myPosition };