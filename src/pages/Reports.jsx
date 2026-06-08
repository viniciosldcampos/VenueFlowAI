import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const FLOW_DATA = [
  { date:"01 Jul", receita:6000,  despesa:1800 },
  { date:"05 Jul", receita:10000, despesa:3000 },
  { date:"10 Jul", receita:8000,  despesa:2500 },
  { date:"15 Jul", receita:14000, despesa:3800 },
  { date:"20 Jul", receita:17000, despesa:4800 },
  { date:"25 Jul", receita:20000, despesa:5500 },
  { date:"31 Jul", receita:18000, despesa:5000 },
];

const ROOMS_OCCUPANCY = [
  { name:"Auditório Principal", pct:94 },
  { name:"Arena Eventos",       pct:89 },
  { name:"Teatro Municipal",    pct:78 },
  { name:"Sala Multiuso 02",    pct:65 },
  { name:"Cinema 01",           pct:62 },
  { name:"Sala VIP",            pct:45 },
];

const TICKET_TYPES = [
  { name:"Inteira",   value:45, count:8438,  color:"#705EBD" },
  { name:"Meia",      value:30, count:5625,  color:"#4A90D9" },
  { name:"Cortesia",  value:15, count:2813,  color:"#F59E0B" },
  { name:"VIP",       value:7,  count:1313,  color:"#22C55E" },
  { name:"Outros",    value:3,  count:561,   color:"#EF4444" },
];

const REVENUE_CAT = [
  { name:"Shows",      value:45, amount:"R$ 40.275,00", color:"#705EBD" },
  { name:"Congressos", value:25, amount:"R$ 22.375,00", color:"#4A90D9" },
  { name:"Teatros",    value:15, amount:"R$ 13.425,00", color:"#22C55E" },
  { name:"Workshops",  value:8,  amount:"R$ 7.160,00",  color:"#F59E0B" },
  { name:"Palestras",  value:5,  amount:"R$ 4.475,00",  color:"#06B6D4" },
  { name:"Outros",     value:2,  amount:"R$ 1.790,00",  color:"#EF4444" },
];

const TOP_EVENTS = [
  { pos:1,  name:"Show de Inverno 2025",  value:"R$ 18.750,00", pct:100 },
  { pos:2,  name:"Congresso Tech",        value:"R$ 14.250,00", pct:76  },
  { pos:3,  name:"Peça: Além do Tempo",   value:"R$ 8.600,00",  pct:46  },
  { pos:4,  name:"Festival de Música",    value:"R$ 7.800,00",  pct:42  },
  { pos:5,  name:"Workshop de Design",    value:"R$ 5.300,00",  pct:28  },
  { pos:6,  name:"Espetáculo Infantil",   value:"R$ 4.200,00",  pct:22  },
  { pos:7,  name:"Palestra: Inovação",    value:"R$ 3.900,00",  pct:21  },
  { pos:8,  name:"Fórum de Inovação",     value:"R$ 3.200,00",  pct:17  },
  { pos:9,  name:"Gala de Premiação 2025",value:"R$ 2.750,00",  pct:15  },
  { pos:10, name:"Expo Negócios 2025",    value:"R$ 2.150,00",  pct:11  },
];

const METRIC_CARDS = [
  { title:"Total de Eventos",   value:"132",          trend:"+18%", icon:"📅", color:"#705EBD", sub:"vs mês anterior", sparkData:[80,85,90,88,95,100,105,110,120,132]         },
  { title:"Ingressos Vendidos", value:"18.750",        trend:"+22%", icon:"🎫", color:"#22C55E", sub:"vs mês anterior", sparkData:[12000,13000,14000,13500,15000,16000,17000,17500,18000,18750] },
  { title:"Receita Total",      value:"R$ 89.500,00",  trend:"+21%", icon:"💰", color:"#F59E0B", sub:"vs mês anterior", sparkData:[60,65,70,68,75,80,78,85,88,89.5]           },
  { title:"Público Total",      value:"16.980",        trend:"+17%", icon:"👥", color:"#4A90D9", sub:"vs mês anterior", sparkData:[10000,11000,12000,11500,13000,14000,15000,15500,16000,16980] },
  { title:"Taxa de Ocupação",   value:"87%",           trend:"+8%",  icon:"📊", color:"#8B5CF6", sub:"vs mês anterior", sparkData:[55,60,65,70,68,72,75,80,84,87]             },
  { title:"Ticket Médio",       value:"R$ 204,17",     trend:"+4%",  icon:"🎟", color:"#EF4444", sub:"vs mês anterior", sparkData:[180,185,190,188,195,198,200,202,203,204]   },
];

const REPORT_TABS = ["Visão Geral","Eventos","Receitas","Salas","Clientes","Financeiro","Operacional","Personalizado"];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/calendar"     },
  { icon:"🎫", label:"Reservas",         path:"/reservations" },
  { icon:"👥", label:"Clientes",         path:"/clients"      },
  { icon:"💰", label:"Financeiro",       path:"/financial"    },
  { icon:"📊", label:"Relatórios",       path:"/reports", active:true },
  { icon:"⏳", label:"Listas de Espera", path:"/"             },
  { icon:"✅", label:"Check-in",         path:"/"             },
  { icon:"⚙",  label:"Configurações",   path:"/"             },
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Reports() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Visão Geral");

  return (
    <div style={{
      display:"flex", height:"100vh", width:"100vw",
      background:t.bg, color:t.text,
      fontFamily:"'Sora', system-ui, sans-serif",
      overflow:"hidden", position:"fixed", top:0, left:0,
    }}>
      <Sidebar theme={t} navigate={navigate} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* TOPBAR */}
        <div style={{
          padding:"16px 24px 0", display:"flex",
          alignItems:"flex-start", justifyContent:"space-between", flexShrink:0,
        }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Relatórios</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Dashboards analíticos com dados detalhados do seu negócio.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:t.surface, border:`1px solid ${t.border}`,
              borderRadius:8, padding:"8px 12px", width:260,
            }}>
              <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
              <input placeholder="Buscar por relatório..." style={{
                background:"none", border:"none", color:t.text,
                fontSize:12, outline:"none", flex:1, fontFamily:"inherit",
              }} />
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
                borderRadius:"50%", background:"#EF4444", fontSize:9, fontWeight:700,
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
              }}>5</span>
            </button>
            <button style={{
              padding:"8px 16px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:6,
            }}>📤 Exportar Relatório ▾</button>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display:"flex", padding:"0 24px",
          borderBottom:`1px solid ${t.border}`, flexShrink:0, marginTop:12,
        }}>
          {REPORT_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:"10px 16px", border:"none", background:"transparent",
              cursor:"pointer", fontSize:13,
              fontWeight: activeTab===tab ? 700 : 400,
              color:      activeTab===tab ? t.primary : t.textMuted,
              borderBottom: activeTab===tab ? `2px solid ${t.primary}` : "2px solid transparent",
              fontFamily:"inherit", transition:"all 0.15s", whiteSpace:"nowrap",
            }}>{tab}</button>
          ))}
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* FILTROS */}
          <div style={{
            display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
          }}>
            <div style={{
              display:"flex", alignItems:"center", gap:6,
              background:t.surface, border:`1px solid ${t.border}`,
              borderRadius:8, padding:"6px 12px", fontSize:12, color:t.textMuted,
            }}>
              📅 01/07/2025 - 31/07/2025
            </div>
            {["Todas as Salas","Todos os Eventos","Todos os Tipos","Todos os Status"].map((f) => (
              <FilterSelect key={f} theme={t} label={f} />
            ))}
            <button style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 12px", borderRadius:8,
              border:`1px solid ${t.border}`, background:t.surface,
              color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
            }}>🔧 Filtros ▾</button>
            <div style={{ flex:1 }} />
            <button style={{
              background:"none", border:"none", color:t.primary,
              fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
              display:"flex", alignItems:"center", gap:4,
            }}>↺ Limpar filtros</button>
          </div>

          {/* METRIC CARDS — 6 colunas */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
            {METRIC_CARDS.map((c) => <MetricCard key={c.title} card={c} theme={t} />)}
          </div>

          {/* GRÁFICO PRINCIPAL + OCUPAÇÃO + INGRESSOS */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 280px 280px", gap:14 }}>
            <RevenueChart theme={t} />
            <OccupancyByRoom rooms={ROOMS_OCCUPANCY} theme={t} />
            <TicketsByType data={TICKET_TYPES} theme={t} />
          </div>

          {/* CATEGORIA + TOP EVENTS + FINANCEIRO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 320px", gap:14 }}>
            <RevenueByCat data={REVENUE_CAT} theme={t} />
            <TopEvents events={TOP_EVENTS} theme={t} />
            <RightColumn theme={t} />
          </div>

          {/* FOOTER */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            paddingTop:8, borderTop:`1px solid ${t.border}`,
          }}>
            <span style={{ fontSize:11, color:t.textMuted }}>
              🔄 Última atualização: 25/07/2025 23:45
            </span>
            <div style={{ display:"flex", gap:10 }}>
              {[
                { icon:"📄", label:"Exportar PDF"   },
                { icon:"📊", label:"Exportar Excel" },
                { icon:"🔗", label:"Compartilhar"   },
              ].map((btn) => (
                <button key={btn.label} style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"8px 16px", borderRadius:8,
                  border:`1px solid ${t.border}`, background:t.surface,
                  color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
                }}>{btn.icon} {btn.label}</button>
              ))}
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
            Seus eventos de sábado à noite têm 32% mais ocupação que a média. Aproveite para promover mais shows!
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

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ card, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"12px 14px",
      border:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:6,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:10, color:t.textMuted, fontWeight:600 }}>{card.title}</div>
        <div style={{
          width:30, height:30, borderRadius:7, background:`${card.color}22`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
        }}>{card.icon}</div>
      </div>
      <div style={{ fontSize:18, fontWeight:800, color:t.text }}>{card.value}</div>
      <div style={{ height:32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.sparkData.map((v,i) => ({i,v}))}>
            <Area type="monotone" dataKey="v" stroke={card.color} fill={`${card.color}22`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11 }}>
        <span style={{ color:"#22C55E", fontWeight:700 }}>↑ {card.trend}</span>
        <span style={{ color:t.textMuted }}>{card.sub}</span>
      </div>
    </div>
  );
}

// ─── GRÁFICO RECEITA ─────────────────────────────────────────────────────────
function RevenueChart({ theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12,
      }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Receita ao Longo do Tempo</span>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {[{ color:"#705EBD", label:"Receita" },{ color:"#F59E0B", label:"Despesa" }].map((l) => (
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:l.color }} />
              <span style={{ fontSize:10, color:t.textMuted }}>{l.label}</span>
            </div>
          ))}
          <select style={{
            background:t.bg, border:`1px solid ${t.border}`,
            borderRadius:6, color:t.text, fontSize:11,
            padding:"3px 7px", cursor:"pointer", fontFamily:"inherit",
          }}>
            <option>Diário</option>
            <option>Semanal</option>
            <option>Mensal</option>
          </select>
        </div>
      </div>
      <div style={{ height:220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={FLOW_DATA} margin={{ top:5, right:5, bottom:5, left:0 }}>
            <defs>
              <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#705EBD" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#705EBD" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis dataKey="date" tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, fontSize:11, color:t.text }}
              formatter={(v) => [`R$ ${v.toLocaleString()}`]}
            />
            <Area type="monotone" dataKey="receita" stroke="#705EBD" fill="url(#rGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="despesa" stroke="#F59E0B" fill="url(#dGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── OCUPAÇÃO POR SALA ────────────────────────────────────────────────────────
function OccupancyByRoom({ rooms, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14,
      }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Ocupação por Sala</span>
        <select style={{
          background:t.bg, border:`1px solid ${t.border}`,
          borderRadius:6, color:t.text, fontSize:11,
          padding:"3px 7px", cursor:"pointer", fontFamily:"inherit",
        }}>
          <option>Todas as Salas</option>
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {rooms.map((room) => (
          <div key={room.name}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
              <span style={{ color:t.text, fontWeight:600 }}>{room.name}</span>
              <span style={{ color:t.textMuted, fontWeight:700 }}>{room.pct}%</span>
            </div>
            <div style={{ height:6, background:t.border, borderRadius:3, overflow:"hidden" }}>
              <div style={{
                height:"100%", width:`${room.pct}%`,
                background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                borderRadius:3, transition:"width 0.5s",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INGRESSOS POR TIPO ───────────────────────────────────────────────────────
function TicketsByType({ data, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>
        Ingressos por Tipo
      </div>
      <div style={{ height:140, marginBottom:10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
              {data.map((e,i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {data.map((item) => (
          <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:item.color }} />
              <span style={{ fontSize:11, color:t.textMuted }}>{item.name}</span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <span style={{ fontSize:11, color:t.textMuted }}>{item.value}%</span>
              <span style={{ fontSize:11, fontWeight:700, color:t.text }}>({item.count.toLocaleString()})</span>
            </div>
          </div>
        ))}
        <div style={{
          borderTop:`1px solid ${t.border}`, marginTop:4, paddingTop:6,
          display:"flex", justifyContent:"space-between",
        }}>
          <span style={{ fontSize:11, color:t.textMuted }}>Total</span>
          <span style={{ fontSize:13, fontWeight:800, color:t.primary }}>18.750</span>
        </div>
      </div>
    </div>
  );
}

// ─── RECEITA POR CATEGORIA ────────────────────────────────────────────────────
function RevenueByCat({ data, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:14 }}>
        Receita por Categoria
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:140, height:140, flexShrink:0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
                {data.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
          {data.map((item) => (
            <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:item.color }} />
                <span style={{ fontSize:12, color:t.textMuted }}>{item.name}</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <span style={{ fontSize:11, color:t.textMuted }}>{item.value}%</span>
                <span style={{ fontSize:11, fontWeight:700, color:t.text }}>{item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TOP 10 EVENTOS ───────────────────────────────────────────────────────────
function TopEvents({ events, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>
        Top 10 Eventos por Receita
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {events.map((ev) => (
          <div key={ev.pos} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{
              fontSize:11, fontWeight:700, color:t.textMuted,
              width:16, textAlign:"right", flexShrink:0,
            }}>{ev.pos}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:12, fontWeight:600, color:t.text,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                marginBottom:3,
              }}>{ev.name}</div>
              <div style={{ height:4, background:t.border, borderRadius:2, overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:`${ev.pct}%`,
                  background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                  borderRadius:2,
                }} />
              </div>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:t.text, flexShrink:0, minWidth:80, textAlign:"right" }}>
              {ev.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COLUNA DIREITA ───────────────────────────────────────────────────────────
function RightColumn({ theme:t }) {
  const summary = [
    { label:"Receita Total",     value:"R$ 89.500,00",  color:"#22C55E" },
    { label:"(-) Impostos",      value:"-R$ 11.635,00", color:"#EF4444" },
    { label:"Receita Líquida",   value:"R$ 77.865,00",  color:"#22C55E", bold:true },
    { label:"(-) Despesas",      value:"-R$ 13.250,00", color:"#EF4444" },
    { label:"Lucro Operacional", value:"R$ 64.615,00",  color:"#22C55E", bold:true },
    { label:"Margem de Lucro",   value:"72,1%",         color:t.text    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* resumo financeiro */}
      <div style={{
        background:t.surface, borderRadius:12, padding:"16px 18px",
        border:`1px solid ${t.border}`,
      }}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12,
        }}>
          <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Resumo Financeiro</span>
          <select style={{
            background:t.bg, border:`1px solid ${t.border}`,
            borderRadius:6, color:t.text, fontSize:11,
            padding:"3px 7px", cursor:"pointer", fontFamily:"inherit",
          }}>
            <option>Este Mês</option>
            <option>Mês Anterior</option>
          </select>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {summary.map((row, i) => (
            <div key={i}>
              {(i === 2 || i === 4) && <div style={{ height:1, background:t.border, margin:"4px 0" }} />}
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:t.textMuted }}>{row.label}</span>
                <span style={{
                  fontSize: row.bold ? 13 : 12,
                  fontWeight: row.bold ? 800 : 600,
                  color: row.color,
                }}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* dados demográficos */}
      <div style={{
        background:t.surface, borderRadius:12, padding:"16px 18px",
        border:`1px solid ${t.border}`,
      }}>
        <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>
          Dados Demográficos do Público
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { icon:"👩", value:"56%",    label:"Feminino",   color:"#EC4899" },
            { icon:"👨", value:"44%",    label:"Masculino",  color:"#4A90D9" },
            { icon:"🎂", value:"18-35",  label:"Idade Média",color:"#22C55E" },
          ].map((d) => (
            <div key={d.label} style={{
              background:t.bg, borderRadius:8, padding:"10px 8px",
              border:`1px solid ${t.border}`, textAlign:"center",
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{d.icon}</div>
              <div style={{ fontSize:16, fontWeight:800, color:d.color }}>{d.value}</div>
              <div style={{ fontSize:9, color:t.textMuted, marginTop:2 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function FilterSelect({ theme:t, label }) {
  return (
    <select style={{
      background:t.surface, border:`1px solid ${t.border}`,
      borderRadius:8, color:t.text, fontSize:12,
      padding:"7px 10px", cursor:"pointer", fontFamily:"inherit",
    }}>
      <option>{label}</option>
    </select>
  );
}