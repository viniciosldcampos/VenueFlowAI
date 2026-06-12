import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import waitlistService from "../services/waitlist.service";
import eventService from "../services/event.service";

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
  { icon:"✅", label:"Check-in",         path:"/checkin"      },
  { icon:"⚙",  label:"Configurações",   path:"/settings"     },
];

const STATUS_COLORS = {
  WAITING:   { color:"#705EBD", label:"Aguardando" },
  CALLED:    { color:"#F59E0B", label:"Chamado"    },
  CONVERTED: { color:"#22C55E", label:"Convertido" },
  EXPIRED:   { color:"#6B7280", label:"Expirado"   },
};

const TABS_BOTTOM = ["Fila de Espera","Histórico de Chamados","Regras da Fila","Mensagens Enviadas"];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Waitlist() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events,       setEvents]       = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [waitlist,     setWaitlist]     = useState([]);
  const [stats,        setStats]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [tabBottom,    setTabBottom]    = useState("Fila de Espera");
  const [page,         setPage]         = useState(1);
  const [pagination,   setPagination]   = useState({});
  const [refresh,      setRefresh]      = useState(0);
  const [calling,      setCalling]      = useState(false);

  const SPARK = [10,15,12,18,20,16,22,25,20,28];

  // carregar eventos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [ongoing, scheduled] = await Promise.all([
          eventService.getAll({ status:"ONGOING",   limit:20 }),
          eventService.getAll({ status:"SCHEDULED", limit:20 }),
        ]);
        const all = [...(ongoing.events||[]), ...(scheduled.events||[])];
        setEvents(all);
        if (all.length > 0) setSelectedEvent(all[0]);
      } catch (err) {
        console.error(err);
      }
    };
    loadEvents();
  }, []);

  // carregar fila do evento selecionado
  useEffect(() => {
    const loadWaitlist = async () => {
      if (!selectedEvent) return;
      try {
        setLoading(true);
        const data = await waitlistService.getByEvent(selectedEvent.id, { page, limit:5 });
        setWaitlist(data.waitlist || []);
        setStats(data.stats    || []);
        setPagination(data.pagination || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWaitlist();
  }, [selectedEvent, page, refresh]);

  const handleCallNext = async () => {
    if (!selectedEvent) return;
    try {
      setCalling(true);
      await waitlistService.callNext(selectedEvent.id);
      setRefresh(r => r + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setCalling(false);
    }
  };

  const handleConvert = async (id) => {
    try {
      await waitlistService.convert(id);
      setRefresh(r => r + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async (id) => {
    if (!confirm("Remover esta pessoa da fila?")) return;
    try {
      await waitlistService.leave(id);
      setRefresh(r => r + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  // calcular totais
  const totalWaiting   = stats.find(s => s.status === "WAITING")  ?._count?.status || 0;
  const totalCalled    = stats.find(s => s.status === "CALLED")   ?._count?.status || 0;
  const totalConverted = stats.find(s => s.status === "CONVERTED")?._count?.status || 0;
  const totalAll       = totalWaiting + totalCalled + totalConverted;
  const convRate       = totalAll > 0 ? Math.round((totalConverted / totalAll) * 100) : 0;

  const METRIC_CARDS = [
    { title:"Total na Fila",        value:totalWaiting,   icon:"👥", color:"#705EBD", sub:"aguardando",          sparkData:SPARK },
    { title:"Chamados",             value:totalCalled,    icon:"📞", color:"#22C55E", sub:"aguardando resposta", sparkData:SPARK },
    { title:"Convertidos",          value:totalConverted, icon:"🎫", color:"#F59E0B", sub:"compraram ingresso",  sparkData:SPARK },
    { title:"Taxa de Conversão",    value:`${convRate}%`, icon:"📊", color:"#4A90D9", sub:"dos chamados",        sparkData:SPARK },
  ];

  const queuePct = selectedEvent
    ? Math.min(100, Math.round((totalWaiting / (selectedEvent.tickets?.reduce((a,t) => a+t.quantity,0) || 1)) * 100))
    : 0;

  return (
    <div style={{
      display:"flex", height:"100vh", width:"100vw",
      background:t.bg, color:t.text,
      fontFamily:"'Sora', system-ui, sans-serif",
      overflow:"hidden", position:"fixed", top:0, left:0,
    }}>
      <Sidebar theme={t} navigate={navigate} user={user} logout={logout} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* TOPBAR */}
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
            </div>
            <button onClick={toggleDarkMode} style={{
              width:36, height:36, borderRadius:8, border:`1px solid ${t.border}`,
              background:t.surface, cursor:"pointer", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>{darkMode ? "☀" : "🌙"}</button>
            <button style={{
              padding:"8px 16px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
            }}>+ Nova Lista de Espera ▾</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* METRIC CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {METRIC_CARDS.map((c) => (
              <div key={c.title} style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:8,
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:10, color:t.textMuted, fontWeight:600, marginBottom:4 }}>{c.title}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:t.text }}>{c.value}</div>
                  </div>
                  <div style={{
                    width:42, height:42, borderRadius:10, background:`${c.color}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>{c.icon}</div>
                </div>
                <div style={{ height:38 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={c.sparkData.map((v,i) => ({i,v}))}>
                      <Area type="monotone" dataKey="v" stroke={c.color} fill={`${c.color}22`} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ fontSize:12, color:t.textMuted }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* CORPO PRINCIPAL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16, alignItems:"start" }}>

            {/* COLUNA ESQUERDA */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* seletor de evento */}
              <div style={{
                background:t.surface, borderRadius:12, padding:"14px 16px",
                border:`1px solid ${t.border}`,
                display:"flex", alignItems:"center", gap:12,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:t.textMuted, fontWeight:600, marginBottom:4 }}>Evento Selecionado</div>
                  <div style={{ fontSize:14, fontWeight:800, color:t.text }}>
                    {selectedEvent?.name || "Nenhum evento ativo"}
                  </div>
                  {selectedEvent && (
                    <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>
                      📅 {new Date(selectedEvent.date).toLocaleDateString("pt-BR")} · {selectedEvent.room?.name}
                    </div>
                  )}
                </div>
                <select
                  value={selectedEvent?.id || ""}
                  onChange={(e) => {
                    const ev = events.find(ev => ev.id === Number(e.target.value));
                    setSelectedEvent(ev || null);
                    setPage(1);
                  }}
                  style={{
                    padding:"8px 14px", borderRadius:8,
                    border:`1px solid ${t.border}`, background:t.bg,
                    color:t.text, fontSize:13, fontFamily:"inherit",
                    cursor:"pointer", outline:"none",
                  }}
                >
                  {events.length === 0 && <option value="">Nenhum evento ativo</option>}
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>

              {/* FILA DETALHADA */}
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
                </div>

                {tabBottom === "Fila de Espera" ? (
                  <>
                    {loading ? (
                      <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
                        <div style={{
                          width:32, height:32, borderRadius:"50%",
                          border:`3px solid ${t.border}`, borderTop:`3px solid #705EBD`,
                          animation:"spin 1s linear infinite",
                        }} />
                        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                      </div>
                    ) : waitlist.length === 0 ? (
                      <div style={{ textAlign:"center", padding:40, color:t.textMuted }}>
                        <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
                        <div style={{ fontSize:13 }}>Nenhuma pessoa na fila de espera</div>
                      </div>
                    ) : (
                      <>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                          <thead>
                            <tr style={{ borderBottom:`1px solid ${t.border}` }}>
                              {["Posição","Nome","Contato","Ingresso","Entrou na Fila","Status","Ações"].map((h) => (
                                <th key={h} style={{
                                  padding:"10px 14px", textAlign:"left",
                                  fontSize:11, fontWeight:700, color:t.textMuted, whiteSpace:"nowrap",
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {waitlist.map((m, i) => {
                              const status = STATUS_COLORS[m.status] || STATUS_COLORS.WAITING;
                              const medals = ["🥇","🥈","🥉"];
                              return (
                                <tr
                                  key={m.id}
                                  style={{
                                    borderBottom: i < waitlist.length-1 ? `1px solid ${t.border}` : "none",
                                    transition:"background 0.15s",
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <td style={{ padding:"10px 14px", textAlign:"center" }}>
                                    {m.position <= 3
                                      ? <span style={{ fontSize:18 }}>{medals[m.position-1]}</span>
                                      : <span style={{ fontSize:13, fontWeight:700, color:t.textMuted }}>{m.position}</span>
                                    }
                                  </td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                      <div style={{
                                        width:30, height:30, borderRadius:"50%",
                                        background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        fontSize:11, fontWeight:700, color:"#fff", flexShrink:0,
                                      }}>
                                        {m.user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                                      </div>
                                      <span style={{ fontSize:13, fontWeight:700, color:t.text }}>{m.user?.name}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <div style={{ fontSize:12, color:t.text }}>{m.user?.email}</div>
                                    <div style={{ fontSize:10, color:t.textMuted }}>{m.user?.phone || "—"}</div>
                                  </td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <span style={{
                                      fontSize:11, fontWeight:700, color:t.primary,
                                      background:`${t.primary}22`, padding:"3px 8px", borderRadius:20,
                                    }}>{m.ticketType}</span>
                                  </td>
                                  <td style={{ padding:"10px 14px", fontSize:11, color:t.textMuted }}>
                                    {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                                    {" "}
                                    {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                                  </td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <span style={{
                                      fontSize:11, fontWeight:700,
                                      color: status.color,
                                      background:`${status.color}22`,
                                      padding:"3px 8px", borderRadius:20,
                                    }}>{status.label}</span>
                                  </td>
                                  <td style={{ padding:"10px 14px" }}>
                                    <div style={{ display:"flex", gap:4 }}>
                                      {m.status === "CALLED" && (
                                        <button
                                          onClick={() => handleConvert(m.id)}
                                          style={{
                                            padding:"4px 8px", borderRadius:6, border:"none",
                                            background:"#22C55E22", color:"#22C55E",
                                            fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                                          }}
                                        >✓ Converter</button>
                                      )}
                                      {(m.status === "WAITING" || m.status === "CALLED") && (
                                        <button
                                          onClick={() => handleLeave(m.id)}
                                          style={{
                                            width:26, height:26, borderRadius:6,
                                            border:`1px solid ${t.border}`, background:"transparent",
                                            color:"#EF4444", cursor:"pointer", fontSize:12,
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                          }}
                                        >✕</button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* paginação */}
                        <div style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"10px 14px", borderTop:`1px solid ${t.border}`,
                        }}>
                          <span style={{ fontSize:12, color:t.textMuted }}>
                            {pagination.total || 0} pessoas na fila
                          </span>
                          {pagination.totalPages > 1 && (
                            <div style={{ display:"flex", gap:4 }}>
                              {Array.from({ length:pagination.totalPages }, (_,i) => i+1).map((p) => (
                                <button key={p} onClick={() => setPage(p)} style={{
                                  width:28, height:28, borderRadius:6,
                                  border:`1px solid ${p===page ? t.primary : t.border}`,
                                  background: p===page ? t.primary : "transparent",
                                  color: p===page ? "#fff" : t.text,
                                  cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12,
                                }}>{p}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ padding:"40px", textAlign:"center", color:t.textMuted, fontSize:13 }}>
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
                    background:`${t.primary}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
                  }}>🎭</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:t.text }}>
                      {selectedEvent?.name || "—"}
                    </div>
                    {selectedEvent && (
                      <>
                        <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>
                          🕐 {new Date(selectedEvent.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div style={{ fontSize:11, color:t.textMuted }}>
                          📍 {selectedEvent.room?.name || "—"}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* métricas */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                  {[
                    { value:totalWaiting,   label:"Na Fila",    color:t.primary  },
                    { value:totalCalled,    label:"Chamados",   color:"#22C55E"  },
                    { value:totalConverted, label:"Convertidos",color:"#F59E0B"  },
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

                <button
                  onClick={handleCallNext}
                  disabled={calling || !selectedEvent || totalWaiting === 0}
                  style={{
                    width:"100%", padding:"10px", borderRadius:8, border:"none",
                    background: (!selectedEvent || totalWaiting === 0)
                      ? t.border
                      : "linear-gradient(135deg, #705EBD, #A78BFA)",
                    color:"#fff", fontWeight:700, fontSize:13,
                    cursor: (!selectedEvent || totalWaiting === 0) ? "default" : "pointer",
                    fontFamily:"inherit",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}
                >📢 {calling ? "Chamando..." : "Chamar Próximo da Fila"}</button>

                {/* progresso */}
                <div style={{ marginTop:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
                    <span style={{ color:t.text, fontWeight:700 }}>Progresso da Fila</span>
                    <span style={{ color:t.textMuted }}>{totalWaiting} na fila</span>
                  </div>
                  <div style={{ height:8, background:t.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${Math.min(100, queuePct)}%`,
                      background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                      borderRadius:4, transition:"width 0.5s",
                    }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10 }}>
                    <span style={{ color:t.textMuted }}>Capacidade do evento</span>
                    <span style={{ color:t.textMuted }}>
                      {selectedEvent?.tickets?.reduce((a,t) => a+t.quantity, 0) || 0} lugares
                    </span>
                  </div>
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
                    { icon:"✉",  label:"Enviar Mensagem", color:t.primary,  bg:`${t.primary}22`  },
                    { icon:"📤", label:"Exportar Lista",  color:"#22C55E",  bg:"#22C55E22"       },
                    { icon:"⏸",  label:"Pausar Lista",   color:"#F59E0B",  bg:"#F59E0B22"       },
                    { icon:"⛔", label:"Encerrar Lista",  color:"#EF4444",  bg:"#EF444422"       },
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
function Sidebar({ theme:t, navigate, user, logout }) {
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
      <div style={{ padding:"12px", borderTop:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 4px" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, color:"#fff", flexShrink:0,
          }}>
            {user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.text }}>{user?.name}</div>
            <div style={{ fontSize:10, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.email}
            </div>
          </div>
          <button onClick={logout} title="Sair" style={{
            background:"none", border:"none", color:t.textMuted,
            cursor:"pointer", fontSize:14, padding:4,
          }}>→</button>
        </div>
      </div>
    </div>
  );
}