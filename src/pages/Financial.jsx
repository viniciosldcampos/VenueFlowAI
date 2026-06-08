import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const FLOW_DATA = [
  { date:"01 Jul", receita:8000,  despesa:2000 },
  { date:"05 Jul", receita:12000, despesa:3500 },
  { date:"10 Jul", receita:9500,  despesa:2800 },
  { date:"15 Jul", receita:15000, despesa:4200 },
  { date:"20 Jul", receita:18000, despesa:5100 },
  { date:"25 Jul", receita:14000, despesa:3800 },
  { date:"31 Jul", receita:20000, despesa:6000 },
];

const MONTHLY_DATA = [
  { month:"Fev", receita:55000, despesa:12000 },
  { month:"Mar", receita:62000, despesa:15000 },
  { month:"Abr", receita:48000, despesa:11000 },
  { month:"Mai", receita:71000, despesa:16000 },
  { month:"Jun", receita:68000, despesa:14000 },
  { month:"Jul", receita:89500, despesa:13250 },
];

const PAYMENT_DATA = [
  { name:"Cartão de Crédito", value:45, amount:"R$ 40.275,00", color:"#705EBD" },
  { name:"PIX",               value:30, amount:"R$ 26.850,00", color:"#4A90D9" },
  { name:"Boleto",            value:15, amount:"R$ 13.425,00", color:"#F59E0B" },
  { name:"Dinheiro",          value:7,  amount:"R$ 6.265,00",  color:"#22C55E" },
  { name:"Outros",            value:3,  amount:"R$ 2.685,00",  color:"#EF4444" },
];

const REVENUE_CAT = [
  { name:"Ingressos",       value:65, amount:"R$ 58.175,00", color:"#705EBD" },
  { name:"Aluguel de Espaços", value:20, amount:"R$ 17.900,00", color:"#4A90D9" },
  { name:"Alimentação",     value:8,  amount:"R$ 7.160,00",  color:"#22C55E" },
  { name:"Estacionamento",  value:5,  amount:"R$ 4.475,00",  color:"#F59E0B" },
  { name:"Outros",          value:2,  amount:"R$ 1.790,00",  color:"#EF4444" },
];

const EXPENSE_CAT = [
  { name:"Equipe",        value:40, amount:"R$ 5.300,00",  color:"#EF4444" },
  { name:"Marketing",     value:20, amount:"R$ 2.650,00",  color:"#F59E0B" },
  { name:"Manutenção",    value:15, amount:"R$ 1.987,50",  color:"#705EBD" },
  { name:"Infraestrutura",value:15, amount:"R$ 1.987,50",  color:"#4A90D9" },
  { name:"Outros",        value:10, amount:"R$ 1.325,00",  color:"#6B7280" },
];

const TRANSACTIONS = [
  { id:1, date:"25/07/2025", desc:"Ingressos - Show de Inverno 2025", category:"Ingressos",        type:"Receita",  method:"Cartão de Crédito", value:"R$ 8.450,00",   neg:false, status:"Concluído" },
  { id:2, date:"25/07/2025", desc:"Aluguel - Sala Multiuso 03",       category:"Aluguel de Espaços",type:"Receita", method:"PIX",               value:"R$ 1.200,00",   neg:false, status:"Concluído" },
  { id:3, date:"24/07/2025", desc:"Folha de Pagamento - Equipe",      category:"Equipe",            type:"Despesa", method:"Transferência",     value:"-R$ 5.300,00",  neg:true,  status:"Concluído" },
  { id:4, date:"24/07/2025", desc:"Marketing Digital",                category:"Marketing",          type:"Despesa", method:"Cartão de Crédito", value:"-R$ 1.250,00",  neg:true,  status:"Concluído" },
  { id:5, date:"23/07/2025", desc:"Estacionamento - Evento Tech",     category:"Estacionamento",    type:"Receita",  method:"Dinheiro",          value:"R$ 650,00",    neg:false, status:"Concluído" },
];

const CAT_COLORS = {
  "Ingressos":         "#705EBD",
  "Aluguel de Espaços":"#4A90D9",
  "Alimentação":       "#22C55E",
  "Estacionamento":    "#F59E0B",
  "Equipe":            "#EF4444",
  "Marketing":         "#F59E0B",
  "Manutenção":        "#8B5CF6",
  "Infraestrutura":    "#06B6D4",
  "Outros":            "#6B7280",
};

const METHOD_ICONS = {
  "Cartão de Crédito": "💳",
  "PIX":               "🔵",
  "Transferência":     "🏦",
  "Dinheiro":          "💵",
  "Boleto":            "📄",
};

const METRIC_CARDS = [
  { title:"Receita Total",   value:"R$ 89.500,00",  trend:"+21%", up:true,  sub:"em relação ao mês passado", icon:"💰", color:"#705EBD", sparkData:[60,65,70,68,75,80,78,85,88,89.5] },
  { title:"Receita Líquida", value:"R$ 76.250,00",  trend:"+18%", up:true,  sub:"em relação ao mês passado", icon:"📈", color:"#22C55E", sparkData:[50,55,60,58,63,68,65,72,75,76.25] },
  { title:"Despesas",        value:"R$ 13.250,00",  trend:"-8%",  up:false, sub:"em relação ao mês passado", icon:"📉", color:"#EF4444", sparkData:[15,14,16,15,14,13.5,14,13,12.5,13.25] },
  { title:"Lucro",           value:"R$ 63.000,00",  trend:"+28%", up:true,  sub:"em relação ao mês passado", icon:"🏆", color:"#4A90D9", sparkData:[40,44,47,45,50,55,52,58,61,63] },
];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"              },
  { icon:"🏛", label:"Salas",            path:"/rooms"         },
  { icon:"📅", label:"Eventos",          path:"/events"        },
  { icon:"📆", label:"Calendário",       path:"/calendar"      },
  { icon:"🎫", label:"Reservas",         path:"/reservations"  },
  { icon:"👥", label:"Clientes",         path:"/clients"       },
  { icon:"💰", label:"Financeiro",       path:"/financial", active:true },
  { icon:"📊", label:"Relatórios",       path:"/"              },
  { icon:"⏳", label:"Listas de Espera", path:"/"              },
  { icon:"✅", label:"Check-in",         path:"/"              },
  { icon:"⚙",  label:"Configurações",   path:"/"              },
];

const PER_PAGE = 5;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Financial() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(TRANSACTIONS.length / PER_PAGE);

  return (
    <div style={{
      display:"flex", height:"100vh", width:"100vw",
      background:t.bg, color:t.text,
      fontFamily:"'Sora', system-ui, sans-serif",
      overflow:"hidden", position:"fixed", top:0, left:0,
    }}>
      <Sidebar theme={t} navigate={navigate} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Topbar theme={t} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <div style={{ flex:1, overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* METRIC CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {METRIC_CARDS.map((c) => <MetricCard key={c.title} card={c} theme={t} />)}
          </div>

          {/* FLUXO + RESUMO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
            <FlowChart theme={t} />
            <MonthSummary theme={t} />
          </div>

          {/* CATEGORIAS + COMPARATIVO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            <DonutCard title="Receitas por Categoria" data={REVENUE_CAT}  theme={t} />
            <DonutCard title="Despesas por Categoria" data={EXPENSE_CAT}  theme={t} />
            <ComparativeChart theme={t} />
          </div>

          {/* TRANSAÇÕES */}
          <TransactionsTable
            transactions={TRANSACTIONS}
            theme={t}
            catColors={CAT_COLORS}
            methodIcons={METHOD_ICONS}
            page={page}
            totalPages={totalPages}
            total={TRANSACTIONS.length}
            perPage={PER_PAGE}
            onPage={setPage}
          />
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
            Sua receita este mês está 21% acima do mês passado. Continue assim! 🚀
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
function Topbar({ theme:t, darkMode, toggleDarkMode }) {
  return (
    <div style={{
      padding:"16px 24px 0", display:"flex",
      alignItems:"flex-start", justifyContent:"space-between", flexShrink:0,
    }}>
      <div>
        <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Financeiro</div>
        <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
          Acompanhe suas receitas, despesas e o fluxo financeiro do seu negócio.
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:t.surface, border:`1px solid ${t.border}`,
          borderRadius:8, padding:"8px 12px", width:280,
        }}>
          <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
          <input placeholder="Buscar por receita, despesa, evento..." style={{
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
          }}>3</span>
        </button>
        <button style={{
          padding:"8px 16px", borderRadius:8, border:"none",
          background:t.primary, color:"#fff", fontWeight:700,
          fontSize:13, cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", gap:6,
        }}>+ Nova Transação ▾</button>
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
          <div style={{ fontSize:20, fontWeight:800, color:t.text }}>{card.value}</div>
        </div>
        <div style={{
          width:42, height:42, borderRadius:10, background:`${card.color}22`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
        }}>{card.icon}</div>
      </div>
      <div style={{ height:38 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.sparkData.map((v,i) => ({i,v}))}>
            <Area type="monotone" dataKey="v" stroke={card.color} fill={`${card.color}22`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
        <span style={{ color: card.up ? "#22C55E" : "#EF4444", fontWeight:700 }}>
          {card.up ? "↑" : "↓"} {card.trend}
        </span>
        <span style={{ color:t.textMuted }}>{card.sub}</span>
      </div>
    </div>
  );
}

// ─── FLUXO FINANCEIRO ─────────────────────────────────────────────────────────
function FlowChart({ theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"18px 20px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontWeight:700, fontSize:15, color:t.text }}>Fluxo Financeiro</span>
          <select style={{
            background:t.bg, border:`1px solid ${t.border}`,
            borderRadius:7, color:t.text, fontSize:12,
            padding:"4px 8px", cursor:"pointer", fontFamily:"inherit",
          }}>
            <option>Receitas x Despesas</option>
            <option>Apenas Receitas</option>
            <option>Apenas Despesas</option>
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            background:t.bg, border:`1px solid ${t.border}`,
            borderRadius:7, padding:"5px 12px", fontSize:12, color:t.textMuted,
          }}>01/07/2025 - 31/07/2025</div>
          <button style={{
            width:30, height:30, borderRadius:7,
            border:`1px solid ${t.border}`, background:t.bg,
            color:t.textMuted, cursor:"pointer", fontSize:14,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>📅</button>
        </div>
      </div>

      {/* legenda */}
      <div style={{ display:"flex", gap:16, marginBottom:8 }}>
        {[{ color:"#705EBD", label:"Receitas" },{ color:"#F59E0B", label:"Despesas" }].map((l) => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:l.color }} />
            <span style={{ fontSize:11, color:t.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ height:240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={FLOW_DATA} margin={{ top:5, right:5, bottom:5, left:0 }}>
            <defs>
              <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#705EBD" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#705EBD" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis dataKey="date" tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `R$ ${v/1000}k`}
              tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, fontSize:12, color:t.text }}
              formatter={(v, name) => [`R$ ${v.toLocaleString()}`, name === "receita" ? "Receita" : "Despesa"]}
            />
            <Area type="monotone" dataKey="receita" stroke="#705EBD" fill="url(#receitaGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="despesa" stroke="#F59E0B" fill="url(#despesaGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── RESUMO DO MÊS ────────────────────────────────────────────────────────────
function MonthSummary({ theme:t }) {
  const rows = [
    { label:"Receita Total",    value:"R$ 89.500,00", color:"#705EBD" },
    { label:"Receita Líquida",  value:"R$ 76.250,00", color:"#22C55E" },
    { label:"Despesas",         value:"R$ 13.250,00", color:"#EF4444" },
    { label:"Lucro",            value:"R$ 63.000,00", color:"#22C55E", bold:true },
    { label:"Margem de Lucro",  value:"70,4%",        color:t.text    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* resumo */}
      <div style={{
        background:t.surface, borderRadius:12, padding:"16px 18px",
        border:`1px solid ${t.border}`,
      }}>
        <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>Resumo do Mês</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {rows.map((row, i) => (
            <div key={i}>
              {i === 3 && <div style={{ height:1, background:t.border, margin:"6px 0" }} />}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:t.textMuted }}>{row.label}</span>
                <span style={{
                  fontSize: row.bold ? 14 : 13,
                  fontWeight: row.bold ? 800 : 700,
                  color: row.color,
                }}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* receitas por forma de pagamento */}
      <div style={{
        background:t.surface, borderRadius:12, padding:"16px 18px",
        border:`1px solid ${t.border}`,
      }}>
        <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>
          Receitas por Forma de Pagamento
        </div>
        <div style={{ height:110, marginBottom:8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={PAYMENT_DATA} cx="50%" cy="50%" innerRadius={32} outerRadius={48} dataKey="value" strokeWidth={0}>
                {PAYMENT_DATA.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {PAYMENT_DATA.map((item) => (
            <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                <span style={{ fontSize:11, color:t.textMuted }}>{item.name}</span>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
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

// ─── DONUT CARD ───────────────────────────────────────────────────────────────
function DonutCard({ title, data, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>{title}</div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:90, height:90, flexShrink:0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="value" strokeWidth={0}>
                {data.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
          {data.map((item) => (
            <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                <span style={{ fontSize:10, color:t.textMuted }}>{item.name}</span>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ fontSize:10, color:t.textMuted }}>{item.value}%</span>
                <span style={{ fontSize:10, fontWeight:700, color:t.text }}>{item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPARATIVO MENSAL ───────────────────────────────────────────────────────
function ComparativeChart({ theme:t }) {
  const [period, setPeriod] = useState("Últimos 6 meses");

  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"16px 18px",
      border:`1px solid ${t.border}`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8,
      }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Comparativo Mensal</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            background:t.bg, border:`1px solid ${t.border}`,
            borderRadius:7, color:t.text, fontSize:11,
            padding:"3px 6px", cursor:"pointer", fontFamily:"inherit",
          }}
        >
          <option>Últimos 6 meses</option>
          <option>Últimos 3 meses</option>
          <option>Este ano</option>
        </select>
      </div>

      {/* legenda */}
      <div style={{ display:"flex", gap:12, marginBottom:8 }}>
        {[{ color:"#705EBD", label:"Receitas" },{ color:"#F59E0B", label:"Despesas" }].map((l) => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />
            <span style={{ fontSize:10, color:t.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ height:160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MONTHLY_DATA} barGap={2} margin={{ top:0, right:0, bottom:0, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `R$ ${v/1000}k`}
              tick={{ fontSize:9, fill:t.textMuted }} axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, fontSize:11, color:t.text }}
              formatter={(v) => [`R$ ${v.toLocaleString()}`]}
            />
            <Bar dataKey="receita" fill="#705EBD" radius={[3,3,0,0]} maxBarSize={20} />
            <Bar dataKey="despesa" fill="#F59E0B" radius={[3,3,0,0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── TABELA DE TRANSAÇÕES ─────────────────────────────────────────────────────
function TransactionsTable({ transactions, theme:t, catColors, methodIcons, page, totalPages, total, perPage, onPage }) {
  const start   = (page-1)*perPage + 1;
  const end     = Math.min(page*perPage, total);
  const headers = ["Data","Descrição","Categoria","Tipo","Método","Valor ↕","Status ↕","Ações"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:12, flexWrap:"wrap", gap:8,
      }}>
        <span style={{ fontWeight:700, fontSize:15, color:t.text }}>Transações Recentes</span>
        <div style={{ display:"flex", gap:8 }}>
          <FilterSelect theme={t} options={["Todos os tipos","Receita","Despesa"]} />
          <FilterSelect theme={t} options={["Todas as categorias","Ingressos","Aluguel de Espaços","Equipe","Marketing"]} />
          <FilterSelect theme={t} options={["Todos os métodos","PIX","Cartão de Crédito","Boleto","Dinheiro"]} />
          <button style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"7px 12px", borderRadius:8,
            border:`1px solid ${t.border}`, background:t.surface,
            color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
          }}>🔧 Filtros ▾</button>
        </div>
      </div>

      {/* tabela */}
      <div style={{
        background:t.surface, borderRadius:12,
        border:`1px solid ${t.border}`, overflow:"hidden",
      }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${t.border}` }}>
              {headers.map((h) => (
                <th key={h} style={{
                  padding:"11px 14px", textAlign:"left",
                  fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tr, i) => (
              <tr
                key={tr.id}
                style={{ borderBottom: i < transactions.length-1 ? `1px solid ${t.border}` : "none", transition:"background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding:"11px 14px", fontSize:12, color:t.textMuted }}>{tr.date}</td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:600, color:t.text, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tr.desc}</td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{
                    fontSize:11, fontWeight:700,
                    color: catColors[tr.category] || t.textMuted,
                    background:`${catColors[tr.category] || t.border}22`,
                    padding:"3px 8px", borderRadius:20,
                  }}>{tr.category}</span>
                </td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{
                    fontSize:12, fontWeight:700,
                    color: tr.type === "Receita" ? "#22C55E" : "#EF4444",
                    display:"flex", alignItems:"center", gap:4,
                  }}>
                    {tr.type === "Receita" ? "↑" : "↓"} {tr.type}
                  </span>
                </td>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:t.text }}>
                    <span>{methodIcons[tr.method] || "💳"}</span>
                    {tr.method}
                  </div>
                </td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:800, color: tr.neg ? "#EF4444" : "#22C55E" }}>
                  {tr.value}
                </td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{
                    fontSize:11, fontWeight:700, color:"#22C55E",
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", display:"inline-block" }} />
                    {tr.status}
                  </span>
                </td>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ display:"flex", gap:4 }}>
                    {["👁","···"].map((icon, idx) => (
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

      {/* paginação */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 0", marginTop:4,
      }}>
        <span style={{ fontSize:12, color:t.textMuted }}>
          Mostrando {start} a {end} de {total} transações
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <PagBtn onClick={() => onPage(Math.max(1,page-1))} disabled={page===1} theme={t}>‹</PagBtn>
          {[1,2,3,4,5].map((p) => (
            <PagBtn key={p} onClick={() => onPage(p)} active={p===page} theme={t}>{p}</PagBtn>
          ))}
          <span style={{ color:t.textMuted, fontSize:12 }}>···</span>
          <PagBtn theme={t}>50</PagBtn>
          <PagBtn onClick={() => onPage(Math.min(totalPages,page+1))} disabled={page===totalPages} theme={t}>›</PagBtn>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:t.textMuted }}>
          Itens por página:
          <select style={{
            background:t.surface, border:`1px solid ${t.border}`,
            borderRadius:6, color:t.text, fontSize:12,
            padding:"3px 6px", cursor:"pointer", fontFamily:"inherit",
          }}>
            <option>5</option><option>10</option><option>20</option>
          </select>
        </div>
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