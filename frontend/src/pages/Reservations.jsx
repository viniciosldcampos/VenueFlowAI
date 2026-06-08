import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const RESERVATIONS = [
  { id:"RES-0001245", date:"25/07/2025", client:{ name:"Gabriel Martins",  email:"gabriel@email.com",  phone:"(21) 99999-8888", initials:"GM" }, event:"Show de Inverno 2025",   room:"Auditório Principal", roomTag:"Auditório Principal", seats:["A12","A13"],              sector:"Plateia",   places:2, datetime:"25/07/2025 20:00", value:"R$ 240,00", payment:"PIX",    payStatus:"Pago",    status:"Confirmada"       },
  { id:"RES-0001244", date:"25/07/2025", client:{ name:"Juliana Costa",    email:"juliana@email.com",  phone:"(11) 98888-7777", initials:"JC" }, event:"Congresso Tech",         room:"Centro de Eventos",   roomTag:"Sala 02",            seats:["B05","B06","B07"],        sector:"Plateia",   places:3, datetime:"25/07/2025 09:00", value:"R$ 360,00", payment:"Cartão", payStatus:"Pago",    status:"Confirmada"       },
  { id:"RES-0001243", date:"25/07/2025", client:{ name:"Lucas Almeida",    email:"lucas@email.com",    phone:"(21) 97777-6666", initials:"LA" }, event:"Peça: Além do Tempo",    room:"Teatro Municipal",    roomTag:"Auditório Principal", seats:["C10"],                    sector:"Plateia",   places:1, datetime:"26/07/2025 19:30", value:"R$ 80,00",  payment:"PIX",    payStatus:"Pendente",status:"Pendente"         },
  { id:"RES-0001242", date:"24/07/2025", client:{ name:"Fernanda Lima",    email:"fernanda@email.com", phone:"(31) 96666-5555", initials:"FL" }, event:"Workshop de Design",     room:"Sala Multiuso 03",    roomTag:"Sala 03",            seats:["—"],                      sector:"—",         places:1, datetime:"28/07/2025 14:00", value:"R$ 0,00",   payment:"Gratuito",payStatus:"—",       status:"Confirmada"       },
  { id:"RES-0001241", date:"24/07/2025", client:{ name:"Rafael Souza",     email:"rafael@email.com",   phone:"(85) 95555-4444", initials:"RS" }, event:"Palestra: Inovação",     room:"Auditório Principal", roomTag:"Auditório Principal", seats:["D15","D16"],              sector:"Plateia",   places:2, datetime:"29/07/2025 10:00", value:"R$ 120,00", payment:"Boleto", payStatus:"Pago",    status:"Check-in Realizado"},
  { id:"RES-0001240", date:"25/07/2025", client:{ name:"Beatriz Oliveira", email:"beatriz@email.com",  phone:"(11) 94444-3333", initials:"BO" }, event:"Show de Inverno 2025",   room:"Teatro Municipal",    roomTag:"Mezanino",           seats:["M02","M03","M04"],        sector:"Mezanino",  places:3, datetime:"25/07/2025 20:00", value:"R$ 360,00", payment:"Cartão", payStatus:"Pago",    status:"Cancelada"        },
  { id:"RES-0001239", date:"23/07/2025", client:{ name:"André Pereira",    email:"andre@email.com",    phone:"(71) 93333-2222", initials:"AP" }, event:"Fórum de Inovação",      room:"Centro de Eventos",   roomTag:"Sala 01",            seats:["—"],                      sector:"—",         places:1, datetime:"05/08/2025 09:00", value:"R$ 0,00",   payment:"Gratuito",payStatus:"—",       status:"Pendente"         },
  { id:"RES-0001238", date:"22/07/2025", client:{ name:"Camila Mendes",    email:"camila@email.com",   phone:"(21) 92222-1111", initials:"CM" }, event:"Gala de Premiação 2025", room:"Auditório Principal", roomTag:"Camarote VIP",        seats:["V01","V02"],              sector:"Camarote",  places:2, datetime:"30/07/2025 20:00", value:"R$ 500,00", payment:"Cartão", payStatus:"Pago",    status:"Confirmada"       },
  { id:"RES-0001237", date:"22/07/2025", client:{ name:"Pedro Henrique",   email:"pedro@email.com",    phone:"(81) 91111-0000", initials:"PH" }, event:"Espetáculo Infantil",    room:"Teatro Municipal",    roomTag:"Auditório Principal", seats:["E20","E21","E22"],        sector:"Plateia",   places:3, datetime:"27/07/2025 16:00", value:"R$ 150,00", payment:"PIX",    payStatus:"Pago",    status:"Check-in Realizado"},
  { id:"RES-0001236", date:"21/07/2025", client:{ name:"Mariana Santos",   email:"mariana@email.com",  phone:"(11) 90000-9999", initials:"MS" }, event:"Congresso Tech",         room:"Centro de Eventos",   roomTag:"Sala 02",            seats:["F08"],                    sector:"Plateia",   places:1, datetime:"26/07/2025 09:00", value:"R$ 120,00", payment:"Cartão", payStatus:"Pago",    status:"Cancelada"        },
];

const STATUS_COLORS = {
  "Confirmada":         "#22C55E",
  "Pendente":           "#F59E0B",
  "Cancelada":          "#EF4444",
  "Check-in Realizado": "#705EBD",
  "Reembolsada":        "#06B6D4",
};

const ROOM_TAG_COLORS = {
  "Auditório Principal": "#705EBD",
  "Sala 02":             "#4A90D9",
  "Sala 03":             "#22C55E",
  "Sala 01":             "#06B6D4",
  "Mezanino":            "#8B5CF6",
  "Camarote VIP":        "#F59E0B",
};

const METRIC_CARDS = [
  { title:"Total de Reservas", value:"1.245", trend:"+18%", sub:"em relação à última semana", icon:"📅", color:"#705EBD", sparkData:[800,850,900,880,950,1000,1050,1100,1200,1245] },
  { title:"Confirmadas",       value:"987",   trend:null,   sub:"79% do total",               icon:"✅", color:"#22C55E", sparkData:[600,650,700,680,720,750,800,820,900,987]  },
  { title:"Pendentes",         value:"124",   trend:null,   sub:"10% do total",               icon:"⏳", color:"#F59E0B", sparkData:[80,85,90,88,95,100,105,110,120,124]       },
  { title:"Check-ins Hoje",    value:"342",   trend:null,   sub:"27% do total",               icon:"🎫", color:"#4A90D9", sparkData:[200,210,220,215,230,240,250,280,320,342]  },
  { title:"Canceladas",        value:"134",   trend:null,   sub:"11% do total",               icon:"❌", color:"#EF4444", sparkData:[80,85,90,88,95,100,105,110,120,134]       },
];

const TABS = ["Todas","Confirmadas","Pendentes","Check-in","Canceladas","Reembolsadas"];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/"             },
  { icon:"🎫", label:"Reservas",         path:"/reservations", active:true },
  { icon:"👥", label:"Clientes",         path:"/"             },
  { icon:"💰", label:"Financeiro",       path:"/"             },
  { icon:"📊", label:"Relatórios",       path:"/"             },
  { icon:"⏳", label:"Listas de Espera", path:"/"             },
  { icon:"✅", label:"Check-in",         path:"/"             },
  { icon:"⚙",  label:"Configurações",   path:"/"             },
];

const PER_PAGE = 10;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Reservations() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [tab,        setTab]        = useState("Todas");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [selectedId, setSelectedId] = useState("RES-0001245");

  const filtered = RESERVATIONS.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase())         ||
      r.client.name.toLowerCase().includes(search.toLowerCase()) ||
      r.event.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === "Todas"        ? true :
      tab === "Confirmadas"  ? r.status === "Confirmada"         :
      tab === "Pendentes"    ? r.status === "Pendente"           :
      tab === "Check-in"     ? r.status === "Check-in Realizado" :
      tab === "Canceladas"   ? r.status === "Cancelada"          :
      tab === "Reembolsadas" ? r.status === "Reembolsada"        : true;
    return matchSearch && matchTab;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const selected   = RESERVATIONS.find((r) => r.id === selectedId) || RESERVATIONS[0];

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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
            {METRIC_CARDS.map((c) => <MetricCard key={c.title} card={c} theme={t} />)}
          </div>

          {/* TABELA + PAINEL DIREITO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16, alignItems:"start" }}>

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
                <div style={{ display:"flex", gap:8 }}>
                  <FilterSelect theme={t} options={["Todas as Salas","Teatro Municipal","Arena Eventos"]} />
                  <FilterSelect theme={t} options={["Todos os Eventos","Show de Inverno","Congresso Tech"]} />
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
              <ReservationsTable
                reservations={paginated}
                theme={t}
                statusColors={STATUS_COLORS}
                roomTagColors={ROOM_TAG_COLORS}
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
            <DetailsPanel
              reservation={selected}
              theme={t}
              statusColors={STATUS_COLORS}
              onClose={() => setSelectedId(null)}
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
            Você possui 43 reservas para hoje. 12 check-ins pendentes.
          </div>
          <button style={{
            marginTop:6, width:"100%", padding:"5px", borderRadius:6, border:"none",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          }}>Ver check-ins</button>
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
        <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Reservas</div>
        <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
          Gerencie todas as reservas e acompanhe o status em tempo real.
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:t.surface, border:`1px solid ${t.border}`,
          borderRadius:8, padding:"8px 12px", width:310,
        }}>
          <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
          <input
            placeholder="Buscar por código, cliente, evento ou assento..."
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
          }}>3</span>
        </button>
        <button style={{
          padding:"8px 16px", borderRadius:8, border:"none",
          background:t.primary, color:"#fff", fontWeight:700,
          fontSize:13, cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", gap:6,
        }}>+ Nova Reserva ▾</button>
      </div>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ card, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:14,
      border:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:6,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:10, color:t.textMuted, fontWeight:600, marginBottom:3 }}>{card.title}</div>
          <div style={{ fontSize:20, fontWeight:800, color:t.text }}>{card.value}</div>
        </div>
        <div style={{
          width:38, height:38, borderRadius:9, background:`${card.color}22`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
        }}>{card.icon}</div>
      </div>
      <div style={{ height:35 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.sparkData.map((v,i) => ({i,v}))}>
            <Area type="monotone" dataKey="v" stroke={card.color} fill={`${card.color}22`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize:11, display:"flex", alignItems:"center", gap:5 }}>
        {card.trend && <span style={{ color:"#22C55E", fontWeight:700 }}>↑ {card.trend}</span>}
        <span style={{ color:t.textMuted }}>{card.sub}</span>
      </div>
    </div>
  );
}

// ─── TABELA DE RESERVAS ───────────────────────────────────────────────────────
function ReservationsTable({ reservations, theme:t, statusColors, roomTagColors, selectedId, onSelect }) {
  const headers = ["Reserva","Cliente","Evento","Sala","Assentos","Data e Hora","Valor","Status","Ações"];

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
                padding:"10px 12px", textAlign:"left",
                fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservations.map((r, i) => (
            <tr
              key={r.id}
              onClick={() => onSelect(r.id)}
              style={{
                borderBottom: i < reservations.length-1 ? `1px solid ${t.border}` : "none",
                background:   r.id === selectedId ? `${t.primary}11` : "transparent",
                cursor:       "pointer", transition:"background 0.15s",
              }}
              onMouseEnter={(e) => { if(r.id !== selectedId) e.currentTarget.style.background = t.bg; }}
              onMouseLeave={(e) => { if(r.id !== selectedId) e.currentTarget.style.background = "transparent"; }}
            >
              {/* reserva */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{r.id}</div>
                <div style={{ fontSize:10, color:t.textMuted }}>{r.date}</div>
              </td>

              {/* cliente */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{
                    width:32, height:32, borderRadius:"50%",
                    background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:"#fff", flexShrink:0,
                  }}>{r.client.initials}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{r.client.name}</div>
                    <div style={{ fontSize:10, color:t.textMuted }}>{r.client.email}</div>
                  </div>
                </div>
              </td>

              {/* evento */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{
                    width:36, height:36, borderRadius:6,
                    background:`${t.primary}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0,
                  }}>🎭</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:t.text, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.event}</div>
                    <div style={{ fontSize:10, color:t.textMuted }}>{r.room}</div>
                  </div>
                </div>
              </td>

              {/* sala tag */}
              <td style={{ padding:"10px 12px" }}>
                <span style={{
                  fontSize:10, fontWeight:700,
                  color:      roomTagColors[r.roomTag] || t.textMuted,
                  background:`${roomTagColors[r.roomTag] || t.border}22`,
                  padding:"3px 8px", borderRadius:20, whiteSpace:"nowrap",
                }}>{r.roomTag}</span>
              </td>

              {/* assentos */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:12, color:t.text, fontWeight:600 }}>
                  {r.seats.join(", ")}
                </div>
                {r.places > 1 && r.seats[0] !== "—" && (
                  <div style={{ fontSize:10, color:t.textMuted }}>({r.places} lugares)</div>
                )}
              </td>

              {/* data/hora */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:12, color:t.text }}>{r.datetime.split(" ")[0]}</div>
                <div style={{ fontSize:10, color:t.textMuted }}>{r.datetime.split(" ")[1]}</div>
              </td>

              {/* valor */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{r.value}</div>
                <div style={{ fontSize:10, color:t.textMuted }}>{r.payment}</div>
              </td>

              {/* status */}
              <td style={{ padding:"10px 12px" }}>
                <span style={{
                  fontSize:10, fontWeight:700,
                  color: statusColors[r.status] || t.textMuted,
                  background:`${statusColors[r.status] || t.border}22`,
                  padding:"3px 8px", borderRadius:20, whiteSpace:"nowrap",
                  display:"flex", alignItems:"center", gap:5, width:"fit-content",
                }}>
                  <span style={{
                    width:6, height:6, borderRadius:"50%",
                    background: statusColors[r.status] || t.border,
                    display:"inline-block", flexShrink:0,
                  }} />
                  {r.status}
                </span>
              </td>

              {/* ações */}
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {["👁","⊞","···"].map((icon, idx) => (
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

// ─── PAINEL DE DETALHES ───────────────────────────────────────────────────────
function DetailsPanel({ reservation: r, theme:t, statusColors, onClose }) {
  if (!r) return null;
  const statusColor = statusColors[r.status] || t.textMuted;

  return (
    <div style={{
      background:t.surface, borderRadius:12,
      border:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      {/* header */}
      <div style={{
        padding:"14px 16px", borderBottom:`1px solid ${t.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontWeight:700, fontSize:14, color:t.text }}>Detalhes da Reserva</span>
        <button onClick={onClose} style={{
          background:"none", border:"none", color:t.textMuted,
          cursor:"pointer", fontSize:16, lineHeight:1,
        }}>✕</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* status + código */}
        <div>
          <span style={{
            fontSize:11, fontWeight:700, color:statusColor,
            background:`${statusColor}22`, padding:"3px 10px",
            borderRadius:20, display:"inline-block", marginBottom:8,
          }}>{r.status}</span>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:18, fontWeight:800, color:t.text }}>{r.id}</div>
            <div style={{
              width:52, height:52, background:t.bg,
              border:`1px solid ${t.border}`, borderRadius:8,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28,
            }}>⊞</div>
          </div>
          <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>📷 Escanear para check-in</div>
        </div>

        {/* imagem do evento */}
        <div style={{
          height:80, borderRadius:8, overflow:"hidden",
          background:`linear-gradient(135deg, #705EBD33, #0F172A)`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:36,
        }}>🎭</div>

        {/* nome do evento */}
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{r.event}</div>
          <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>📍 {r.room}</div>
          <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>📅 {r.datetime}</div>
        </div>

        <div style={{ height:1, background:t.border }} />

        {/* cliente */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Cliente</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background:"linear-gradient(135deg, #705EBD, #A78BFA)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:"#fff", flexShrink:0,
            }}>{r.client.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:t.text }}>{r.client.name}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>{r.client.email}</div>
              <div style={{ fontSize:11, color:t.textMuted }}>{r.client.phone}</div>
            </div>
          </div>
        </div>

        <div style={{ height:1, background:t.border }} />

        {/* assentos */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Assentos</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
            {r.seats.map((s) => (
              s !== "—" ? (
                <span key={s} style={{
                  padding:"4px 12px", borderRadius:7,
                  background:t.primary, color:"#fff",
                  fontSize:12, fontWeight:700,
                }}>{s}</span>
              ) : (
                <span key={s} style={{ fontSize:12, color:t.textMuted }}>Entrada Livre</span>
              )
            ))}
          </div>
          {r.sector !== "—" && (
            <div style={{ fontSize:11, color:t.textMuted }}>
              Setor: {r.sector} · {r.places} {r.places === 1 ? "lugar" : "lugares"}
            </div>
          )}
        </div>

        <div style={{ height:1, background:t.border }} />

        {/* pagamento */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Pagamento</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:14 }}>
                {r.payment === "PIX" ? "🔵" : r.payment === "Cartão" ? "💳" : r.payment === "Boleto" ? "📄" : "🆓"}
              </span>
              <span style={{ fontSize:13, fontWeight:600, color:t.text }}>{r.payment}</span>
            </div>
            {r.payStatus !== "—" && (
              <span style={{
                fontSize:10, fontWeight:700,
                color: r.payStatus === "Pago" ? "#22C55E" : "#F59E0B",
                background: r.payStatus === "Pago" ? "#22C55E22" : "#F59E0B22",
                padding:"2px 8px", borderRadius:20,
              }}>{r.payStatus}</span>
            )}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
            <span style={{ color:t.textMuted }}>Valor</span>
            <span style={{ fontWeight:700, color:t.text }}>{r.value}</span>
          </div>
          {r.payStatus === "Pago" && (
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginTop:4 }}>
              <span style={{ color:t.textMuted }}>Pago em</span>
              <span style={{ color:t.textMuted }}>15/07/2025 14:32</span>
            </div>
          )}
        </div>

        <div style={{ height:1, background:t.border }} />

        {/* ações */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Ações</div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <button style={{
              flex:1, padding:"8px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:12, cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}>✅ Check-in</button>
            <button style={{
              flex:1, padding:"8px", borderRadius:8,
              border:`1px solid ${t.border}`, background:"transparent",
              color:t.text, fontWeight:700, fontSize:12,
              cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}>✉ Enviar Ingresso</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{
              flex:1, padding:"8px", borderRadius:8,
              border:"1px solid #EF444444", background:"#EF444411",
              color:"#EF4444", fontWeight:700, fontSize:12,
              cursor:"pointer", fontFamily:"inherit",
            }}>Cancelar Reserva</button>
            <button style={{
              flex:1, padding:"8px", borderRadius:8,
              border:`1px solid ${t.border}`, background:"transparent",
              color:t.text, fontWeight:700, fontSize:12,
              cursor:"pointer", fontFamily:"inherit",
            }}>↩ Reembolsar</button>
          </div>
        </div>
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
        Mostrando {start} a {end} de {total} reservas
      </span>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <PagBtn onClick={() => onPage(Math.max(1,page-1))} disabled={page===1} theme={t}>‹</PagBtn>
        {pages.map((p) => (
          <PagBtn key={p} onClick={() => onPage(p)} active={p===page} theme={t}>{p}</PagBtn>
        ))}
        <span style={{ color:t.textMuted, fontSize:12 }}>···</span>
        <PagBtn onClick={() => onPage(totalPages)} theme={t}>{totalPages || 125}</PagBtn>
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