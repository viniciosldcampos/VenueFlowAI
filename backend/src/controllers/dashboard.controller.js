const prisma = require("../utils/prisma");

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const now       = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── totais gerais ──
    const [
      totalRooms,
      activeRooms,
      totalEvents,
      totalClients,
      totalCheckins,
      totalReservations,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { active: true } }),
      prisma.event.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.checkin.count(),
      prisma.reservation.count(),
    ]);

    // ── este mês ──
    const [
      eventsThisMonth,
      reservationsThisMonth,
      checkinsThisMonth,
      newClientsThisMonth,
    ] = await Promise.all([
      prisma.event.count({
        where: { date: { gte: startMonth } },
      }),
      prisma.reservation.count({
        where: { createdAt: { gte: startMonth } },
      }),
      prisma.checkin.count({
        where: { checkedAt: { gte: startMonth } },
      }),
      prisma.user.count({
        where: {
          role:      "CLIENT",
          createdAt: { gte: startMonth },
        },
      }),
    ]);

    // ── receita ──
    const revenueThisMonth = await prisma.reservation.aggregate({
      where: {
        status:    "CONFIRMED",
        createdAt: { gte: startMonth },
      },
      _sum: { total: true },
    });

    const revenueLastMonth = await prisma.reservation.aggregate({
      where: {
        status:    "CONFIRMED",
        createdAt: { gte: lastMonth, lte: endLastMonth },
      },
      _sum: { total: true },
    });

    // ── eventos hoje ──
    const today     = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow  = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventsToday = await prisma.event.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
      },
      include: {
        room: { select: { name: true } },
        _count: {
          select: { reservations: true, checkins: true },
        },
        tickets: {
          select: { quantity: true, sold: true },
        },
      },
      orderBy: { date: "asc" },
    });

    // ── próximos eventos ──
    const upcomingEvents = await prisma.event.findMany({
      where: {
        date:   { gte: now },
        status: { in: ["SCHEDULED", "ONGOING"] },
      },
      take:    5,
      orderBy: { date: "asc" },
      include: {
        room:    { select: { name: true } },
        tickets: { select: { quantity: true, sold: true } },
      },
    });

    // ── salas mais utilizadas ──
    const topRooms = await prisma.room.findMany({
      where:  { active: true },
      take:   5,
      include: {
        _count: { select: { events: true } },
        events: {
          where: { status: { in: ["SCHEDULED", "ONGOING", "FINISHED"] } },
          include: {
            tickets: { select: { quantity: true, sold: true } },
          },
        },
      },
    });

    // calcular taxa de ocupação por sala
    const topRoomsWithOccupancy = topRooms.map((room) => {
      const totalCapacity = room.events.reduce((acc, e) =>
        acc + e.tickets.reduce((a, t) => a + t.quantity, 0), 0);
      const totalSold = room.events.reduce((acc, e) =>
        acc + e.tickets.reduce((a, t) => a + t.sold, 0), 0);
      return {
        id:         room.id,
        name:       room.name,
        type:       room.type,
        eventCount: room._count.events,
        occupancy:  totalCapacity > 0
          ? Math.round((totalSold / totalCapacity) * 100)
          : 0,
      };
    }).sort((a, b) => b.occupancy - a.occupancy);

    // ── lista de espera ──
    const waitlistCount = await prisma.waitlist.count({
      where: { status: "WAITING" },
    });

    // ── taxa de ocupação geral ──
    const allTickets = await prisma.ticket.aggregate({
      _sum: { quantity: true, sold: true },
    });

    const occupancyRate = allTickets._sum.quantity > 0
      ? Math.round((allTickets._sum.sold / allTickets._sum.quantity) * 100)
      : 0;

    return res.status(200).json({
      overview: {
        totalRooms,
        activeRooms,
        totalEvents,
        totalClients,
        totalCheckins,
        totalReservations,
        occupancyRate,
        waitlistCount,
      },
      thisMonth: {
        events:       eventsThisMonth,
        reservations: reservationsThisMonth,
        checkins:     checkinsThisMonth,
        newClients:   newClientsThisMonth,
        revenue:      Number(revenueThisMonth._sum.total  || 0),
        revenueLastMonth: Number(revenueLastMonth._sum.total || 0),
      },
      eventsToday:   eventsToday.map((e) => ({
        id:       e.id,
        name:     e.name,
        date:     e.date,
        room:     e.room.name,
        sold:     e.tickets.reduce((a, t) => a + t.sold, 0),
        capacity: e.tickets.reduce((a, t) => a + t.quantity, 0),
        checkins: e._count.checkins,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id:       e.id,
        name:     e.name,
        date:     e.date,
        type:     e.type,
        room:     e.room.name,
        sold:     e.tickets.reduce((a, t) => a + t.sold, 0),
        capacity: e.tickets.reduce((a, t) => a + t.quantity, 0),
      })),
      topRooms: topRoomsWithOccupancy,
    });
  } catch (err) {
    console.error("Erro ao buscar stats do dashboard:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── RELATÓRIO FINANCEIRO ─────────────────────────────────────────────────────
const getFinancial = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end   = endDate   ? new Date(endDate)   : new Date();

    // receita total confirmada
    const revenue = await prisma.reservation.aggregate({
      where: {
        status:    "CONFIRMED",
        createdAt: { gte: start, lte: end },
      },
      _sum:   { total: true },
      _count: { id: true },
    });

    // reservas por status
    const byStatus = await prisma.reservation.groupBy({
      by:    ["status"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { status: true },
      _sum:   { total: true },
    });

    // receita por tipo de ingresso
    const byTicketType = await prisma.reservationItem.groupBy({
      by: ["ticketId"],
      where: {
        reservation: {
          status:    "CONFIRMED",
          createdAt: { gte: start, lte: end },
        },
      },
      _sum:   { price: true, quantity: true },
      _count: { id: true },
    });

    // top 10 eventos por receita
    const topEvents = await prisma.reservation.groupBy({
      by:    ["eventId"],
      where: {
        status:    "CONFIRMED",
        createdAt: { gte: start, lte: end },
      },
      _sum:   { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    });

    // buscar nomes dos eventos
    const topEventsWithNames = await Promise.all(
      topEvents.map(async (e) => {
        const event = await prisma.event.findUnique({
          where:  { id: e.eventId },
          select: { name: true, date: true, type: true },
        });
        return {
          eventId:      e.eventId,
          name:         event?.name,
          date:         event?.date,
          type:         event?.type,
          revenue:      Number(e._sum.total || 0),
          reservations: e._count.id,
        };
      })
    );

    // transações recentes
    const recentTransactions = await prisma.reservation.findMany({
      where: {
        status:    "CONFIRMED",
        createdAt: { gte: start, lte: end },
      },
      take:    10,
      orderBy: { createdAt: "desc" },
      include: {
        user:  { select: { name: true, email: true } },
        event: { select: { name: true } },
      },
    });

    return res.status(200).json({
      period: { start, end },
      summary: {
        totalRevenue:  Number(revenue._sum.total || 0),
        totalConfirmed: revenue._count.id,
      },
      byStatus,
      topEvents:           topEventsWithNames,
      recentTransactions:  recentTransactions.map((r) => ({
        id:      r.id,
        code:    r.code,
        client:  r.user.name,
        event:   r.event.name,
        total:   Number(r.total),
        payment: r.payment,
        paidAt:  r.paidAt,
      })),
    });
  } catch (err) {
    console.error("Erro ao buscar relatório financeiro:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// ─── RELATÓRIO DE OCUPAÇÃO ────────────────────────────────────────────────────
const getOccupancy = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where:   { active: true },
      include: {
        sectors: { select: { name: true, capacity: true } },
        events:  {
          where: { status: { not: "CANCELLED" } },
          include: {
            tickets: { select: { quantity: true, sold: true } },
            _count:  { select: { checkins: true } },
          },
        },
      },
    });

    const occupancyData = rooms.map((room) => {
      const totalCapacity = room.events.reduce((acc, e) =>
        acc + e.tickets.reduce((a, t) => a + t.quantity, 0), 0);
      const totalSold = room.events.reduce((acc, e) =>
        acc + e.tickets.reduce((a, t) => a + t.sold, 0), 0);
      const totalCheckins = room.events.reduce((acc, e) =>
        acc + e._count.checkins, 0);

      return {
        id:            room.id,
        name:          room.name,
        type:          room.type,
        capacity:      room.capacity,
        sectors:       room.sectors,
        totalEvents:   room.events.length,
        totalSold,
        totalCapacity,
        totalCheckins,
        occupancyRate: totalCapacity > 0
          ? Math.round((totalSold / totalCapacity) * 100)
          : 0,
      };
    });

    return res.status(200).json({ occupancy: occupancyData });
  } catch (err) {
    console.error("Erro ao buscar relatório de ocupação:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = { getStats, getFinancial, getOccupancy };