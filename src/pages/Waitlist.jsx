import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const WAITLISTS = [
  { id:1, event:"Show de Inverno 2025",   room:"Teatro Municipal",    date:"25/07/2025", time:"20:00", inQueue:482, calledToday:38, converted:56,  convRate:23, status:"Ativa",     capacity:500, color:"#705EBD" },
  { id:2, event:"Congresso Tech",         room:"Centro de Eventos",   date:"25/07/2025", time:"09:00", inQueue:120, calledToday:15, converted:18,  convRate:15, status:"Ativa",     capacity:150, color:"#4A90D9" },
  { id:3, event:"Peça: Além do Tempo",    room:"Teatro Municipal",    date:"26/07/2025", time:"19:30", inQueue:320, calledToday:25, converted:42,  convRate:19, status:"Ativa",     capacity:400, color:"#22C55E" },
  { id:4, event:"Workshop de Design",     room:"Sala Multiuso 03",    date:"28/07/2025", time:"14:00", inQueue:45,  calledToday:8,  converted:5,   convRate:11, status:"Pausada",   capacity:60,  color:"#D97706" },
  { id:5, event:"Palestra: Inovação",     room:"Auditório Principal", date:"29/07/2025", time:"10:00", inQueue:78,  calledToday:12, converted:9,   convRate:12, status:"Ativa",     capacity:500, color:"#06B6D4" },
  { id:6, event:"Espetáculo Infantil",    room:"Teatro Municipal",    date:"27/07/2025", time:"16:00", inQueue:203, calledToday:21, converted:28,  convRate:14, status:"Encerrada", capacity:300, color:"#EC4899" },
  { id:7, event:"Fórum de Inovação",      room:"Centro de Eventos",   date:"05/08/2025", time:"09:00", inQueue:0,   calledToday:0,  converted:0,   convRate:0,  status:"Pausada",   capacity:800, color:"#8B5CF6" },
];

const QUEUE_MEMBERS = [
  { pos:1,  medal:"🥇", name:"Mariana Santos",  email:"mariana@email.com",  phone:"(11) 98777-1234", ticket:"VIP",    entered:"24/07/2025 18:45", status:"Aguardando" },
  { pos:2,  medal:"🥈", name:"André Pereira",   email:"andre@email.com",    phone:"(11) 98666-5555", ticket:"Inteira",entered:"24/07/2025 18:46", status:"Aguardando" },
  { pos:3,  medal:"🥉", name:"Camila Mendes",   email:"camila@email.com",   phone:"(11) 98222-1111", ticket:"VIP",    entered:"24/07/2025 18:47", status:"Aguardando" },
  { pos:4,  medal:null,  name:"Beatriz Oliveira",email:"beatriz@email.com", phone:"(11) 94444-3333", ticket:"Meia",   entered:"24/07/2025 18:48", status:"Aguardando" },
  { pos:5,  medal:null,  name:"Pedro Henrique",  email:"pedro@email.com",   phone:"(11) 91111-0000", ticket:"Inteira",entered:"24/07/2025 18:49", status:"Aguardando" },
];

const LAST_CALLED = [
  { name:"Juliana Costa",   email:"juliana@email.com",  time:"10:32", result:"Convertido"  },
  { name:"Lucas Almeida",   email:"lucas@email.com",    time:"10:28", result:"Convertido"  },
  { name:"Fernanda Lima",   email:"fernanda@email.com", time:"10:24", result:"Não Atendeu" },
  { name:"Rafael Souza",    email:"rafael@email.com",   time:"10:20", result:"Convertido"  },
];

const METRIC_CARDS = [
  { title:"Total de Pessoas na Fila", value:"1.248", trend:"+18%", sub:"em relação à semana passada", icon:"👥", color:"#705EBD", sparkData:[800,850,900,950,1000,1050,1100,1150,1200,1248] },
  { title:"Chamados Hoje",            value:"86",    trend:"+12%", sub:"em relação a ontem",           icon:"📞", color:"#22C55E", sparkData:[50,55,60,65,62,68,72,75,80,86]                },
  { title:"Conversões (7 dias)",      value:"124",   trend:"+22%", sub:"em relação à semana passada",  icon:"🎫", color:"#F59E0B", sparkData:[70,75,80,85,90,95,100,105,115,124]             },
  { title:"Taxa de Conversão",        value:"24,7%", trend:"+8%",  sub:"em relação à semana passada",  icon:"📊", color:"#4A90D9", sparkData:[15,16,17,18,19,20,21,22,23,24.7]              },
];

const STATUS_COLORS = {
  "Ativa":     "#22C55E",
  "Pausada":   "#F59E0B",
  "Encerrada": "#6B7280",
};

const QUEUE_STATUS_COLORS = {
  "Aguardando":  "#705EBD",
  "Convertido":  "#22C55E",
  "Não Atendeu": "#EF4444",
};

const TABS_TOP   = ["Todas as Listas","Ativas","Pausadas","Encerradas"];
const TABS_BOTTOM = ["Fila de Espera","Histórico de Chamados","Regras da Fila","Mensagens Enviadas"];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/calendar"     },
  { icon:"🎫", label:"Reservas",         path:"/reservations" },
  { icon:"👥", label:"Clientes",         path:"/clients"      },
  { icon:"💰", label:"Financeiro",       path:"/financial"    },
  { icon:"📊", label:"Relatórios",       path:"/reports"      },
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist", active:true },
  { icon:"✅", label:"Check-in",         path:"/"             },
  { icon:"⚙",  label:"Configurações",   path:"/"             },
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Waitlist() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [tabTop,    setTabTop]    = useState("Todas as Listas");
  const [tabBottom, setTabBottom] = useState("Fila de Espera");
  const [selectedId, setSelectedId] = useState(1);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);

  const filtered = WAITLISTS.filter((w) => {
    const matchTab =
      tabTop === "Todas as Listas" ? true :
      tabTop === "Ativas"          ? w.status === "Ativa"     :
      tabTop === "Pausadas"        ? w.status === "Pausada"   :
      tabTop === "Encerradas"      ? w.status === "Encerrada" : true;
    const matchSearch = w.event.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const selected = WAITLISTS.find((w) => w.id === selectedId) || WAITLISTS[0];
  const queuePct = Math.round((selected.inQueue / selected.capacity) * 100);

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

        <div style={{ flex:1, overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* METRIC CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {METRIC_CARDS.map((c) => <MetricCard key={c.title} card={c} theme={t} />)}
          </div>

          {/* CORPO PRINCIPAL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16, alignItems:"start" }}>

            {/* COLUNA ESQUERDA */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* TABELA DE LISTAS */}
              <div style={{
                background:t.surface, borderRadius:12,
                border:`1px solid ${t.border}`, overflow:"hidden",
              }}>
                {/* tabs + filtros */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"0 14px", borderBottom:`1px solid ${t.border}`, flexWrap:"wrap", gap:8,
                }}>
                  <div style={{ display:"flex" }}>
                    {TABS_TOP.map((tb) => (
                      <button key={tb} onClick={() => setTabTop(tb)} style={{
                        padding:"12px 14px", border:"none", background:"transparent",
                        cursor:"pointer", fontSize:13,
                        fontWeight: tabTop===tb ? 700 : 400,
                        color:      tabTop===tb ? t.primary : t.textMuted,
                        borderBottom: tabTop===tb ? `2px solid ${t.primary}` : "2px solid transparent",
                        fontFamily:"inherit", transition:"all 0.15s", whiteSpace:"nowrap",
                      }}>{tb}</button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", padding:"8px 0" }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:6,
                      background:t.bg, border:`1px solid ${t.border}`,
                      borderRadius:7, padding:"6px 10px",
                    }}>
                      <span style={{ color:t.textMuted, fontSize:12 }}>🔍</span>
                      <input
                        placeholder="Buscar por evento..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                          background:"none", border:"none", color:t.text,
                          fontSize:12, outline:"none", width:120, fontFamily:"inherit",
                        }}
                      />
                    </div>
                    <FilterSelect theme={t} options={["Todos os Eventos","Show de Inverno","Congresso Tech"]} />
                    <FilterSelect theme={t} options={["Todos os Status","Ativa","Pausada","Encerrada"]} />
                    <button style={{
                      display:"flex", alignItems:"center", gap:5,
                      padding:"6px 10px", borderRadius:7,
                      border:`1px solid ${t.border}`, background:t.bg,
                      color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                    }}>🔧 Filtros</button>
                    <ViewToggle theme={t} />
                  </div>
                </div>

                {/* tabela */}
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${t.border}` }}>
                      {["Evento","Data","Pessoas na Fila","Chamados Hoje","Conversões","Status","Ações"].map((h) => (
                        <th key={h} style={{
                          padding:"10px 14px", textAlign:"left",
                          fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((w, i) => (
                      <tr
                        key={w.id}
                        onClick={() => setSelectedId(w.id)}
                        style={{
                          borderBottom: i < filtered.length-1 ? `1px solid ${t.border}` : "none",
                          background: w.id===selectedId ? `${t.primary}11` : "transparent",
                          cursor:"pointer", transition:"background 0.15s",
                        }}
                        onMouseEnter={(e) => { if(w.id!==selectedId) e.currentTarget.style.background = t.bg; }}
                        onMouseLeave={(e) => { if(w.id!==selectedId) e.currentTarget.style.background = "transparent"; }}
                      >
                        {/* evento */}
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{
                              width:38, height:38, borderRadius:8, flexShrink:0,
                              background:`${w.color}22`,
                              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                            }}>🎭</div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:700, color:t.text }}>{w.event}</div>
                              <div style={{ fontSize:10, color:t.textMuted }}>{w.room}</div>
                            </div>
                          </div>
                        </td>
                        {/* data */}
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ fontSize:12, color:t.text }}>{w.date}</div>
                          <div style={{ fontSize:10, color:t.textMuted }}>{w.time}</div>
                        </td>
                        {/* fila */}
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{w.inQueue}</div>
                          {w.calledToday > 0 && (
                            <div style={{ fontSize:10, color:"#22C55E" }}>+{Math.floor(w.inQueue * 0.07)} hoje</div>
                          )}
                        </td>
                        {/* chamados */}
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{w.calledToday}</div>
                          {w.calledToday > 0 && (
                            <div style={{ fontSize:10, color:"#22C55E" }}>+{Math.floor(w.calledToday * 0.3)} hoje</div>
                          )}
                        </td>
                        {/* conversões */}
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ fontSize:14, fontWeight:800, color:t.text }}>
                            {w.converted > 0 ? w.converted : "—"}
                          </div>
                          {w.converted > 0 && (
                            <div style={{ fontSize:10, color:t.textMuted }}>{w.convRate}%</div>
                          )}
                        </td>
                        {/* status */}
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{
                            fontSize:11, fontWeight:700,
                            color: STATUS_COLORS[w.status] || t.textMuted,
                            background:`${STATUS_COLORS[w.status] || t.border}22`,
                            padding:"3px 10px", borderRadius:20,
                            display:"flex", alignItems:"center", gap:5, width:"fit-content",
                          }}>
                            <span style={{
                              width:6, height:6, borderRadius:"50%",
                              background: STATUS_COLORS[w.status], display:"inline-block",
                            }} />
                            {w.status}
                          </span>
                        </td>
                        {/* ações */}
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button style={{
                              width:26, height:26, borderRadius:6,
                              border:`1px solid ${t.border}`, background:"transparent",
                              color:t.textMuted, cursor:"pointer", fontSize:12,
                              display:"flex", alignItems:"center", justifyContent:"center",
                            }}>👁</button>
                            <button style={{
                              padding:"4px 10px", borderRadius:6, border:"none",
                              background:t.primary, color:"#fff",
                              fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                            }}>Gerenciar</button>
                            <button style={{
                              width:26, height:26, borderRadius:6,
                              border:`1px solid ${t.border}`, background:"transparent",
                              color:t.textMuted, cursor:"pointer", fontSize:12,
                              display:"flex", alignItems:"center", justifyContent:"center",
                            }}>···</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAINEL INFERIOR: FILA DETALHADA */}
              <div style={{
                background:t.surface, borderRadius:12,
                border:`1px solid ${t.border}`, overflow:"hidden",
              }}>
                {/* tabs */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"0 14px", borderBottom:`1px solid ${t.border}`,
                }}>
                  <div style={{ display:"flex" }}>
                    {TABS_BOTTOM.map((tb) => (
                      <button key={tb} onClick={() => setTabBottom(tb)} style={{
                        padding:"11px 14px", border:"none", background:"transparent",
                        cursor:"pointer", fontSize:12,
                        fontWeight: tabBottom===tb ? 700 : 400,
                        color:      tabBottom===tb ? t.primary : t.textMuted,
                        borderBottom: tabBottom===tb ? `2px solid ${t.primary}` : "2px solid transparent",
                        fontFamily:"inherit", transition:"all 0.15s", whiteSpace:"nowrap",
                      }}>{tb}</button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, padding:"8px 0" }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:6,
                      background:t.bg, border:`1px solid ${t.border}`,
                      borderRadius:7, padding:"5px 10px",
                    }}>
                      <span style={{ color:t.textMuted, fontSize:12 }}>🔍</span>
                      <input placeholder="Buscar na fila..." style={{
                        background:"none", border:"none", color:t.text,
                        fontSize:12, outline:"none", width:130, fontFamily:"inherit",
                      }} />
                    </div>
                    <FilterSelect theme={t} options={["Todos os Status","Aguardando","Convertido","Não Atendeu"]} />
                    <button style={{
                      display:"flex", alignItems:"center", gap:5,
                      padding:"6px 10px", borderRadius:7,
                      border:`1px solid ${t.border}`, background:t.bg,
                      color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                    }}>🔧 Ações em Lote</button>
                  </div>
                </div>

                {/* tabela da fila */}
                {tabBottom === "Fila de Espera" && (
                  <>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ borderBottom:`1px solid ${t.border}` }}>
                          {["Posição","Nome","Contato","Ingresso Desejado","Entrou na Fila","Status","Ações"].map((h) => (
                            <th key={h} style={{
                              padding:"10px 14px", textAlign:"left",
                              fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {QUEUE_MEMBERS.map((m, i) => (
                          <tr
                            key={m.pos}
                            style={{
                              borderBottom: i < QUEUE_MEMBERS.length-1 ? `1px solid ${t.border}` : "none",
                              transition:"background 0.15s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding:"10px 14px", textAlign:"center" }}>
                              {m.medal
                                ? <span style={{ fontSize:18 }}>{m.medal}</span>
                                : <span style={{ fontSize:13, fontWeight:700, color:t.textMuted }}>{m.pos}</span>
                              }
                            </td>
                            <td style={{ padding:"10px 14px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{
                                  width:30, height:30, borderRadius:"50%",
                                  background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:11, fontWeight:700, color:"#fff", flexShrink:0,
                                }}>{m.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                                <span style={{ fontSize:13, fontWeight:700, color:t.text }}>{m.name}</span>
                              </div>
                            </td>
                            <td style={{ padding:"10px 14px" }}>
                              <div style={{ fontSize:12, color:t.text }}>{m.email}</div>
                              <div style={{ fontSize:10, color:t.textMuted }}>{m.phone}</div>
                            </td>
                            <td style={{ padding:"10px 14px" }}>
                              <span style={{
                                fontSize:11, fontWeight:700,
                                color: m.ticket==="VIP" ? "#F59E0B" : m.ticket==="Meia" ? "#4A90D9" : "#705EBD",
                                background: m.ticket==="VIP" ? "#F59E0B22" : m.ticket==="Meia" ? "#4A90D922" : "#705EBD22",
                                padding:"3px 8px", borderRadius:20,
                              }}>{m.ticket}</span>
                            </td>
                            <td style={{ padding:"10px 14px", fontSize:11, color:t.textMuted }}>{m.entered}</td>
                            <td style={{ padding:"10px 14px" }}>
                              <span style={{
                                fontSize:11, fontWeight:700,
                                color: QUEUE_STATUS_COLORS[m.status] || t.textMuted,
                                background:`${QUEUE_STATUS_COLORS[m.status] || t.border}22`,
                                padding:"3px 8px", borderRadius:20,
                              }}>{m.status}</span>
                            </td>
                            <td style={{ padding:"10px 14px" }}>
                              <div style={{ display:"flex", gap:4 }}>
                                <button style={{
                                  width:26, height:26, borderRadius:6,
                                  border:`1px solid ${t.border}`, background:"transparent",
                                  color:t.textMuted, cursor:"pointer", fontSize:13,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                }}>💬</button>
                                <button style={{
                                  width:26, height:26, borderRadius:6,
                                  border:`1px solid ${t.border}`, background:"transparent",
                                  color:t.textMuted, cursor:"pointer", fontSize:12,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                }}>···</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* paginação */}
                    <div style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"10px 14px", borderTop:`1px solid ${t.border}`,
                    }}>
                      <span style={{ fontSize:12, color:t.textMuted }}>
                        Mostrando 1 a 5 de {selected.inQueue} pessoas
                      </span>
                      <div style={{ display:"flex", gap:4 }}>
                        <PagBtn disabled theme={t}>‹</PagBtn>
                        {[1,2,3,4,5].map((p) => (
                          <PagBtn key={p} onClick={() => setPage(p)} active={p===page} theme={t}>{p}</PagBtn>
                        ))}
                        <span style={{ color:t.textMuted, fontSize:12, display:"flex", alignItems:"center" }}>···</span>
                        <PagBtn theme={t}>97</PagBtn>
                        <PagBtn theme={t}>›</PagBtn>
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
                  </>
                )}

                {tabBottom !== "Fila de Espera" && (
                  <div style={{
                    padding:"40px", textAlign:"center",
                    color:t.textMuted, fontSize:13,
                  }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>
                      {tabBottom === "Histórico de Chamados" ? "📋" :
                       tabBottom === "Regras da Fila" ? "⚙" : "✉"}
                    </div>
                    {tabBottom} — em desenvolvimento
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* evento selecionado */}
              <div style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`,
              }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:12 }}>
                  Evento Selecionado
                </div>
                <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                  <div style={{
                    width:60, height:60, borderRadius:10, flexShrink:0,
                    background:`${selected.color}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
                  }}>🎭</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:t.text }}>{selected.event}</div>
                    <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>🕐 {selected.date} às {selected.time}</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>📍 {selected.room}</div>
                  </div>
                </div>

                {/* métricas */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                  {[
                    { value:selected.inQueue,    label:"Na Fila",       color:t.primary  },
                    { value:selected.calledToday, label:"Chamados Hoje", color:"#22C55E"  },
                    { value:selected.converted,  label:"Convertidos",   color:"#F59E0B"  },
                  ].map((m) => (
                    <div key={m.label} style={{
                      background:t.bg, borderRadius:8, padding:"8px",
                      border:`1px solid ${t.border}`, textAlign:"center",
                    }}>
                      <div style={{ fontSize:16, fontWeight:800, color:m.color }}>{m.value}</div>
                      <div style={{ fontSize:9, color:t.textMuted, marginTop:2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <button style={{
                  width:"100%", padding:"10px", borderRadius:8, border:"none",
                  background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                  color:"#fff", fontWeight:700, fontSize:13,
                  cursor:"pointer", fontFamily:"inherit",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>📢 Chamar Próximo da Fila</button>

                {/* progresso */}
                <div style={{ marginTop:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
                    <span style={{ color:t.text, fontWeight:700 }}>Progresso da Fila</span>
                    <span style={{ color:t.textMuted }}>{selected.inQueue} / {selected.capacity}</span>
                  </div>
                  <div style={{ height:8, background:t.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${queuePct}%`,
                      background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                      borderRadius:4, transition:"width 0.5s",
                    }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10 }}>
                    <span style={{ color:t.textMuted }}>Capacidade do evento</span>
                    <span style={{ color:t.textMuted }}>{selected.capacity} lugares</span>
                  </div>
                </div>
              </div>

              {/* últimos chamados */}
              <div style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`,
              }}>
                <div style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12,
                }}>
                  <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Últimos Chamados</span>
                  <button style={{
                    background:"none", border:"none", color:t.primary,
                    fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
                  }}>Ver todos</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {LAST_CALLED.map((c, i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:10,
                    }}>
                      <div style={{
                        width:32, height:32, borderRadius:"50%",
                        background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:700, color:"#fff", flexShrink:0,
                      }}>{c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{c.name}</div>
                        <div style={{ fontSize:10, color:t.textMuted }}>{c.email}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:t.textMuted }}>{c.time}</div>
                        <span style={{
                          fontSize:10, fontWeight:700,
                          color: c.result === "Convertido" ? "#22C55E" : "#EF4444",
                        }}>{c.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ações rápidas */}
              <div style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`,
              }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:12 }}>
                  Ações Rápidas
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { icon:"✉", label:"Enviar Mensagem", color:t.primary,  bg:`${t.primary}22`   },
                    { icon:"📤", label:"Exportar Lista",  color:"#22C55E",  bg:"#22C55E22"        },
                    { icon:"⏸", label:"Pausar Lista",    color:"#F59E0B",  bg:"#F59E0B22"        },
                    { icon:"⛔", label:"Encerrar Lista",  color:"#EF4444",  bg:"#EF444422"        },
                  ].map((btn) => (
                    <button key={btn.label} style={{
                      padding:"10px 8px", borderRadius:8,
                      border:`1px solid ${btn.color}44`, background:btn.bg,
                      color:btn.color, fontWeight:700, fontSize:11,
                      cursor:"pointer", fontFamily:"inherit",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    }}>{btn.icon} {btn.label}</button>
                  ))}
                </div>
              </div>
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
            Eventos com lista de espera ativa convertem em média 32% mais ingressos!
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
        <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Listas de Espera</div>
        <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
          Gerencie as filas de espera dos seus eventos em tempo real.
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:t.surface, border:`1px solid ${t.border}`,
          borderRadius:8, padding:"8px 12px", width:290,
        }}>
          <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
          <input placeholder="Buscar por nome, e-mail ou ingresso..." style={{
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
        }}>+ Nova Lista de Espera ▾</button>
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
          <div style={{ fontSize:10, color:t.textMuted, fontWeight:600, marginBottom:4 }}>{card.title}</div>
          <div style={{ fontSize:22, fontWeight:800, color:t.text }}>{card.value}</div>
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
        <span style={{ color:"#22C55E", fontWeight:700 }}>↑ {card.trend}</span>
        <span style={{ color:t.textMuted }}>{card.sub}</span>
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function PagBtn({ children, onClick, disabled, active, theme:t }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:28, height:28, borderRadius:6, fontFamily:"inherit",
      border:`1px solid ${active ? t.primary : t.border}`,
      background: active ? t.primary : "transparent",
      color: disabled ? t.border : active ? "#fff" : t.text,
      cursor: disabled ? "default" : "pointer",
      fontSize:12, fontWeight: active ? 700 : 400,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</button>
  );
}

function FilterSelect({ theme:t, options }) {
  return (
    <select style={{
      background:t.surface, border:`1px solid ${t.border}`,
      borderRadius:7, color:t.text, fontSize:12,
      padding:"6px 10px", cursor:"pointer", fontFamily:"inherit",
    }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function ViewToggle({ theme:t }) {
  const [v, setV] = useState("grid");
  return (
    <div style={{
      display:"flex", background:t.bg, borderRadius:7,
      padding:2, gap:2, border:`1px solid ${t.border}`,
    }}>
      {[{id:"grid",icon:"⊞"},{id:"list",icon:"☰"}].map((item) => (
        <button key={item.id} onClick={() => setV(item.id)} style={{
          width:26, height:26, borderRadius:5, border:"none",
          cursor:"pointer", fontSize:13,
          background: v===item.id ? t.primary : "transparent",
          color:      v===item.id ? "#fff" : t.textMuted,
          transition:"all 0.15s",
        }}>{item.icon}</button>
      ))}
    </div>
  );
}