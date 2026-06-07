import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const OCCUPANCY_DATA = [
  { date: "08 Mai", value: 62 },
  { date: "09 Mai", value: 58 },
  { date: "10 Mai", value: 71 },
  { date: "11 Mai", value: 65 },
  { date: "12 Mai", value: 87 },
  { date: "13 Mai", value: 79 },
  { date: "14 Mai", value: 74 },
];

const ROOMS_DATA = [
  { name: "Auditório Principal", occupancy: 94, trend: +12, img: "🏛" },
  { name: "Cinema 01",           occupancy: 82, trend: +7,  img: "🎬" },
  { name: "Arena Eventos",       occupancy: 78, trend: +4,  img: "🏟" },
  { name: "Teatro Municipal",    occupancy: 65, trend: -3,  img: "🎭" },
  { name: "Sala Multiuso 02",    occupancy: 48, trend: +2,  img: "🏢" },
];

const EVENTS_TODAY = [
  { name: "Show de Inverno 2025",  time: "20:00", room: "Auditório Principal", sold: 482, total: 500,  status: "Em andamento" },
  { name: "Congresso Tech",        time: "09:00", room: "Sala 02",             sold: 120, total: 150,  status: "Em andamento" },
  { name: "Peça: Além do Tempo",   time: "19:30", room: "Teatro Municipal",    sold: 320, total: 400,  status: "Agendado"     },
  { name: "Workshop de Design",    time: "14:00", room: "Sala 03",             sold: 45,  total: 60,   status: "Agendado"     },
];

const NEXT_EVENTS = [
  { day: "16", month: "MAI", name: "Congresso Tech 2025",    room: "Auditório Principal", capacity: 500,   tag: "Amanhã"    },
  { day: "18", month: "MAI", name: "Show de Inverno 2025",   room: "Arena Eventos",       capacity: 1200,  tag: "Em 2 dias" },
  { day: "20", month: "MAI", name: "Workshop de Marketing",  room: "Sala Multiuso 01",    capacity: 60,    tag: "Em 4 dias" },
  { day: "23", month: "MAI", name: "Fórum de Inovação",      room: "Auditório Principal", capacity: 450,   tag: "Em 7 dias" },
];

const WAITLIST = [
  { name: "Show de Inverno 2025", count: 43 },
  { name: "Congresso Tech",       count: 18 },
  { name: "Peça: Além do Tempo",  count: 12 },
  { name: "Fórum de Inovação",    count: 9  },
];

const FINANCIAL_DATA = [
  { name: "PIX",    value: 42, amount: "R$ 37.990,00", color: "#705EBD" },
  { name: "Cartão", value: 40, amount: "R$ 35.800,00", color: "#4A90D9" },
  { name: "Boleto", value: 18, amount: "R$ 16.110,00", color: "#F59E0B" },
];

const METRIC_CARDS = [
  {
    title: "Total de Salas",
    value: "24",
    trend: "+12%",
    trendUp: true,
    label: "este mês",
    icon: "🏛",
    color: "#705EBD",
    sparkData: [40, 45, 42, 50, 55, 52, 60, 58, 62, 65],
  },
  {
    title: "Eventos",
    value: "132",
    trend: "+8%",
    trendUp: true,
    label: "este mês",
    icon: "📅",
    color: "#EF4444",
    sparkData: [80, 85, 90, 88, 92, 95, 100, 105, 110, 132],
  },
  {
    title: "Receita Mensal",
    value: "R$ 89.500,00",
    trend: "+21%",
    trendUp: true,
    label: "este mês",
    icon: "💰",
    color: "#22C55E",
    sparkData: [60, 65, 70, 68, 72, 75, 80, 78, 85, 89],
  },
  {
    title: "Taxa de Ocupação",
    value: "87%",
    trend: "Excelente",
    trendUp: true,
    label: "",
    icon: "📈",
    color: "#F59E0B",
    sparkData: [55, 60, 65, 70, 68, 72, 75, 80, 84, 87],
  },
];

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard",       active: true  },
  { icon: "🏛", label: "Salas",           active: false },
  { icon: "📅", label: "Eventos",         active: false },
  { icon: "📆", label: "Calendário",      active: false },
  { icon: "🎫", label: "Reservas",        active: false },
  { icon: "👥", label: "Clientes",        active: false },
  { icon: "💰", label: "Financeiro",      active: false },
  { icon: "📊", label: "Relatórios",      active: false },
  { icon: "⏳", label: "Listas de Espera", active: false },
  { icon: "✅", label: "Check-in",        active: false },
  { icon: "⚙", label: "Configurações",   active: false },
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t = darkMode ? THEME.dark : THEME.light;
  const [period, setPeriod] = useState("7 dias");

  return (
    <div
      style={{
        display:    "flex",
        height:     "100vh",
        width:      "100vw",
        background: t.bg,
        color:      t.text,
        fontFamily: "'Sora', system-ui, sans-serif",
        overflow:   "hidden",
        position:   "fixed",
        top: 0, left: 0,
      }}
    >
      {/* ── SIDEBAR ── */}
      <Sidebar theme={t} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div
        style={{
          flex:      1,
          display:   "flex",
          flexDirection: "column",
          overflow:  "hidden",
          minWidth:  0,
        }}
      >
        {/* TOPBAR */}
        <Topbar theme={t} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* BODY */}
        <div
          style={{
            flex:      1,
            overflowY: "auto",
            padding:   "24px",
            display:   "flex",
            flexDirection: "column",
            gap:       20,
          }}
        >
          {/* METRIC CARDS */}
          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap:                 16,
            }}
          >
            {METRIC_CARDS.map((card) => (
              <MetricCard key={card.title} card={card} theme={t} />
            ))}
          </div>

          {/* LINHA 2: GRÁFICO + EVENTOS HOJE */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap:     16,
            }}
          >
            <OccupancyChart
              data={OCCUPANCY_DATA}
              theme={t}
              period={period}
              setPeriod={setPeriod}
            />
            <EventsToday events={EVENTS_TODAY} theme={t} />
          </div>

          {/* LINHA 3: SALAS + PRÓXIMOS EVENTOS + WAITLIST + FINANCEIRO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 340px",
              gap:     16,
            }}
          >
            <TopRooms rooms={ROOMS_DATA} theme={t} />
            <NextEvents events={NEXT_EVENTS} theme={t} />
            <RightColumn
              waitlist={WAITLIST}
              financial={FINANCIAL_DATA}
              theme={t}
            />
          </div>

          {/* LINHA 4: FOOTER METRICS */}
          <FooterMetrics theme={t} />
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ theme: t }) {
  return (
    <div
      style={{
        width:         185,
        background:    t.surface,
        borderRight:   `1px solid ${t.border}`,
        display:       "flex",
        flexDirection: "column",
        flexShrink:    0,
        overflow:      "hidden",
      }}
    >
      {/* logo */}
      <div
        style={{
          padding:    "20px 16px 16px",
          display:    "flex",
          alignItems: "center",
          gap:        10,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            width:          34,
            height:         34,
            borderRadius:   10,
            background:     "linear-gradient(135deg, #705EBD, #A78BFA)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontWeight:     900,
            fontSize:       16,
            color:          "#fff",
            flexShrink:     0,
          }}
        >
          V
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: t.text }}>
            VenueFlow
          </div>
          <span
            style={{
              fontSize:   10,
              fontWeight: 600,
              color:      t.primary,
              background: `${t.primary}22`,
              padding:    "1px 5px",
              borderRadius: 4,
            }}
          >
            AI
          </span>
        </div>
      </div>

      {/* nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              padding:      "9px 10px",
              borderRadius: 8,
              cursor:       "pointer",
              marginBottom: 2,
              background:   item.active ? `${t.primary}22` : "transparent",
              color:        item.active ? t.primary : t.textMuted,
              fontWeight:   item.active ? 700 : 400,
              fontSize:     13,
              transition:   "all 0.15s",
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* plano */}
      <div
        style={{
          padding:      "12px",
          borderTop:    `1px solid ${t.border}`,
          display:      "flex",
          flexDirection: "column",
          gap:          8,
        }}
      >
        <div
          style={{
            background:   `${t.primary}22`,
            borderRadius: 10,
            padding:      "10px 12px",
            border:       `1px solid ${t.primary}44`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: t.primary }}>
            Plano Profissional
          </div>
          <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
            Renova em 24/06/2025
          </div>
          <button
            style={{
              marginTop:    6,
              width:        "100%",
              padding:      "5px",
              borderRadius: 6,
              border:       `1px solid ${t.primary}`,
              background:   "transparent",
              color:        t.primary,
              fontSize:     11,
              fontWeight:   700,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            Ver planos
          </button>
        </div>

        {/* IA insight */}
        <div
          style={{
            background:   "linear-gradient(135deg, #705EBD22, #A78BFA11)",
            borderRadius: 10,
            padding:      "10px 12px",
            border:       `1px solid #705EBD33`,
          }}
        >
          <div
            style={{
              fontSize:   11,
              fontWeight: 700,
              color:      t.primary,
              marginBottom: 4,
              display:    "flex",
              alignItems: "center",
              gap:        4,
            }}
          >
            ✨ Dica da IA
          </div>
          <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.5 }}>
            O Auditório Principal possui ocupação média de 94%. Considere aumentar
            o valor dos assentos VIP em 10%.
          </div>
          <button
            style={{
              marginTop:    6,
              width:        "100%",
              padding:      "5px",
              borderRadius: 6,
              border:       "none",
              background:   "linear-gradient(135deg, #705EBD, #A78BFA)",
              color:        "#fff",
              fontSize:     11,
              fontWeight:   700,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            Ver mais insights
          </button>
        </div>

        {/* usuário */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        8,
            padding:    "6px 4px",
            cursor:     "pointer",
          }}
        >
          <div
            style={{
              width:          32,
              height:         32,
              borderRadius:   "50%",
              background:     "linear-gradient(135deg, #705EBD, #A78BFA)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       12,
              fontWeight:     700,
              color:          "#fff",
              flexShrink:     0,
            }}
          >
            VS
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>
              Vinicios Souza
            </div>
            <div
              style={{
                fontSize:     10,
                color:        t.textMuted,
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}
            >
              admin@teatromun...
            </div>
          </div>
          <span style={{ fontSize: 12, color: t.textMuted, marginLeft: "auto" }}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ theme: t, darkMode, toggleDarkMode }) {
  return (
    <div
      style={{
        padding:        "16px 24px 0",
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        flexShrink:     0,
      }}
    >
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>
          Bom dia, Vinicios 👋
        </div>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
          Aqui está o resumo geral da sua operação hoje.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* busca */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            background:   t.surface,
            border:       `1px solid ${t.border}`,
            borderRadius: 8,
            padding:      "8px 12px",
            width:        260,
          }}
        >
          <span style={{ color: t.textMuted, fontSize: 13 }}>🔍</span>
          <input
            placeholder="Buscar por salas, eventos, clientes..."
            style={{
              background: "none",
              border:     "none",
              color:      t.text,
              fontSize:   12,
              outline:    "none",
              flex:       1,
              fontFamily: "inherit",
            }}
          />
          <span
            style={{
              fontSize:     10,
              color:        t.textMuted,
              background:   t.bg,
              padding:      "2px 5px",
              borderRadius: 4,
              border:       `1px solid ${t.border}`,
            }}
          >
            /
          </span>
        </div>

        {/* dark mode */}
        <button
          onClick={toggleDarkMode}
          style={{
            width:          36,
            height:         36,
            borderRadius:   8,
            border:         `1px solid ${t.border}`,
            background:     t.surface,
            cursor:         "pointer",
            fontSize:       16,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          {darkMode ? "☀" : "🌙"}
        </button>

        {/* notificações */}
        <button
          style={{
            width:          36,
            height:         36,
            borderRadius:   8,
            border:         `1px solid ${t.border}`,
            background:     t.surface,
            cursor:         "pointer",
            fontSize:       16,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            position:       "relative",
          }}
        >
          🔔
          <span
            style={{
              position:       "absolute",
              top:            4,
              right:          4,
              width:          14,
              height:         14,
              borderRadius:   "50%",
              background:     "#EF4444",
              fontSize:       9,
              fontWeight:     700,
              color:          "#fff",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </button>

        {/* nova sala */}
        <button
          style={{
            padding:      "8px 16px",
            borderRadius: 8,
            border:       "none",
            background:   t.primary,
            color:        "#fff",
            fontWeight:   700,
            fontSize:     13,
            cursor:       "pointer",
            fontFamily:   "inherit",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            whiteSpace:   "nowrap",
          }}
        >
          + Nova Sala ▾
        </button>
      </div>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ card, theme: t }) {
  return (
    <div
      style={{
        background:   t.surface,
        borderRadius: 12,
        padding:      "16px",
        border:       `1px solid ${t.border}`,
        display:      "flex",
        flexDirection: "column",
        gap:          8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginBottom: 4 }}>
            {card.title}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>
            {card.value}
          </div>
        </div>
        <div
          style={{
            width:          42,
            height:         42,
            borderRadius:   10,
            background:     `${card.color}22`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       20,
          }}
        >
          {card.icon}
        </div>
      </div>

      {/* sparkline */}
      <div style={{ height: 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.sparkData.map((v, i) => ({ i, v }))}>
            <Area
              type="monotone"
              dataKey="v"
              stroke={card.color}
              fill={`${card.color}22`}
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span
          style={{
            color:      card.trendUp ? "#22C55E" : "#EF4444",
            fontWeight: 700,
          }}
        >
          {card.trendUp ? "↑" : "↓"} {card.trend}
        </span>
        {card.label && (
          <span style={{ color: t.textMuted }}>{card.label}</span>
        )}
        {!card.label && (
          <span
            style={{
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   "#F59E0B",
              display:      "inline-block",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── OCCUPANCY CHART ──────────────────────────────────────────────────────────
function OccupancyChart({ data, theme: t, period, setPeriod }) {
  const PERIODS = ["Hoje", "7 dias", "30 dias", "90 dias", "Personalizado"];

  return (
    <div
      style={{
        background:   t.surface,
        borderRadius: 12,
        padding:      "18px 20px",
        border:       `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
            Taxa de Ocupação
          </span>
          <span style={{ fontSize: 14, color: t.textMuted }}>ⓘ</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding:      "4px 10px",
                borderRadius: 6,
                border:       "none",
                cursor:       "pointer",
                fontSize:     12,
                fontWeight:   period === p ? 700 : 400,
                background:   period === p ? t.primary : "transparent",
                color:        period === p ? "#fff" : t.textMuted,
                fontFamily:   "inherit",
                transition:   "all 0.15s",
              }}
            >
              {p}
            </button>
          ))}
          <button
            style={{
              width:          28,
              height:         28,
              borderRadius:   6,
              border:         `1px solid ${t.border}`,
              background:     "transparent",
              color:          t.textMuted,
              cursor:         "pointer",
              fontSize:       14,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            ···
          </button>
        </div>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#705EBD" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#705EBD" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: t.textMuted }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: t.textMuted }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background:   t.surface,
                border:       `1px solid ${t.border}`,
                borderRadius: 8,
                fontSize:     12,
                color:        t.text,
              }}
              formatter={(v) => [`${v}%`, "Ocupação"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#705EBD"
              strokeWidth={2}
              fill="url(#occupancyGrad)"
              dot={{ fill: "#705EBD", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── EVENTS TODAY ─────────────────────────────────────────────────────────────
function EventsToday({ events, theme: t }) {
  const statusColor = {
    "Em andamento": "#705EBD",
    "Agendado":     "#F59E0B",
  };

  return (
    <div
      style={{
        background:   t.surface,
        borderRadius: 12,
        padding:      "18px",
        border:       `1px solid ${t.border}`,
        display:      "flex",
        flexDirection: "column",
        gap:          0,
      }}
    >
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   14,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
          Eventos Hoje
        </span>
        <button
          style={{
            background: "none",
            border:     "none",
            color:      t.primary,
            fontSize:   12,
            cursor:     "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          Ver todos
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((ev, i) => (
          <div
            key={i}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        10,
            }}
          >
            {/* thumb */}
            <div
              style={{
                width:          44,
                height:         44,
                borderRadius:   8,
                background:     `${t.primary}22`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       20,
                flexShrink:     0,
              }}
            >
              🎭
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize:     12,
                  fontWeight:   700,
                  color:        t.text,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}
              >
                {ev.name}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                🕐 {ev.time} · 📍 {ev.room}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span
                style={{
                  fontSize:     10,
                  fontWeight:   700,
                  color:        statusColor[ev.status] || t.textMuted,
                  background:   `${statusColor[ev.status] || t.border}22`,
                  padding:      "2px 7px",
                  borderRadius: 20,
                  whiteSpace:   "nowrap",
                }}
              >
                {ev.status}
              </span>
              <span style={{ fontSize: 10, color: t.textMuted }}>
                {ev.sold} / {ev.total}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOP ROOMS ────────────────────────────────────────────────────────────────
function TopRooms({ rooms, theme: t }) {
  return (
    <div
      style={{
        background:   t.surface,
        borderRadius: 12,
        padding:      "18px",
        border:       `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   14,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
          Salas Mais Utilizadas
        </span>
        <button
          style={{
            background: "none",
            border:     "none",
            color:      t.primary,
            fontSize:   12,
            cursor:     "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          Ver relatório
        </button>
      </div>

      {/* header da tabela */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 120px 80px",
          fontSize:            10,
          color:               t.textMuted,
          fontWeight:          700,
          textTransform:       "uppercase",
          letterSpacing:       0.5,
          padding:             "0 0 8px",
          borderBottom:        `1px solid ${t.border}`,
          marginBottom:        8,
        }}
      >
        <span>Sala</span>
        <span>Ocupação Média</span>
        <span style={{ textAlign: "right" }}>Tendência</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rooms.map((room, i) => (
          <div
            key={i}
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr 120px 80px",
              alignItems:          "center",
            }}
          >
            {/* nome */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width:          32,
                  height:         32,
                  borderRadius:   6,
                  background:     `${t.primary}22`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       14,
                  flexShrink:     0,
                }}
              >
                {room.img}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>
                {room.name}
              </span>
            </div>

            {/* barra de progresso */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  flex:         1,
                  height:       6,
                  background:   t.border,
                  borderRadius: 3,
                  overflow:     "hidden",
                }}
              >
                <div
                  style={{
                    height:       "100%",
                    width:        `${room.occupancy}%`,
                    background:   "linear-gradient(90deg, #705EBD, #A78BFA)",
                    borderRadius: 3,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize:  11,
                  fontWeight: 700,
                  color:     t.text,
                  minWidth:  28,
                }}
              >
                {room.occupancy}%
              </span>
            </div>

            {/* tendência */}
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize:   12,
                  fontWeight: 700,
                  color:      room.trend > 0 ? "#22C55E" : "#EF4444",
                }}
              >
                {room.trend > 0 ? "↑" : "↓"} {Math.abs(room.trend)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEXT EVENTS ──────────────────────────────────────────────────────────────
function NextEvents({ events, theme: t }) {
  return (
    <div
      style={{
        background:   t.surface,
        borderRadius: 12,
        padding:      "18px",
        border:       `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   14,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
          Próximos Eventos
        </span>
        <button
          style={{
            background: "none",
            border:     "none",
            color:      t.primary,
            fontSize:   12,
            cursor:     "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          Ver calendário
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.map((ev, i) => (
          <div
            key={i}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        12,
              padding:    "10px",
              borderRadius: 8,
              background: t.bg,
              border:     `1px solid ${t.border}`,
            }}
          >
            {/* data */}
            <div
              style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                width:          40,
                height:         40,
                borderRadius:   8,
                background:     `${t.primary}22`,
                flexShrink:     0,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: t.primary, lineHeight: 1 }}>
                {ev.day}
              </span>
              <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}>
                {ev.month}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize:     12,
                  fontWeight:   700,
                  color:        t.text,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}
              >
                {ev.name}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                📍 {ev.room} · 🪑 {ev.capacity.toLocaleString()} lugares
              </div>
            </div>

            <span
              style={{
                fontSize:     10,
                fontWeight:   700,
                color:        t.primary,
                background:   `${t.primary}22`,
                padding:      "3px 8px",
                borderRadius: 20,
                whiteSpace:   "nowrap",
                flexShrink:   0,
              }}
            >
              {ev.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RIGHT COLUMN: WAITLIST + FINANCIAL ───────────────────────────────────────
function RightColumn({ waitlist, financial, theme: t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* waitlist */}
      <div
        style={{
          background:   t.surface,
          borderRadius: 12,
          padding:      "18px",
          border:       `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            marginBottom:   12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
            Lista de Espera
          </span>
          <button
            style={{
              background: "none",
              border:     "none",
              color:      t.primary,
              fontSize:   12,
              cursor:     "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            Ver todas
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {waitlist.map((item, i) => (
            <div
              key={i}
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width:          28,
                    height:         28,
                    borderRadius:   "50%",
                    background:     `${t.primary}22`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       12,
                  }}
                >
                  👤
                </div>
                <span
                  style={{
                    fontSize:     12,
                    color:        t.text,
                    fontWeight:   500,
                    maxWidth:     140,
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}
                >
                  {item.name}
                </span>
              </div>
              <span
                style={{
                  fontSize:   12,
                  fontWeight: 700,
                  color:      t.textMuted,
                }}
              >
                <strong style={{ color: t.text }}>{item.count}</strong> pessoas
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* resumo financeiro */}
      <div
        style={{
          background:   t.surface,
          borderRadius: 12,
          padding:      "18px",
          border:       `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            marginBottom:   12,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>
            Resumo Financeiro
          </span>
          <select
            style={{
              background:   t.bg,
              border:       `1px solid ${t.border}`,
              borderRadius: 6,
              color:        t.text,
              fontSize:     11,
              padding:      "3px 6px",
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            <option>Este mês</option>
            <option>Mês anterior</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* donut chart */}
          <div style={{ width: 90, height: 90, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financial}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={40}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {financial.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* legenda */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: t.textMuted }}>Receita Total</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>
              R$ 89.500,00
            </div>
            {financial.map((item, i) => (
              <div
                key={i}
                style={{
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize:   10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width:        6,
                      height:       6,
                      borderRadius: "50%",
                      background:   item.color,
                    }}
                  />
                  <span style={{ color: t.textMuted }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: t.text }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <button
          style={{
            marginTop:    10,
            width:        "100%",
            padding:      "7px",
            borderRadius: 7,
            border:       `1px solid ${t.border}`,
            background:   "transparent",
            color:        t.primary,
            fontSize:     11,
            fontWeight:   700,
            cursor:       "pointer",
            fontFamily:   "inherit",
          }}
        >
          Ver relatório financeiro completo
        </button>
      </div>
    </div>
  );
}

// ─── FOOTER METRICS ───────────────────────────────────────────────────────────
function FooterMetrics({ theme: t }) {
  const metrics = [
    { icon: "✅", label: "Check-ins Hoje",  value: "1.245", trend: "+18%", up: true  },
    { icon: "❌", label: "Cancelamentos",   value: "32",    trend: "-5%",  up: false },
    { icon: "👥", label: "Novos Clientes",  value: "243",   trend: "+15%", up: true  },
    { icon: "⭐", label: "Avaliação Média", value: "4,8/5", trend: "+0,3", up: true  },
  ];

  return (
    <div
      style={{
        background:          t.surface,
        borderRadius:        12,
        padding:             "14px 20px",
        border:              `1px solid ${t.border}`,
        display:             "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap:                 16,
      }}
    >
      {metrics.map((m, i) => (
        <div
          key={i}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        10,
          }}
        >
          <span style={{ fontSize: 20 }}>{m.icon}</span>
          <div>
            <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>
              {m.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: t.text }}>
                {m.value}
              </span>
              <span
                style={{
                  fontSize:   11,
                  fontWeight: 700,
                  color:      m.up ? "#22C55E" : "#EF4444",
                }}
              >
                {m.up ? "↑" : "↓"} {m.trend}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}