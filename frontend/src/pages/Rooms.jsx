import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, ResponsiveContainer,
} from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const ROOMS = [
  {
    id: 1, name: "Auditório Principal", type: "Auditório",
    sectors: 4, capacity: 500, occupancy: 87,
    status: "Ativa", location: "Teatro Municipal",
    updated: "12/05/2025 14:30", emoji: "🏛",
    color: "#705EBD",
  },
  {
    id: 2, name: "Cinema 01", type: "Cinema",
    sectors: 3, capacity: 280, occupancy: 78,
    status: "Ativa", location: "Teatro Municipal",
    updated: "10/05/2025 09:15", emoji: "🎬",
    color: "#4A90D9",
  },
  {
    id: 3, name: "Arena Eventos", type: "Arena",
    sectors: 5, capacity: 1200, occupancy: 92,
    status: "Ativa", location: "Centro de Eventos",
    updated: "11/05/2025 16:45", emoji: "🏟",
    color: "#22C55E",
  },
  {
    id: 4, name: "Sala Multiuso 02", type: "Multiuso",
    sectors: 2, capacity: 150, occupancy: 0,
    status: "Inativa", location: "Centro de Eventos",
    updated: "02/05/2025 10:00", emoji: "🏢",
    color: "#EF4444",
  },
  {
    id: 5, name: "Teatro Municipal", type: "Teatro",
    sectors: 3, capacity: 650, occupancy: 65,
    status: "Ativa", location: "Teatro Municipal",
    updated: "08/05/2025 11:20", emoji: "🎭",
    color: "#F59E0B",
  },
  {
    id: 6, name: "Mezanino VIP", type: "Camarote",
    sectors: 1, capacity: 80, occupancy: 55,
    status: "Ativa", location: "Teatro Municipal",
    updated: "07/05/2025 13:10", emoji: "🥂",
    color: "#D97706",
  },
  {
    id: 7, name: "Sala de Reuniões 01", type: "Reunião",
    sectors: 1, capacity: 20, occupancy: 30,
    status: "Ativa", location: "Centro de Eventos",
    updated: "06/05/2025 15:20", emoji: "💼",
    color: "#06B6D4",
  },
];

const TYPE_COLORS = {
  Auditório: "#705EBD",
  Cinema:    "#4A90D9",
  Arena:     "#22C55E",
  Teatro:    "#F59E0B",
  Multiuso:  "#06B6D4",
  Camarote:  "#D97706",
  Reunião:   "#EC4899",
};

const METRIC_CARDS = [
  {
    title: "Total de Salas",
    value: "24",
    trend: "+12%",
    sub: "em relação ao mês passado",
    icon: "🏛",
    color: "#705EBD",
    sparkData: [10,12,14,13,16,18,17,20,22,24],
  },
  {
    title: "Salas Ativas",
    value: "20",
    trend: null,
    sub: "83% do total",
    icon: "📅",
    color: "#22C55E",
    sparkData: [14,15,16,15,17,18,17,19,20,20],
  },
  {
    title: "Capacidade Total",
    value: "12.850",
    trend: null,
    sub: "lugares disponíveis",
    icon: "🪑",
    color: "#F59E0B",
    sparkData: [8000,9000,9500,10000,10500,11000,11500,12000,12500,12850],
  },
  {
    title: "Taxa de Ocupação Média",
    value: "87%",
    trend: "Excelente",
    sub: "",
    icon: "📊",
    color: "#F59E0B",
    sparkData: [55,60,65,70,68,72,75,80,84,87],
  },
];

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard",        path: "/"          },
  { icon: "🏛", label: "Salas",            path: "/rooms",    active: true },
  { icon: "📅", label: "Eventos",          path: "/events"    },
  { icon: "📆", label: "Calendário",       path: "/"          },
  { icon: "🎫", label: "Reservas",         path: "/"          },
  { icon: "👥", label: "Clientes",         path: "/"          },
  { icon: "💰", label: "Financeiro",       path: "/"          },
  { icon: "📊", label: "Relatórios",       path: "/"          },
  { icon: "⏳", label: "Listas de Espera", path: "/"          },
  { icon: "✅", label: "Check-in",         path: "/"          },
  { icon: "⚙",  label: "Configurações",   path: "/"          },
];

const ITEMS_PER_PAGE = 7;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Rooms() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [tab,       setTab]       = useState("Todas as Salas");
  const [viewMode,  setViewMode]  = useState("grid"); // grid | list
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("Todos os tipos");
  const [page,      setPage]      = useState(1);

  // filtrar salas
  const filtered = ROOMS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "Todos os tipos" || r.type === typeFilter;
    const matchTab    =
      tab === "Todas as Salas" ? true :
      tab === "Ativas"         ? r.status === "Ativa"   :
      tab === "Inativas"       ? r.status === "Inativa" : true;
    return matchSearch && matchType && matchTab;
  });

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const cardRooms   = ROOMS.filter((r) => r.status === "Ativa").slice(0, 4);

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
      <Sidebar theme={t} navigate={navigate} />

      {/* ── CONTEÚDO ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* TOPBAR */}
        <Topbar
          theme={t}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          search={search}
          setSearch={setSearch}
        />

        {/* BODY */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* METRIC CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {METRIC_CARDS.map((card) => (
              <MetricCard key={card.title} card={card} theme={t} />
            ))}
          </div>

          {/* CARDS DE SALA (top 4) */}
          <div>
            {/* tabs + filtros */}
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                marginBottom:   16,
                flexWrap:       "wrap",
                gap:            10,
              }}
            >
              {/* tabs */}
              <div style={{ display: "flex", gap: 0 }}>
                {["Todas as Salas","Ativas","Inativas","Modelos"].map((tb) => (
                  <button
                    key={tb}
                    onClick={() => { setTab(tb); setPage(1); }}
                    style={{
                      padding:      "8px 16px",
                      border:       "none",
                      background:   "transparent",
                      cursor:       "pointer",
                      fontSize:     13,
                      fontWeight:   tab === tb ? 700 : 400,
                      color:        tab === tb ? t.primary : t.textMuted,
                      borderBottom: tab === tb ? `2px solid ${t.primary}` : "2px solid transparent",
                      fontFamily:   "inherit",
                      transition:   "all 0.15s",
                    }}
                  >
                    {tb}
                  </button>
                ))}
              </div>

              {/* filtros lado direito */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* busca */}
                <div
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          6,
                    background:   t.surface,
                    border:       `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding:      "6px 10px",
                  }}
                >
                  <span style={{ color: t.textMuted, fontSize: 12 }}>🔍</span>
                  <input
                    placeholder="Buscar sala..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{
                      background: "none", border: "none", color: t.text,
                      fontSize: 12, outline: "none", width: 130, fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* tipo */}
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  style={{
                    background: t.surface, border: `1px solid ${t.border}`,
                    borderRadius: 8, color: t.text, fontSize: 12,
                    padding: "7px 10px", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {["Todos os tipos","Auditório","Cinema","Arena","Teatro","Multiuso","Camarote","Reunião"]
                    .map((o) => <option key={o}>{o}</option>)}
                </select>

                {/* setores */}
                <select
                  style={{
                    background: t.surface, border: `1px solid ${t.border}`,
                    borderRadius: 8, color: t.text, fontSize: 12,
                    padding: "7px 10px", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <option>Todos os setores</option>
                  <option>Plateia</option>
                  <option>Mezanino</option>
                  <option>VIP</option>
                </select>

                {/* filtros btn */}
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 8,
                    border: `1px solid ${t.border}`, background: t.surface,
                    color: t.text, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  🔧 Filtros
                </button>

                {/* toggle view */}
                <div
                  style={{
                    display: "flex", background: t.bg,
                    borderRadius: 8, padding: 3, gap: 2,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  {[{id:"grid",icon:"⊞"},{id:"list",icon:"☰"}].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: "none",
                        cursor: "pointer", fontSize: 14,
                        background: viewMode === v.id ? t.primary : "transparent",
                        color:      viewMode === v.id ? "#fff" : t.textMuted,
                        transition: "all 0.15s",
                      }}
                    >
                      {v.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GRID DE CARDS (top 4) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
              {cardRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  theme={t}
                  onEdit={() => navigate(`/rooms/${room.id}/edit`)}
                />
              ))}
            </div>

            {/* TABELA */}
            <RoomsTable
              rooms={paginated}
              theme={t}
              onEdit={(id) => navigate(`/rooms/${id}/edit`)}
              typeColors={TYPE_COLORS}
            />

            {/* PAGINAÇÃO */}
            <Pagination
              page={page}
              totalPages={totalPages}
              total={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPage={setPage}
              theme={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ theme: t, navigate }) {
  return (
    <div
      style={{
        width: 185, background: t.surface,
        borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column",
        flexShrink: 0, overflow: "hidden",
      }}
    >
      {/* logo */}
      <div
        style={{
          padding: "20px 16px 16px", display: "flex",
          alignItems: "center", gap: 10,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #705EBD, #A78BFA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "#fff", flexShrink: 0,
          }}
        >V</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: t.text }}>VenueFlow</div>
          <span
            style={{
              fontSize: 10, fontWeight: 600, color: t.primary,
              background: `${t.primary}22`, padding: "1px 5px", borderRadius: 4,
            }}
          >AI</span>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
              background: item.active ? `${t.primary}22` : "transparent",
              color:      item.active ? t.primary : t.textMuted,
              fontWeight: item.active ? 700 : 400, fontSize: 13, transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* rodapé sidebar */}
      <div style={{ padding: "12px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #705EBD22, #A78BFA11)",
            borderRadius: 10, padding: "10px 12px",
            border: "1px solid #705EBD33",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: t.primary, marginBottom: 4 }}>
            ✨ Dica da IA
          </div>
          <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.5 }}>
            Você possui 4 salas com baixa ocupação esta semana. Considere revisar
            os preços ou promover os eventos.
          </div>
          <button
            style={{
              marginTop: 6, width: "100%", padding: "5px", borderRadius: 6,
              border: "none", background: "linear-gradient(135deg, #705EBD, #A78BFA)",
              color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Ver insights
          </button>
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 4px", cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #705EBD, #A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}
          >VS</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Vinicios Souza</div>
            <div style={{ fontSize: 10, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
function Topbar({ theme: t, darkMode, toggleDarkMode, search, setSearch }) {
  return (
    <div
      style={{
        padding: "16px 24px 0", display: "flex",
        alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>Salas</div>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
          Gerencie todas as salas e espaços do seu negócio.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: "8px 12px", width: 280,
          }}
        >
          <span style={{ color: t.textMuted, fontSize: 13 }}>🔍</span>
          <input
            placeholder="Buscar por nome, tipo ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "none", border: "none", color: t.text,
              fontSize: 12, outline: "none", flex: 1, fontFamily: "inherit",
            }}
          />
          <span
            style={{
              fontSize: 10, color: t.textMuted, background: t.bg,
              padding: "2px 5px", borderRadius: 4, border: `1px solid ${t.border}`,
            }}
          >/</span>
        </div>

        <button
          onClick={toggleDarkMode}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: `1px solid ${t.border}`, background: t.surface,
            cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >{darkMode ? "☀" : "🌙"}</button>

        <button
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: `1px solid ${t.border}`, background: t.surface,
            cursor: "pointer", fontSize: 16, position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          🔔
          <span
            style={{
              position: "absolute", top: 4, right: 4,
              width: 14, height: 14, borderRadius: "50%",
              background: "#EF4444", fontSize: 9, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >3</span>
        </button>

        <button
          style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: t.primary, color: "#fff", fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}
        >+ Nova Sala</button>
      </div>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ card, theme: t }) {
  return (
    <div
      style={{
        background: t.surface, borderRadius: 12, padding: 16,
        border: `1px solid ${t.border}`, display: "flex",
        flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginBottom: 4 }}>
            {card.title}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{card.value}</div>
        </div>
        <div
          style={{
            width: 42, height: 42, borderRadius: 10,
            background: `${card.color}22`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}
        >{card.icon}</div>
      </div>

      <div style={{ height: 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.sparkData.map((v,i) => ({i,v}))}>
            <Area type="monotone" dataKey="v" stroke={card.color} fill={`${card.color}22`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
        {card.trend && (
          <span style={{ color: "#22C55E", fontWeight: 700 }}>↑ {card.trend}</span>
        )}
        <span style={{ color: t.textMuted }}>{card.sub}</span>
        {card.trend === "Excelente" && (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
        )}
      </div>
    </div>
  );
}

// ─── ROOM CARD ────────────────────────────────────────────────────────────────
function RoomCard({ room, theme: t, onEdit }) {
  const statusColor = room.status === "Ativa" ? "#22C55E" : "#EF4444";

  return (
    <div
      style={{
        background: t.surface, borderRadius: 12,
        border: `1px solid ${t.border}`, overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* imagem / placeholder */}
      <div
        style={{
          height: 110, background: `linear-gradient(135deg, ${room.color}33, ${room.color}11)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, position: "relative",
        }}
      >
        {room.emoji}
        {/* status badge */}
        <span
          style={{
            position: "absolute", top: 10, left: 10,
            fontSize: 10, fontWeight: 700, color: statusColor,
            background: `${statusColor}22`, padding: "3px 8px",
            borderRadius: 20,
          }}
        >{room.status}</span>
        {/* ações */}
        <div
          style={{
            position: "absolute", top: 8, right: 8,
            display: "flex", gap: 4,
          }}
        >
          <button
            onClick={onEdit}
            style={{
              padding: "3px 10px", borderRadius: 6, border: "none",
              background: t.primary, color: "#fff",
              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >Editar</button>
          <button
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: `1px solid ${t.border}`, background: t.surface,
              color: t.textMuted, cursor: "pointer", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >···</button>
        </div>
      </div>

      {/* info */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{room.name}</div>

        <div style={{ display: "flex", gap: 16 }}>
          {[
            { val: room.capacity.toLocaleString(), label: "Lugares"   },
            { val: room.sectors,                   label: "Setores"   },
            { val: `${room.occupancy}%`,           label: "Ocupação"  },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{s.val}</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: t.textMuted, display: "flex", flexDirection: "column", gap: 2 }}>
          <span>📍 {room.location}</span>
          <span>🕐 Atualizado em {room.updated}</span>
        </div>
      </div>
    </div>
  );
}

// ─── TABELA ───────────────────────────────────────────────────────────────────
function RoomsTable({ rooms, theme: t, onEdit, typeColors }) {
  const headers = ["Nome da Sala","Tipo","Setores","Capacidade","Ocupação Média","Status","Última Atualização","Ações"];

  return (
    <div
      style={{
        background: t.surface, borderRadius: 12,
        border: `1px solid ${t.border}`, overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${t.border}` }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: "12px 14px", textAlign: "left",
                  fontSize: 11, fontWeight: 700, color: t.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {h}{["Nome da Sala","Status","Última Atualização"].includes(h) ? " ↕" : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, i) => (
            <tr
              key={room.id}
              style={{
                borderBottom: i < rooms.length - 1 ? `1px solid ${t.border}` : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* nome */}
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `${room.color}22`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}
                  >{room.emoji}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{room.name}</span>
                </div>
              </td>

              {/* tipo */}
              <td style={{ padding: "12px 14px" }}>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700,
                    color: typeColors[room.type] || t.textMuted,
                    background: `${typeColors[room.type] || t.border}22`,
                    padding: "3px 8px", borderRadius: 20,
                  }}
                >{room.type}</span>
              </td>

              {/* setores */}
              <td style={{ padding: "12px 14px", fontSize: 13, color: t.text, textAlign: "center" }}>
                {room.sectors}
              </td>

              {/* capacidade */}
              <td style={{ padding: "12px 14px", fontSize: 13, color: t.text, textAlign: "center" }}>
                {room.capacity.toLocaleString()}
              </td>

              {/* ocupação */}
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.text, minWidth: 32 }}>
                    {room.occupancy}%
                  </span>
                  <div style={{ flex: 1, height: 6, background: t.border, borderRadius: 3, overflow: "hidden", minWidth: 80 }}>
                    <div
                      style={{
                        height: "100%", width: `${room.occupancy}%`,
                        background: "linear-gradient(90deg, #705EBD, #A78BFA)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              </td>

              {/* status */}
              <td style={{ padding: "12px 14px" }}>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700,
                    color:      room.status === "Ativa" ? "#22C55E" : "#EF4444",
                    display:    "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: room.status === "Ativa" ? "#22C55E" : "#EF4444",
                      display: "inline-block",
                    }}
                  />
                  {room.status}
                </span>
              </td>

              {/* última atualização */}
              <td style={{ padding: "12px 14px", fontSize: 12, color: t.textMuted }}>
                {room.updated}
              </td>

              {/* ações */}
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => onEdit(room.id)}
                    title="Editar"
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      border: `1px solid ${t.border}`, background: "transparent",
                      color: t.textMuted, cursor: "pointer", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >✏</button>
                  <button
                    title="Duplicar"
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      border: `1px solid ${t.border}`, background: "transparent",
                      color: t.textMuted, cursor: "pointer", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >⧉</button>
                  <button
                    title="Mais opções"
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      border: `1px solid ${t.border}`, background: "transparent",
                      color: t.textMuted, cursor: "pointer", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >···</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PAGINAÇÃO ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, itemsPerPage, onPage, theme: t }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = (page - 1) * itemsPerPage + 1;
  const end   = Math.min(page * itemsPerPage, total);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 0", marginTop: 4,
      }}
    >
      <span style={{ fontSize: 12, color: t.textMuted }}>
        Mostrando {start} a {end} de {total} salas
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            width: 30, height: 30, borderRadius: 6,
            border: `1px solid ${t.border}`, background: "transparent",
            color: page === 1 ? t.border : t.text, cursor: page === 1 ? "default" : "pointer",
            fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >‹</button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            style={{
              width: 30, height: 30, borderRadius: 6,
              border: `1px solid ${p === page ? t.primary : t.border}`,
              background: p === page ? t.primary : "transparent",
              color: p === page ? "#fff" : t.text,
              cursor: "pointer", fontSize: 13, fontWeight: p === page ? 700 : 400,
              fontFamily: "inherit",
            }}
          >{p}</button>
        ))}

        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            width: 30, height: 30, borderRadius: 6,
            border: `1px solid ${t.border}`, background: "transparent",
            color: page === totalPages ? t.border : t.text,
            cursor: page === totalPages ? "default" : "pointer",
            fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >›</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: t.textMuted }}>
        Itens por página:
        <select
          style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 6, color: t.text, fontSize: 12,
            padding: "3px 6px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <option>10</option>
          <option>20</option>
          <option>50</option>
        </select>
      </div>
    </div>
  );
}