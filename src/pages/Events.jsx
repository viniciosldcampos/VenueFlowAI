import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const EVENTS = [
  { id:1,  name:"Show de Inverno 2025",  room:"Teatro Municipal",    salas:1, date:"25/07/2025", time:"20:00", type:"Show",      sold:482,  total:500,  occupancy:96, status:"Em andamento", highlight:true  },
  { id:2,  name:"Congresso Tech",        room:"Centro de Eventos",   salas:3, date:"25/07/2025", time:"09:00", type:"Congresso", sold:120,  total:150,  occupancy:80, status:"Em andamento", highlight:false },
  { id:3,  name:"Peça: Além do Tempo",   room:"Teatro Municipal",    salas:1, date:"26/07/2025", time:"19:30", type:"Teatro",    sold:320,  total:400,  occupancy:80, status:"Agendado",     highlight:false },
  { id:4,  name:"Espetáculo Infantil",   room:"Teatro Municipal",    salas:1, date:"27/07/2025", time:"16:00", type:"Infantil",  sold:180,  total:300,  occupancy:60, status:"Agendado",     highlight:false },
  { id:5,  name:"Workshop de Design",    room:"Sala Multiuso 03",    salas:1, date:"28/07/2025", time:"14:00", type:"Workshop",  sold:45,   total:60,   occupancy:75, status:"Agendado",     highlight:false },
  { id:6,  name:"Palestra: Inovação",    room:"Auditório Principal", salas:1, date:"29/07/2025", time:"10:00", type:"Palestra",  sold:250,  total:500,  occupancy:50, status:"Agendado",     highlight:false },
  { id:7,  name:"Gala de Premiação 2025",room:"Auditório Principal", salas:2, date:"30/07/2025", time:"20:00", type:"Premiação", sold:350,  total:600,  occupancy:58, status:"Agendado",     highlight:false },
  { id:8,  name:"Festival de Música",    room:"Arena Eventos",       salas:2, date:"02/08/2025", time:"18:00", type:"Festival",  sold:820,  total:1000, occupancy:82, status:"Encerrado",    highlight:false },
  { id:9,  name:"Fórum de Inovação",     room:"Centro de Eventos",   salas:4, date:"05/08/2025", time:"09:00", type:"Fórum",     sold:420,  total:800,  occupancy:53, status:"Encerrado",    highlight:false },
  { id:10, name:"Expo Negócios 2025",    room:"Centro de Eventos",   salas:5, date:"10/05/2025", time:"08:00", type:"Exposição", sold:1200, total:1500, occupancy:80, status:"Cancelado",    highlight:false },
];

const TYPE_COLORS = {
  Show:      "#705EBD", Congresso: "#4A90D9", Teatro:    "#F59E0B",
  Infantil:  "#EC4899", Workshop:  "#D97706", Palestra:  "#06B6D4",
  Premiação: "#8B5CF6", Festival:  "#22C55E", Fórum:     "#0EA5E9",
  Exposição: "#EF4444",
};

const STATUS_COLORS = {
  "Em andamento": "#22C55E",
  "Agendado":     "#F59E0B",
  "Encerrado":    "#6B7280",
  "Cancelado":    "#EF4444",
};

const METRIC_CARDS = [
  { title:"Total de Eventos",   value:"132",           trend:"+18%", sub:"em relação ao mês passado", icon:"📅", color:"#705EBD", sparkData:[80,85,90,88,95,100,105,110,120,132] },
  { title:"Eventos Ativos",     value:"28",            trend:null,   sub:"Hoje e próximos 7 dias",    icon:"📅", color:"#22C55E", sparkData:[18,20,22,21,24,25,24,26,27,28] },
  { title:"Ingressos Vendidos", value:"45.780",        trend:"+22%", sub:"este mês",                  icon:"🎫", color:"#F59E0B", sparkData:[30000,32000,35000,33000,36000,38000,40000,42000,44000,45780] },
  { title:"Receita Gerada",     value:"R$ 89.500,00",  trend:"+21%", sub:"este mês",                  icon:"💰", color:"#4A90D9", sparkData:[60000,65000,70000,68000,72000,75000,80000,78000,85000,89500] },
];

const PIE_DATA = [
  { name:"Shows",      value:42, color:"#705EBD" },
  { name:"Congressos", value:28, color:"#4A90D9" },
  { name:"Teatros",    value:18, color:"#F59E0B" },
  { name:"Workshops",  value:16, color:"#D97706" },
  { name:"Palestras",  value:12, color:"#06B6D4" },
  { name:"Outros",     value:16, color:"#6B7280"  },
];

const TOP_ROOMS = [
  { name:"Auditório Principal", pct:94 },
  { name:"Arena Eventos",       pct:89 },
  { name:"Teatro Municipal",    pct:78 },
  { name:"Sala Multiuso 02",    pct:65 },
  { name:"Centro de Eventos",   pct:60 },
];

const CALENDAR_DAYS = [
  [29,30,1,2,3,4,5],
  [6,7,8,9,10,11,12],
  [13,14,15,16,17,18,19],
  [20,21,22,23,24,25,26],
  [27,28,29,30,31,1,2],
  [3,4,5,6,7,8,9],
];
const EVENT_DAYS   = [1,7,15,16,25,26,29,30];
const ONGOING_DAYS = [25];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"         },
  { icon:"🏛", label:"Salas",            path:"/rooms"    },
  { icon:"📅", label:"Eventos",          path:"/events",  active:true },
  { icon:"📆", label:"Calendário",       path:"/"         },
  { icon:"🎫", label:"Reservas",         path:"/"         },
  { icon:"👥", label:"Clientes",         path:"/"         },
  { icon:"💰", label:"Financeiro",       path:"/"         },
  { icon:"📊", label:"Relatórios",       path:"/"         },
  { icon:"⏳", label:"Listas de Espera", path:"/"         },
  { icon:"✅", label:"Check-in",         path:"/"         },
  { icon:"⚙",  label:"Configurações",   path:"/"         },
];

const TABS    = ["Todos","Ativos","Agendados","Em andamento","Encerrados","Cancelados"];
const PER_PAGE = 10;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Events() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [tab,    setTab]    = useState("Todos");
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  const filtered = EVENTS.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.room.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === "Todos"         ? true :
      tab === "Ativos"        ? ["Em andamento","Agendado"].includes(e.status) :
      tab === "Agendados"     ? e.status === "Agendado"     :
      tab === "Em andamento"  ? e.status === "Em andamento" :
      tab === "Encerrados"    ? e.status === "Encerrado"    :
      tab === "Cancelados"    ? e.status === "Cancelado"    : true;
    return matchSearch && matchTab;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div style={{
      display:"flex", height:"100vh", width:"100vw",
      background:t.bg, color:t.text,
      fontFamily:"'Sora', system-ui, sans-serif",
      overflow:"hidden", position:"fixed", top:0, left:0,
    }}>
      <Sidebar theme={t} navigate={navigate} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Topbar theme={t} darkMode={darkMode} toggleDarkMode={toggleDarkMode} search={search} setSearch={setSearch} />

        <div style={{ flex:1, overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* METRIC CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {METRIC_CARDS.map((c) => <MetricCard key={c.title} card={c} theme={t} />)}
          </div>

          {/* CORPO PRINCIPAL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, alignItems:"start" }}>

            {/* TABELA */}
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

              {/* tabs + filtros */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:14, flexWrap:"wrap", gap:8,
              }}>
                <div style={{ display:"flex" }}>
                  {TABS.map((tb) => (
                    <button key={tb} onClick={() => { setTab(tb); setPage(1); }} style={{
                      padding:"8px 14px", border:"none", background:"transparent",
                      cursor:"pointer", fontSize:13,
                      fontWeight: tab===tb ? 700 : 400,
                      color:      tab===tb ? t.primary : t.textMuted,
                      borderBottom: tab===tb ? `2px solid ${t.primary}` : "2px solid transparent",
                      fontFamily:"inherit", transition:"all 0.15s",
                    }}>{tb}</button>
                  ))}
                </div>

                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <FilterSelect theme={t} options={["Todas as Salas","Teatro Municipal","Arena Eventos","Centro de Eventos"]} />
                  <FilterSelect theme={t} options={["Todos os Tipos","Show","Congresso","Teatro","Workshop","Palestra"]} />
                  <button style={{
                    display:"flex", alignItems:"center", gap:6,
                    padding:"7px 12px", borderRadius:8,
                    border:`1px solid ${t.border}`, background:t.surface,
                    color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  }}>🔧 Filtros</button>
                  <ViewToggle theme={t} />
                </div>
              </div>

              {/* tabela */}
              <EventsTable
                events={paginated}
                theme={t}
                typeColors={TYPE_COLORS}
                statusColors={STATUS_COLORS}
              />

              {/* paginação */}
              <Pagination
                page={page} totalPages={totalPages}
                total={filtered.length} perPage={PER_PAGE}
                onPage={setPage} theme={t}
              />
            </div>

            {/* COLUNA DIREITA */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <CalendarWidget theme={t} />
              <EventsByType theme={t} />
              <TopRooms theme={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ theme:t, navigate }) {
  return (
    <div style={{
      width:185, background:t.surface, borderRight:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden",
    }}>
      <div style={{
        padding:"20px 16px 16px", display:"flex", alignItems:"center", gap:10,
        borderBottom:`1px solid ${t.border}`,
      }}>
        <div style={{
          width:34, height:34, borderRadius:10,
          background:"linear-gradient(135deg, #705EBD, #A78BFA)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, fontSize:16, color:"#fff", flexShrink:0,
        }}>V</div>
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:t.text }}>VenueFlow</div>
          <span style={{
            fontSize:10, fontWeight:600, color:t.primary,
            background:`${t.primary}22`, padding:"1px 5px", borderRadius:4,
          }}>AI</span>
        </div>
      </div>

      <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
        {NAV_ITEMS.map((item) => (
          <div key={item.label} onClick={() => navigate(item.path)} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"9px 10px", borderRadius:8, cursor:"pointer", marginBottom:2,
            background: item.active ? `${t.primary}22` : "transparent",
            color:      item.active ? t.primary : t.textMuted,
            fontWeight: item.active ? 700 : 400,
            fontSize:13, transition:"all 0.15s",
          }}>
            <span style={{ fontSize:15 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div style={{ padding:"12px", borderTop:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{
          background:"linear-gradient(135deg, #705EBD22, #A78BFA11)",
          borderRadius:10, padding:"10px 12px", border:"1px solid #705EBD33",
        }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.primary, marginBottom:4 }}>✨ Dica da IA</div>
          <div style={{ fontSize:10, color:t.textMuted, lineHeight:1.5 }}>
            Você tem 4 eventos com taxa de ocupação acima de 90% esta semana.
          </div>
          <button style={{
            marginTop:6, width:"100%", padding:"5px", borderRadius:6, border:"none",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          }}>Ver insights</button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 4px", cursor:"pointer" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, color:"#fff", flexShrink:0,
          }}>VS</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.text }}>Vinicios Souza</div>
            <div style={{ fontSize:10, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              admin@teatromun...
            </div>
          </div>
          <span style={{ fontSize:12, color:t.textMuted, marginLeft:"auto" }}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ theme:t, darkMode, toggleDarkMode, search, setSearch }) {
  return (
    <div style={{
      padding:"16px 24px 0", display:"flex",
      alignItems:"flex-start", justifyContent:"space-between", flexShrink:0,
    }}>
      <div>
        <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Eventos</div>
        <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
          Gerencie todos os eventos e suas programações.
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:t.surface, border:`1px solid ${t.border}`,
          borderRadius:8, padding:"8px 12px", width:290,
        }}>
          <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
          <input
            placeholder="Buscar por evento, sala ou organizador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background:"none", border:"none", color:t.text,
              fontSize:12, outline:"none", flex:1, fontFamily:"inherit",
            }}
          />
          <span style={{
            fontSize:10, color:t.textMuted, background:t.bg,
            padding:"2px 5px", borderRadius:4, border:`1px solid ${t.border}`,
          }}>/</span>
        </div>
        <button onClick={toggleDarkMode} style={{
          width:36, height:36, borderRadius:8, border:`1px solid ${t.border}`,
          background:t.surface, cursor:"pointer", fontSize:16,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{darkMode ? "☀" : "🌙"}</button>
        <button style={{
          width:36, height:36, borderRadius:8, border:`1px solid ${t.border}`,
          background:t.surface, cursor:"pointer", fontSize:16, position:"relative",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          🔔
          <span style={{
            position:"absolute", top:4, right:4, width:14, height:14,
            borderRadius:"50%", background:"#EF4444", fontSize:9, fontWeight:700, color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>3</span>
        </button>
        <button style={{
          padding:"8px 16px", borderRadius:8, border:"none",
          background:t.primary, color:"#fff", fontWeight:700,
          fontSize:13, cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", gap:6,
        }}>+ Novo Evento ▾</button>
      </div>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ card, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:16,
      border:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:8,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:11, color:t.textMuted, fontWeight:600, marginBottom:4 }}>{card.title}</div>
          <div style={{ fontSize:22, fontWeight:800, color:t.text }}>{card.value}</div>
        </div>
        <div style={{
          width:42, height:42, borderRadius:10, background:`${card.color}22`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
        }}>{card.icon}</div>
      </div>
      <div style={{ height:40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.sparkData.map((v,i) => ({i,v}))}>
            <Area type="monotone" dataKey="v" stroke={card.color} fill={`${card.color}22`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
        {card.trend && <span style={{ color:"#22C55E", fontWeight:700 }}>↑ {card.trend}</span>}
        <span style={{ color:t.textMuted }}>{card.sub}</span>
      </div>
    </div>
  );
}

// ─── TABELA DE EVENTOS ────────────────────────────────────────────────────────
function EventsTable({ events, theme:t, typeColors, statusColors }) {
  const headers = ["Evento ↕","Salas","Data e Hora ↕","Tipo ↕","Ingressos Vendidos","Ocupação ↕","Status ↕","Ações ↕"];

  return (
    <div style={{
      background:t.surface, borderRadius:12,
      border:`1px solid ${t.border}`, overflow:"hidden",
    }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${t.border}` }}>
            {headers.map((h) => (
              <th key={h} style={{
                padding:"11px 12px", textAlign:"left",
                fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((ev, i) => (
            <tr
              key={ev.id}
              style={{ borderBottom: i < events.length-1 ? `1px solid ${t.border}` : "none", transition:"background 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* evento */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:44, height:44, borderRadius:8,
                    background:`${typeColors[ev.type] || t.primary}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0,
                  }}>🎭</div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:t.text }}>{ev.name}</span>
                      {ev.highlight && (
                        <span style={{
                          fontSize:9, fontWeight:700, color:"#705EBD",
                          background:"#705EBD22", padding:"2px 6px", borderRadius:20,
                        }}>Destaque</span>
                      )}
                    </div>
                    <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{ev.room}</div>
                  </div>
                </div>
              </td>

              {/* salas */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:t.textMuted }}>
                  <span>🏛</span> {ev.salas}
                </div>
              </td>

              {/* data/hora */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:12, color:t.text, fontWeight:600 }}>{ev.date}</div>
                <div style={{ fontSize:11, color:t.textMuted }}>{ev.time}</div>
              </td>

              {/* tipo */}
              <td style={{ padding:"10px 12px" }}>
                <span style={{
                  fontSize:11, fontWeight:700,
                  color: typeColors[ev.type] || t.textMuted,
                  background:`${typeColors[ev.type] || t.border}22`,
                  padding:"3px 8px", borderRadius:20,
                }}>{ev.type}</span>
              </td>

              {/* ingressos */}
              <td style={{ padding:"10px 12px", fontSize:12, color:t.text, fontWeight:600 }}>
                {ev.sold.toLocaleString()} / {ev.total.toLocaleString()}
              </td>

              {/* ocupação */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:t.text, minWidth:30 }}>{ev.occupancy}%</span>
                  <div style={{ width:70, height:6, background:t.border, borderRadius:3, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${ev.occupancy}%`,
                      background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                      borderRadius:3,
                    }} />
                  </div>
                </div>
              </td>

              {/* status */}
              <td style={{ padding:"10px 12px" }}>
                <span style={{
                  fontSize:11, fontWeight:700,
                  color: statusColors[ev.status] || t.textMuted,
                  display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
                }}>
                  <span style={{
                    width:7, height:7, borderRadius:"50%",
                    background: statusColors[ev.status] || t.border,
                    display:"inline-block",
                  }} />
                  {ev.status}
                </span>
              </td>

              {/* ações */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {["✏","⧉","···"].map((icon, idx) => (
                    <button key={idx} style={{
                      width:26, height:26, borderRadius:6,
                      border:`1px solid ${t.border}`, background:"transparent",
                      color:t.textMuted, cursor:"pointer", fontSize:12,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>{icon}</button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CALENDÁRIO ───────────────────────────────────────────────────────────────
function CalendarWidget({ theme:t }) {
  const today = 25;
  const days  = ["D","S","T","Q","Q","S","S"];

  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:16,
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Calendário</span>
        <button style={{ background:"none", border:"none", color:t.primary, fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>+</button>
      </div>

      {/* header mês */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <button style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14 }}>‹</button>
        <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Julho 2025</span>
        <button style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14 }}>›</button>
      </div>

      {/* dias da semana */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
        {days.map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:10, color:t.textMuted, fontWeight:700, padding:"2px 0" }}>{d}</div>
        ))}
      </div>

      {/* dias do mês */}
      {CALENDAR_DAYS.map((week, wi) => (
        <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {week.map((day, di) => {
            const isToday   = day === today && wi >= 3;
            const hasEvent  = EVENT_DAYS.includes(day) && wi <= 4;
            const isOngoing = ONGOING_DAYS.includes(day);
            const isOther   = (wi === 0 && day > 20) || (wi === 5 && day < 10);
            return (
              <div key={di} style={{
                textAlign:"center", padding:"4px 2px", fontSize:12,
                color: isOther ? t.border : isToday ? "#fff" : t.text,
                fontWeight: isToday ? 700 : 400,
                background: isToday ? t.primary : "transparent",
                borderRadius: isToday ? "50%" : 0,
                cursor:"pointer",
                position:"relative",
              }}>
                {day}
                {hasEvent && !isToday && (
                  <div style={{
                    position:"absolute", bottom:1, left:"50%", transform:"translateX(-50%)",
                    width:4, height:4, borderRadius:"50%",
                    background: isOngoing ? "#22C55E" : "#F59E0B",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* legenda */}
      <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
        {[{ color:t.border, label:"Hoje" },{ color:"#F59E0B", label:"Agendado" },{ color:"#22C55E", label:"Em andamento" }].map((l) => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:l.color }} />
            <span style={{ fontSize:10, color:t.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EVENTOS POR TIPO ─────────────────────────────────────────────────────────
function EventsByType({ theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:16,
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Eventos por Tipo</span>
        <button style={{ background:"none", border:"none", color:t.primary, fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>›</button>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:100, height:100, flexShrink:0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
<Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={30} outerRadius={44} dataKey="value" strokeWidth={0}>                {PIE_DATA.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
          {PIE_DATA.map((item) => (
            <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:item.color }} />
                <span style={{ fontSize:11, color:t.textMuted }}>{item.name}</span>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:t.text }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TOP SALAS ────────────────────────────────────────────────────────────────
function TopRooms({ theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:16,
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Top Salas</span>
        <button style={{ background:"none", border:"none", color:t.primary, fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>›</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {TOP_ROOMS.map((room) => (
          <div key={room.name}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3 }}>
              <span style={{ color:t.text, fontWeight:600 }}>{room.name}</span>
              <span style={{ color:t.textMuted }}>{room.pct}%</span>
            </div>
            <div style={{ height:5, background:t.border, borderRadius:3, overflow:"hidden" }}>
              <div style={{
                height:"100%", width:`${room.pct}%`,
                background:"linear-gradient(90deg, #705EBD, #A78BFA)", borderRadius:3,
              }} />
            </div>
          </div>
        ))}
      </div>
      <button style={{
        marginTop:10, width:"100%", padding:"6px", borderRadius:7,
        border:`1px solid ${t.border}`, background:"transparent",
        color:t.primary, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
      }}>Ver relatório completo</button>
    </div>
  );
}

// ─── PAGINAÇÃO ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, perPage, onPage, theme:t }) {
  const start   = (page-1)*perPage + 1;
  const end     = Math.min(page*perPage, total);
  const pages   = totalPages <= 5
    ? Array.from({length:totalPages},(_,i)=>i+1)
    : [1,2,3,4,5];

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 0", marginTop:4,
    }}>
      <span style={{ fontSize:12, color:t.textMuted }}>
        Mostrando {start} a {end} de {total} eventos
      </span>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <PagBtn onClick={() => onPage(Math.max(1,page-1))} disabled={page===1} theme={t}>‹</PagBtn>
        {pages.map((p) => (
          <PagBtn key={p} onClick={() => onPage(p)} active={p===page} theme={t}>{p}</PagBtn>
        ))}
        {totalPages > 5 && <span style={{ color:t.textMuted, fontSize:12 }}>···</span>}
        {totalPages > 5 && (
          <PagBtn onClick={() => onPage(totalPages)} active={page===totalPages} theme={t}>{totalPages}</PagBtn>
        )}
        <PagBtn onClick={() => onPage(Math.min(totalPages,page+1))} disabled={page===totalPages} theme={t}>›</PagBtn>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:t.textMuted }}>
        Itens por página:
        <select style={{
          background:t.surface, border:`1px solid ${t.border}`,
          borderRadius:6, color:t.text, fontSize:12,
          padding:"3px 6px", cursor:"pointer", fontFamily:"inherit",
        }}>
          <option>10</option><option>20</option><option>50</option>
        </select>
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function PagBtn({ children, onClick, disabled, active, theme:t }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:30, height:30, borderRadius:6, fontFamily:"inherit",
      border:`1px solid ${active ? t.primary : t.border}`,
      background: active ? t.primary : "transparent",
      color: disabled ? t.border : active ? "#fff" : t.text,
      cursor: disabled ? "default" : "pointer",
      fontSize:13, fontWeight: active ? 700 : 400,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</button>
  );
}

function FilterSelect({ theme:t, options }) {
  return (
    <select style={{
      background:t.surface, border:`1px solid ${t.border}`,
      borderRadius:8, color:t.text, fontSize:12,
      padding:"7px 10px", cursor:"pointer", fontFamily:"inherit",
    }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function ViewToggle({ theme:t }) {
  const [v, setV] = useState("grid");
  return (
    <div style={{
      display:"flex", background:t.bg, borderRadius:8,
      padding:3, gap:2, border:`1px solid ${t.border}`,
    }}>
      {[{id:"grid",icon:"⊞"},{id:"list",icon:"☰"}].map((item) => (
        <button key={item.id} onClick={() => setV(item.id)} style={{
          width:28, height:28, borderRadius:6, border:"none",
          cursor:"pointer", fontSize:14,
          background: v===item.id ? t.primary : "transparent",
          color:      v===item.id ? "#fff" : t.textMuted,
          transition:"all 0.15s",
        }}>{item.icon}</button>
      ))}
    </div>
  );
}