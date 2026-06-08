import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const CLIENTS = [
  { id:"CLI-0001245", name:"Gabriel Martins",  initials:"GM", email:"gabriel@email.com",  phone:"(21) 99999-8888", group:"Premium", reservations:12, spent:"R$ 2.450,00", lastDate:"25/07/2025", lastEvent:"Show de Inverno 2025", status:"Ativo",   birth:"15/08/1990", doc:"123.456.789-00", address:"Rua das Flores, 123\nRio de Janeiro, RJ", avgTicket:"R$ 204,17" },
  { id:"CLI-0001244", name:"Juliana Costa",    initials:"JC", email:"juliana@email.com",  phone:"(11) 98888-7777", group:"Regular", reservations:8,  spent:"R$ 1.240,00", lastDate:"25/07/2025", lastEvent:"Congresso Tech",        status:"Ativo",   birth:"22/03/1985", doc:"987.654.321-00", address:"Av. Paulista, 1000\nSão Paulo, SP",        avgTicket:"R$ 155,00" },
  { id:"CLI-0001243", name:"Lucas Almeida",    initials:"LA", email:"lucas@email.com",    phone:"(31) 97777-6666", group:"VIP",     reservations:15, spent:"R$ 3.890,00", lastDate:"26/07/2025", lastEvent:"Peça: Além do Tempo",   status:"Ativo",   birth:"10/11/1992", doc:"456.789.123-00", address:"Rua Bahia, 500\nBelo Horizonte, MG",       avgTicket:"R$ 259,33" },
  { id:"CLI-0001242", name:"Fernanda Lima",    initials:"FL", email:"fernanda@email.com", phone:"(21) 96666-5555", group:"Premium", reservations:6,  spent:"R$ 980,00",   lastDate:"28/07/2025", lastEvent:"Workshop de Design",    status:"Ativo",   birth:"05/06/1988", doc:"321.654.987-00", address:"Rua das Acácias, 77\nCuritiba, PR",        avgTicket:"R$ 163,33" },
  { id:"CLI-0001241", name:"Rafael Souza",     initials:"RS", email:"rafael@email.com",   phone:"(11) 95555-4444", group:"Regular", reservations:4,  spent:"R$ 560,00",   lastDate:"29/07/2025", lastEvent:"Palestra: Inovação",    status:"Inativo", birth:"18/09/1995", doc:"654.321.098-00", address:"Rua do Sol, 200\nSalvador, BA",            avgTicket:"R$ 140,00" },
  { id:"CLI-0001240", name:"Beatriz Oliveira", initials:"BO", email:"beatriz@email.com",  phone:"(31) 94444-3333", group:"VIP",     reservations:10, spent:"R$ 2.100,00", lastDate:"25/07/2025", lastEvent:"Show de Inverno 2025",  status:"Ativo",   birth:"30/01/1990", doc:"789.012.345-00", address:"Av. Brasil, 350\nFortaleza, CE",           avgTicket:"R$ 210,00" },
  { id:"CLI-0001239", name:"André Pereira",    initials:"AP", email:"andre@email.com",    phone:"(71) 93333-2222", group:"Regular", reservations:3,  spent:"R$ 420,00",   lastDate:"05/08/2025", lastEvent:"Fórum de Inovação",     status:"Ativo",   birth:"14/07/1987", doc:"012.345.678-00", address:"Rua das Mangueiras, 45\nRecife, PE",       avgTicket:"R$ 140,00" },
  { id:"CLI-0001238", name:"Camila Mendes",    initials:"CM", email:"camila@email.com",   phone:"(21) 92222-1111", group:"Premium", reservations:7,  spent:"R$ 1.540,00", lastDate:"30/07/2025", lastEvent:"Gala de Premiação 2025",status:"Ativo",   birth:"25/12/1993", doc:"345.678.901-00", address:"Av. Copacabana, 800\nRio de Janeiro, RJ",  avgTicket:"R$ 220,00" },
  { id:"CLI-0001237", name:"Pedro Henrique",   initials:"PH", email:"pedro@email.com",    phone:"(31) 91111-0000", group:"Regular", reservations:2,  spent:"R$ 260,00",   lastDate:"27/07/2025", lastEvent:"Espetáculo Infantil",   status:"Inativo", birth:"08/04/1998", doc:"678.901.234-00", address:"Rua das Pedras, 15\nManaus, AM",           avgTicket:"R$ 130,00" },
  { id:"CLI-0001236", name:"Mariana Santos",   initials:"MS", email:"mariana@email.com",  phone:"(11) 90000-9999", group:"VIP",     reservations:11, spent:"R$ 2.780,00", lastDate:"26/07/2025", lastEvent:"Congresso Tech",        status:"Ativo",   birth:"17/02/1991", doc:"901.234.567-00", address:"Rua Augusta, 600\nSão Paulo, SP",          avgTicket:"R$ 252,73" },
];

const HISTORY = [
  { event:"Show de Inverno 2025",  date:"25/07/2025 • 20:00", room:"Auditório Principal • A12, A13", value:"R$ 240,00",  status:"Confirmada", color:"#705EBD" },
  { event:"Congresso Tech",        date:"25/07/2025 • 09:00", room:"Sala 02 • B05, B06, B07",       value:"R$ 360,00",  status:"Confirmada", color:"#4A90D9" },
  { event:"Peça: Além do Tempo",   date:"26/07/2025 • 19:30", room:"Auditório Principal • C10",      value:"R$ 80,00",   status:"Confirmada", color:"#22C55E" },
  { event:"Workshop de Design",    date:"25/07/2025 • 14:00", room:"Sala Multiuso 03",               value:"R$ 0,00",    status:"Gratuito",   color:"#D97706" },
  { event:"Palestra: Inovação",    date:"29/07/2025 • 10:00", room:"Auditório Principal • D15, D16", value:"R$ 120,00",  status:"Confirmada", color:"#06B6D4" },
];

const GROUP_COLORS = {
  Premium: "#705EBD",
  VIP:     "#F59E0B",
  Regular: "#4A90D9",
};

const STATUS_COLORS = {
  Confirmada: "#22C55E",
  Gratuito:   "#6B7280",
  Pendente:   "#F59E0B",
  Cancelada:  "#EF4444",
};

const METRIC_CARDS = [
  { title:"Total de Clientes",    value:"1.856", trend:"+18%", sub:"em relação ao mês passado", icon:"👥", color:"#705EBD", sparkData:[1200,1300,1400,1380,1450,1500,1600,1650,1750,1856] },
  { title:"Clientes Ativos",      value:"1.245", trend:null,   sub:"67% do total",              icon:"✅", color:"#22C55E", sparkData:[800,850,900,880,950,1000,1050,1100,1200,1245]      },
  { title:"Novos Clientes (mês)", value:"243",   trend:"+22%", sub:"este mês",                  icon:"🆕", color:"#F59E0B", sparkData:[150,160,170,165,180,190,200,210,230,243]           },
];

const DETAIL_TABS = ["Detalhes","Histórico","Preferências","Notas"];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"            },
  { icon:"🏛", label:"Salas",            path:"/rooms"       },
  { icon:"📅", label:"Eventos",          path:"/events"      },
  { icon:"📆", label:"Calendário",       path:"/calendar"    },
  { icon:"🎫", label:"Reservas",         path:"/reservations"},
  { icon:"👥", label:"Clientes",         path:"/clients", active:true },
  { icon:"💰", label:"Financeiro",       path:"/"            },
  { icon:"📊", label:"Relatórios",       path:"/"            },
  { icon:"⏳", label:"Listas de Espera", path:"/"            },
  { icon:"✅", label:"Check-in",         path:"/"            },
  { icon:"⚙",  label:"Configurações",   path:"/"            },
];

const PER_PAGE = 10;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Clients() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [selectedId, setSelectedId] = useState("CLI-0001245");
  const [detailTab,  setDetailTab]  = useState("Detalhes");

  const filtered = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())  ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const selected   = CLIENTS.find((c) => c.id === selectedId) || CLIENTS[0];

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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {METRIC_CARDS.map((c) => <MetricCard key={c.title} card={c} theme={t} />)}
          </div>

          {/* TABELA + PAINEL DIREITO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>

            {/* TABELA */}
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

              {/* filtros */}
              <div style={{
                display:"flex", alignItems:"center", gap:8,
                marginBottom:14, flexWrap:"wrap",
              }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:6,
                  background:t.surface, border:`1px solid ${t.border}`,
                  borderRadius:8, padding:"7px 10px", flex:1, maxWidth:220,
                }}>
                  <span style={{ color:t.textMuted, fontSize:12 }}>🔍</span>
                  <input
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{
                      background:"none", border:"none", color:t.text,
                      fontSize:12, outline:"none", flex:1, fontFamily:"inherit",
                    }}
                  />
                </div>
                <FilterSelect theme={t} options={["Todos os Grupos","Premium","VIP","Regular"]} />
                <FilterSelect theme={t} options={["Todas as Salas","Teatro Municipal","Arena Eventos"]} />
                <FilterSelect theme={t} options={["Todos os Status","Ativo","Inativo"]} />
                <button style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"7px 12px", borderRadius:8,
                  border:`1px solid ${t.border}`, background:t.surface,
                  color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                }}>🔧 Filtros</button>
                <ViewToggle theme={t} />
              </div>

              {/* tabela */}
              <ClientsTable
                clients={paginated}
                theme={t}
                groupColors={GROUP_COLORS}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />

              {/* paginação */}
              <Pagination
                page={page} totalPages={totalPages}
                total={filtered.length} perPage={PER_PAGE}
                onPage={setPage} theme={t}
              />
            </div>

            {/* PAINEL DE DETALHES */}
            <ClientDetails
              client={selected}
              theme={t}
              groupColors={GROUP_COLORS}
              statusColors={STATUS_COLORS}
              detailTab={detailTab}
              setDetailTab={setDetailTab}
              history={HISTORY}
            />
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
            Você possui 243 clientes fiéis que compraram mais de 3 vezes.
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
        <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Clientes</div>
        <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
          Gerencie seus clientes e acompanhe o histórico de reservas.
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
            placeholder="Buscar por nome, e-mail ou telefone..."
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
            borderRadius:"50%", background:"#EF4444", fontSize:9, fontWeight:700,
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
          }}>5</span>
        </button>
        <button style={{
          padding:"8px 16px", borderRadius:8, border:"none",
          background:t.primary, color:"#fff", fontWeight:700,
          fontSize:13, cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", gap:6,
        }}>+ Novo Cliente ▾</button>
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

// ─── TABELA DE CLIENTES ───────────────────────────────────────────────────────
function ClientsTable({ clients, theme:t, groupColors, selectedId, onSelect }) {
  const headers = ["Cliente ↕","Contato ↕","Total de Reservas","Gasto Total","Última Reserva ↕","Status","Ações"];

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
                padding:"11px 14px", textAlign:"left",
                fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{
                borderBottom: i < clients.length-1 ? `1px solid ${t.border}` : "none",
                background:   c.id === selectedId ? `${t.primary}11` : "transparent",
                cursor:"pointer", transition:"background 0.15s",
              }}
              onMouseEnter={(e) => { if(c.id !== selectedId) e.currentTarget.style.background = t.bg; }}
              onMouseLeave={(e) => { if(c.id !== selectedId) e.currentTarget.style.background = "transparent"; }}
            >
              {/* cliente */}
              <td style={{ padding:"11px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:36, height:36, borderRadius:"50%",
                    background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:700, color:"#fff", flexShrink:0,
                  }}>{c.initials}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:t.text }}>{c.name}</div>
                    <div style={{ fontSize:10, marginTop:1 }}>
                      <span style={{ color:t.textMuted }}>Grupo: </span>
                      <span style={{ color:groupColors[c.group] || t.textMuted, fontWeight:600 }}>{c.group}</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* contato */}
              <td style={{ padding:"11px 14px" }}>
                <div style={{ fontSize:12, color:t.text }}>{c.email}</div>
                <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{c.phone}</div>
              </td>

              {/* reservas */}
              <td style={{ padding:"11px 14px", fontSize:13, color:t.text, fontWeight:600, textAlign:"center" }}>
                {c.reservations} reservas
              </td>

              {/* gasto */}
              <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:t.text }}>
                {c.spent}
              </td>

              {/* última reserva */}
              <td style={{ padding:"11px 14px" }}>
                <div style={{ fontSize:12, color:t.text }}>{c.lastDate}</div>
                <div style={{ fontSize:10, color:t.textMuted, marginTop:1, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.lastEvent}</div>
              </td>

              {/* status */}
              <td style={{ padding:"11px 14px" }}>
                <span style={{
                  fontSize:11, fontWeight:700,
                  color: c.status === "Ativo" ? "#22C55E" : "#EF4444",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  <span style={{
                    width:7, height:7, borderRadius:"50%",
                    background: c.status === "Ativo" ? "#22C55E" : "#EF4444",
                    display:"inline-block",
                  }} />
                  {c.status}
                </span>
              </td>

              {/* ações */}
              <td style={{ padding:"11px 14px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {["👁","✏","···"].map((icon, idx) => (
                    <button key={idx} style={{
                      width:28, height:28, borderRadius:6,
                      border:`1px solid ${t.border}`, background:"transparent",
                      color:t.textMuted, cursor:"pointer", fontSize:13,
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

// ─── PAINEL DE DETALHES DO CLIENTE ────────────────────────────────────────────
function ClientDetails({ client:c, theme:t, groupColors, statusColors, detailTab, setDetailTab, history }) {
  if (!c) return null;

  return (
    <div style={{
      background:t.surface, borderRadius:12,
      border:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", overflow:"hidden",
      maxHeight:"calc(100vh - 220px)",
    }}>
      {/* header do cliente */}
      <div style={{ padding:"16px", borderBottom:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
          <div style={{
            width:52, height:52, borderRadius:"50%",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, fontWeight:700, color:"#fff", flexShrink:0,
          }}>{c.initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:15, fontWeight:800, color:t.text }}>{c.name}</span>
              <span style={{
                fontSize:10, fontWeight:700,
                color: c.status === "Ativo" ? "#22C55E" : "#EF4444",
                background: c.status === "Ativo" ? "#22C55E22" : "#EF444422",
                padding:"2px 8px", borderRadius:20,
              }}>{c.status}</span>
            </div>
            <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>
              Cliente desde 12/01/2024
            </div>
            <div style={{ fontSize:11, color:t.textMuted }}>
              ID: {c.id}
            </div>
          </div>
        </div>

        {/* ações rápidas */}
        <div style={{ display:"flex", gap:8 }}>
          {[
            { icon:"✉", label:"Email"    },
            { icon:"📞", label:"Telefone" },
            { icon:"💬", label:"WhatsApp" },
            { icon:"···", label:"Mais"    },
          ].map((btn) => (
            <button key={btn.label} title={btn.label} style={{
              flex: btn.icon === "···" ? "none" : 1,
              padding:"6px", borderRadius:8,
              border:`1px solid ${t.border}`, background:t.bg,
              color:t.textMuted, cursor:"pointer", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>{btn.icon}</button>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${t.border}`, flexShrink:0 }}>
        {DETAIL_TABS.map((tab) => (
          <button key={tab} onClick={() => setDetailTab(tab)} style={{
            flex:1, padding:"9px 0", border:"none", background:"transparent",
            cursor:"pointer", fontSize:11, fontWeight: detailTab===tab ? 700 : 400,
            color:       detailTab===tab ? t.primary : t.textMuted,
            borderBottom: detailTab===tab ? `2px solid ${t.primary}` : "2px solid transparent",
            fontFamily:"inherit", transition:"all 0.15s",
          }}>{tab}</button>
        ))}
      </div>

      {/* conteúdo das tabs */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>

        {/* ABA: DETALHES */}
        {detailTab === "Detalhes" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { label:"E-mail",          value:c.email             },
              { label:"Telefone",        value:c.phone             },
              { label:"Data de Nascimento", value:c.birth          },
              { label:"Grupo",           value:c.group, isGroup:true },
              { label:"Documento",       value:c.doc               },
              { label:"Endereço",        value:c.address           },
              { label:"Total de Reservas", value:`${c.reservations} reservas` },
              { label:"Total Gasto",     value:c.spent             },
              { label:"Ticket Médio",    value:c.avgTicket         },
            ].map((row) => (
              <div key={row.label} style={{
                display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                fontSize:12, gap:8,
              }}>
                <span style={{ color:t.textMuted, flexShrink:0 }}>{row.label}</span>
                {row.isGroup ? (
                  <span style={{
                    color: groupColors[row.value] || t.text,
                    fontWeight:700, fontSize:11,
                    background:`${groupColors[row.value] || t.border}22`,
                    padding:"2px 8px", borderRadius:20,
                  }}>{row.value}</span>
                ) : (
                  <span style={{ color:t.text, fontWeight:600, textAlign:"right", whiteSpace:"pre-line" }}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA: HISTÓRICO */}
        {detailTab === "Histórico" && (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Histórico de Reservas</span>
              <button style={{ background:"none", border:"none", color:t.primary, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Ver todas</button>
            </div>

            {history.map((h, i) => (
              <div key={i} style={{
                borderBottom: i < history.length-1 ? `1px solid ${t.border}` : "none",
                padding:"10px 0",
                display:"flex", alignItems:"center", gap:10,
              }}>
                <div style={{
                  width:38, height:38, borderRadius:7, flexShrink:0,
                  background:`${h.color}22`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                }}>🎭</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.event}</div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{h.date}</div>
                  <div style={{ fontSize:10, color:t.textMuted }}>{h.room}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{h.value}</div>
                  <span style={{
                    fontSize:10, fontWeight:700,
                    color: statusColors[h.status] || t.textMuted,
                    background:`${statusColors[h.status] || t.border}22`,
                    padding:"2px 6px", borderRadius:20,
                  }}>{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA: PREFERÊNCIAS */}
        {detailTab === "Preferências" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { label:"Tipos favoritos",    value:"Shows, Congressos"          },
              { label:"Salas preferidas",   value:"Auditório Principal, Sala 02"},
              { label:"Forma de pagamento", value:"PIX"                         },
              { label:"Notificações",       value:"E-mail e WhatsApp"           },
              { label:"Idioma",             value:"Português (BR)"              },
            ].map((p) => (
              <div key={p.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                <span style={{ color:t.textMuted }}>{p.label}</span>
                <span style={{ color:t.text, fontWeight:600 }}>{p.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ABA: NOTAS */}
        {detailTab === "Notas" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <textarea
              placeholder="Adicionar nota sobre este cliente..."
              rows={4}
              style={{
                width:"100%", padding:"10px", borderRadius:8,
                border:`1px solid ${t.border}`, background:t.bg,
                color:t.text, fontSize:12, fontFamily:"inherit",
                resize:"vertical", outline:"none", boxSizing:"border-box",
              }}
            />
            <button style={{
              padding:"8px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff",
              fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit",
            }}>Salvar Nota</button>
          </div>
        )}
      </div>

      {/* footer com métricas */}
      <div style={{
        borderTop:`1px solid ${t.border}`,
        display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
        flexShrink:0,
      }}>
        {[
          { value:c.reservations, label:"Reservas",   bg:t.bg        },
          { value:c.spent,        label:"Total Gasto", bg:"#705EBD22" },
          { value:c.avgTicket,    label:"Ticket Médio",bg:"#4A90D922" },
        ].map((m, i) => (
          <div key={i} style={{
            padding:"10px 12px", background:m.bg,
            borderRight: i < 2 ? `1px solid ${t.border}` : "none",
            textAlign:"center",
          }}>
            <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{m.value}</div>
            <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGINAÇÃO ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, perPage, onPage, theme:t }) {
  const start = (page-1)*perPage + 1;
  const end   = Math.min(page*perPage, total);
  const pages = [1,2,3,4,5];

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 0", marginTop:4,
    }}>
      <span style={{ fontSize:12, color:t.textMuted }}>
        Mostrando {start} a {end} de {total} clientes
      </span>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <PagBtn onClick={() => onPage(Math.max(1,page-1))} disabled={page===1} theme={t}>‹</PagBtn>
        {pages.map((p) => (
          <PagBtn key={p} onClick={() => onPage(p)} active={p===page} theme={t}>{p}</PagBtn>
        ))}
        <span style={{ color:t.textMuted, fontSize:12 }}>···</span>
        <PagBtn theme={t}>186</PagBtn>
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