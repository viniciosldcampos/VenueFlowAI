// frontend/src/pages/Checkin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import checkinService from "../services/checkin.service";
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
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist"     },
  { icon:"✅", label:"Check-in",         path:"/checkin", active:true },
  { icon:"⚙",  label:"Configurações",   path:"/settings"     },
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Checkin() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [scanTab,      setScanTab]      = useState("Leitor de QR Code");
  const [code,         setCode]         = useState("");
  const [manualCode,   setManualCode]   = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  // evento selecionado
  const [events,       setEvents]       = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // atividades recentes
  const [activity,    setActivity]     = useState([]);
  const [stats,       setStats]        = useState(null);

  // carregar eventos ativos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventService.getAll({ status:"ONGOING", limit:20 });
        const scheduled = await eventService.getAll({ status:"SCHEDULED", limit:20 });
        const all = [...(data.events || []), ...(scheduled.events || [])];
        setEvents(all);
        if (all.length > 0) setSelectedEvent(all[0]);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      }
    };
    loadEvents();
  }, []);

  // carregar atividades e stats do evento selecionado
  useEffect(() => {
    const loadActivity = async () => {
      if (!selectedEvent) return;
      try {
        const data = await checkinService.getByEvent(selectedEvent.id, { limit:5 });
        setActivity(data.checkins || []);
        setStats(data.stats || null);
      } catch (err) {
        console.error("Erro ao carregar atividades:", err);
      }
    };
    loadActivity();
  }, [selectedEvent, result]);

  const handleCheckin = async (checkinCode) => {
    if (!checkinCode || !selectedEvent) {
      setError("Digite o código do ingresso e selecione um evento");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const data = await checkinService.doCheckin(checkinCode, selectedEvent.id, "QR_CODE");
      setResult(data);
      setCode("");
      setManualCode("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const occ = stats && stats.totalCapacity > 0
    ? Math.round((stats.totalCheckins / stats.totalCapacity) * 100)
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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Check-in</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Realize o check-in dos participantes de forma rápida e segura.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:t.surface, border:`1px solid ${t.border}`,
              borderRadius:8, padding:"8px 12px", width:280,
            }}>
              <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
              <input placeholder="Buscar por nome, ingresso ou e-mail..." style={{
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
              display:"flex", alignItems:"center", gap:6,
            }}>📋 Histórico de Check-ins</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* EVENTO ATUAL */}
          <div style={{
            background:t.surface, borderRadius:12, padding:"14px 18px",
            border:`1px solid ${t.border}`,
            display:"flex", alignItems:"center", gap:16,
          }}>
            <div style={{
              width:72, height:52, borderRadius:8, flexShrink:0,
              background:`${t.primary}22`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
            }}>🎭</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:t.textMuted, fontWeight:600, marginBottom:3 }}>
                Evento Atual
              </div>
              {selectedEvent ? (
                <>
                  <div style={{ fontSize:16, fontWeight:800, color:t.text }}>{selectedEvent.name}</div>
                  <div style={{ display:"flex", gap:16, marginTop:3 }}>
                    <span style={{ fontSize:11, color:t.textMuted }}>
                      📅 {new Date(selectedEvent.date).toLocaleDateString("pt-BR", {
                        day:"2-digit", month:"short", year:"numeric",
                        hour:"2-digit", minute:"2-digit",
                      })}
                    </span>
                    {selectedEvent.room && (
                      <span style={{ fontSize:11, color:t.textMuted }}>
                        📍 {selectedEvent.room.name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ fontSize:14, color:t.textMuted }}>Nenhum evento ativo</div>
              )}
            </div>
            <select
              value={selectedEvent?.id || ""}
              onChange={(e) => {
                const ev = events.find(ev => ev.id === Number(e.target.value));
                setSelectedEvent(ev || null);
                setResult(null);
                setError("");
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

          {/* ÁREA PRINCIPAL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 300px", gap:16, alignItems:"start" }}>

            {/* LEITOR */}
            <div style={{
              background:t.surface, borderRadius:12,
              border:`1px solid ${t.border}`, overflow:"hidden",
            }}>
              <div style={{ display:"flex", borderBottom:`1px solid ${t.border}` }}>
                {["Leitor de QR Code","Busca Manual"].map((tab) => (
                  <button key={tab} onClick={() => setScanTab(tab)} style={{
                    flex:1, padding:"12px 0", border:"none", background:"transparent",
                    cursor:"pointer", fontSize:13,
                    fontWeight: scanTab===tab ? 700 : 400,
                    color:      scanTab===tab ? t.primary : t.textMuted,
                    borderBottom: scanTab===tab ? `2px solid ${t.primary}` : "2px solid transparent",
                    fontFamily:"inherit", transition:"all 0.15s",
                  }}>{tab}</button>
                ))}
              </div>

              <div style={{ padding:24 }}>
                {scanTab === "Leitor de QR Code" ? (
                  <>
                    {/* frame QR */}
                    <div style={{
                      width:"100%", aspectRatio:"1", maxHeight:240,
                      background: cameraActive ? "#000" : t.bg,
                      borderRadius:12, border:`2px dashed ${t.border}`,
                      display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center",
                      position:"relative", overflow:"hidden", marginBottom:16,
                    }}>
                      {[
                        { top:12, left:12,  borderTop:`3px solid ${t.primary}`, borderLeft:`3px solid ${t.primary}` },
                        { top:12, right:12, borderTop:`3px solid ${t.primary}`, borderRight:`3px solid ${t.primary}` },
                        { bottom:12, left:12,  borderBottom:`3px solid ${t.primary}`, borderLeft:`3px solid ${t.primary}` },
                        { bottom:12, right:12, borderBottom:`3px solid ${t.primary}`, borderRight:`3px solid ${t.primary}` },
                      ].map((style, i) => (
                        <div key={i} style={{ position:"absolute", width:28, height:28, borderRadius:3, ...style }} />
                      ))}

                      {cameraActive ? (
                        <div style={{ color:"#fff", fontSize:13, textAlign:"center" }}>
                          <div style={{ fontSize:36, marginBottom:8 }}>📷</div>
                          Câmera ativa
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize:40, opacity:0.2, marginBottom:12 }}>⬛</div>
                          <div style={{ fontSize:13, color:t.textMuted, textAlign:"center", lineHeight:1.6 }}>
                            Aponte o QR Code do ingresso
                            <br />
                            <span style={{ fontSize:11 }}>Centralize o código no frame</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* input código */}
                    <div style={{ marginBottom:12 }}>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key==="Enter" && handleCheckin(code)}
                        placeholder="Digite o código do ingresso..."
                        style={{
                          width:"100%", padding:"10px 14px", borderRadius:8,
                          border:`1px solid ${t.border}`, background:t.bg,
                          color:t.text, fontSize:13, fontFamily:"inherit",
                          outline:"none", boxSizing:"border-box", marginBottom:8,
                        }}
                      />
                    </div>

                    <div style={{ textAlign:"center", color:t.textMuted, fontSize:12, marginBottom:14 }}>ou</div>

                    <button
                      onClick={() => { setCameraActive(!cameraActive); }}
                      style={{
                        width:"100%", padding:"11px",
                        borderRadius:8, border:`1px solid ${t.border}`,
                        background:cameraActive ? t.primary : t.bg,
                        color: cameraActive ? "#fff" : t.text,
                        fontWeight:700, fontSize:13, cursor:"pointer",
                        fontFamily:"inherit", marginBottom:12,
                      }}
                    >📷 {cameraActive ? "Desativar câmera" : "Ativar câmera"}</button>

                    <button
                      onClick={() => handleCheckin(code)}
                      disabled={loading || !code}
                      style={{
                        width:"100%", padding:"11px", borderRadius:8, border:"none",
                        background: (!code || loading) ? t.border : "linear-gradient(135deg, #705EBD, #A78BFA)",
                        color:"#fff", fontWeight:700, fontSize:13,
                        cursor: (!code || loading) ? "default" : "pointer",
                        fontFamily:"inherit",
                      }}
                    >{loading ? "Processando..." : "Fazer Check-in"}</button>
                  </>
                ) : (
                  /* BUSCA MANUAL */
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div>
                      <div style={{ fontSize:12, color:t.textMuted, marginBottom:6, fontWeight:600 }}>
                        Código do Ingresso
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <input
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                          placeholder="Ex: RES-2026-XXXXX"
                          style={{
                            flex:1, padding:"10px 12px", borderRadius:8,
                            border:`1px solid ${t.border}`, background:t.bg,
                            color:t.text, fontSize:13, fontFamily:"inherit", outline:"none",
                          }}
                        />
                        <button
                          onClick={() => handleCheckin(manualCode)}
                          disabled={loading || !manualCode}
                          style={{
                            padding:"10px 16px", borderRadius:8, border:"none",
                            background: (!manualCode || loading) ? t.border : t.primary,
                            color:"#fff", fontWeight:700, fontSize:13,
                            cursor: (!manualCode || loading) ? "default" : "pointer",
                            fontFamily:"inherit",
                          }}
                        >Buscar</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* erro */}
                {error && (
                  <div style={{
                    marginTop:12, background:"#EF444422",
                    border:"1px solid #EF444444", borderRadius:8,
                    padding:"10px 14px", fontSize:12, color:"#EF4444",
                  }}>⚠ {error}</div>
                )}
              </div>
            </div>

            {/* RESULTADO */}
            {result ? (
              <div style={{
                background:t.surface, borderRadius:12,
                border:`1px solid ${t.border}`, overflow:"hidden",
              }}>
                {/* banner sucesso */}
                <div style={{
                  background:"#22C55E11", borderBottom:"1px solid #22C55E33",
                  padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>✅</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:"#22C55E" }}>
                        Check-in realizado com sucesso!
                      </div>
                      <div style={{ fontSize:11, color:t.textMuted }}>
                        Entrada registrada às {new Date(result.checkin?.checkedAt).toLocaleTimeString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setResult(null)} style={{
                    background:"none", border:"none", color:t.textMuted,
                    cursor:"pointer", fontSize:18,
                  }}>✕</button>
                </div>

                <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
                  {/* cliente */}
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{
                      width:56, height:56, borderRadius:"50%", flexShrink:0,
                      background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:20, fontWeight:700, color:"#fff",
                    }}>
                      {result.reservation?.user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:17, fontWeight:800, color:t.text }}>
                        {result.reservation?.user?.name}
                      </div>
                      <div style={{ fontSize:12, color:t.textMuted }}>
                        ✉ {result.reservation?.user?.email}
                      </div>
                      <div style={{ fontSize:12, color:t.textMuted }}>
                        📞 {result.reservation?.user?.phone || "—"}
                      </div>
                    </div>
                  </div>

                  {/* detalhes do ingresso */}
                  <div style={{
                    background:t.bg, borderRadius:10, padding:14,
                    border:`1px solid ${t.border}`,
                    display:"flex", flexDirection:"column", gap:8,
                  }}>
                    {[
                      { label:"Código",      value:result.reservation?.code                    },
                      { label:"Evento",      value:result.reservation?.event?.name             },
                      { label:"Método",      value:result.checkin?.method                      },
                    ].map((row) => (
                      <div key={row.label} style={{
                        display:"flex", justifyContent:"space-between",
                        fontSize:12, paddingBottom:6,
                        borderBottom:`1px solid ${t.border}`,
                      }}>
                        <span style={{ color:t.textMuted }}>{row.label}</span>
                        <span style={{ fontWeight:700, color:t.text }}>{row.value || "—"}</span>
                      </div>
                    ))}

                    {/* ingressos */}
                    {result.reservation?.items?.map((item, i) => (
                      <div key={i} style={{
                        display:"flex", justifyContent:"space-between",
                        fontSize:12, paddingBottom:6,
                        borderBottom:`1px solid ${t.border}`,
                      }}>
                        <span style={{ color:t.textMuted }}>
                          {item.ticket?.type} x{item.quantity}
                        </span>
                        <span style={{ fontWeight:700, color:t.text }}>
                          R$ {(Number(item.price) * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button style={{
                    width:"100%", padding:"11px", borderRadius:8, border:"none",
                    background:"#22C55E", color:"#fff",
                    fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}>✅ Check-in Confirmado</button>

                  <button
                    onClick={() => { setResult(null); setCode(""); setManualCode(""); }}
                    style={{
                      width:"100%", padding:"13px", borderRadius:8, border:"none",
                      background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                      color:"#fff", fontWeight:800, fontSize:14,
                      cursor:"pointer", fontFamily:"inherit",
                    }}
                  >Próximo Check-in →</button>
                </div>
              </div>
            ) : (
              <div style={{
                background:t.surface, borderRadius:12,
                border:`1px solid ${t.border}`,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                padding:40, gap:12, textAlign:"center",
              }}>
                <div style={{ fontSize:52, opacity:0.3 }}>🎫</div>
                <div style={{ fontSize:15, fontWeight:700, color:t.text }}>
                  Aguardando leitura
                </div>
                <div style={{ fontSize:12, color:t.textMuted, lineHeight:1.6, maxWidth:220 }}>
                  Escaneie um QR Code ou faça uma busca manual para realizar o check-in.
                </div>
              </div>
            )}

            {/* PAINEL DIREITO */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* métricas em tempo real */}
              <div style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`,
              }}>
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14,
                }}>
                  <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Evento em tempo real</span>
                  <span style={{
                    fontSize:10, fontWeight:700, color:"#22C55E",
                    background:"#22C55E22", padding:"3px 8px", borderRadius:20,
                    display:"flex", alignItems:"center", gap:4,
                  }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", display:"inline-block" }} />
                    Ao vivo
                  </span>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                  {[
                    { value:stats?.totalSold      || 0, label:"Ingressos Vendidos",    color:t.primary, icon:"🎫" },
                    { value:stats?.totalCheckins  || 0, label:"Check-ins Realizados",  color:"#22C55E", icon:"✅" },
                    { value:stats?.waiting        || 0, label:"Aguardando",            color:"#F59E0B", icon:"⏳" },
                    { value:stats?.totalCapacity  || 0, label:"Capacidade Total",      color:t.textMuted,icon:"🏟"},
                  ].map((m) => (
                    <div key={m.label} style={{
                      background:t.bg, borderRadius:8, padding:"10px",
                      border:`1px solid ${t.border}`,
                      display:"flex", alignItems:"center", gap:8,
                    }}>
                      <div style={{
                        width:32, height:32, borderRadius:8, flexShrink:0,
                        background:`${m.color}22`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                      }}>{m.icon}</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:800, color:m.color }}>{m.value}</div>
                        <div style={{ fontSize:9, color:t.textMuted, marginTop:1, lineHeight:1.3 }}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* barra de ocupação */}
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                    <span style={{ color:t.text, fontWeight:700 }}>Ocupação do Evento</span>
                    <span style={{ color:t.primary, fontWeight:700 }}>{occ}%</span>
                  </div>
                  <div style={{ height:8, background:t.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${occ}%`,
                      background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                      borderRadius:4, transition:"width 0.5s",
                    }} />
                  </div>
                  <div style={{ fontSize:10, color:t.textMuted, marginTop:4 }}>
                    {stats?.totalCheckins || 0} / {stats?.totalSold || 0}
                  </div>
                </div>
              </div>

              {/* atividades recentes */}
              <div style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`,
              }}>
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12,
                }}>
                  <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Atividades Recentes</span>
                </div>
                {activity.length > 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {activity.map((a, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:"50%", flexShrink:0,
                          background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:700, color:"#fff",
                        }}>
                          {a.user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {a.user?.name}
                          </div>
                          <div style={{ fontSize:10, color:t.textMuted }}>
                            {a.reservation?.code}
                          </div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:10, color:t.textMuted }}>
                            {new Date(a.checkedAt).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })}
                          </div>
                          <span style={{
                            fontSize:10, fontWeight:700, color:"#22C55E",
                            background:"#22C55E22", padding:"1px 6px", borderRadius:20,
                          }}>Check-in</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign:"center", color:t.textMuted, fontSize:12, padding:16 }}>
                    Nenhum check-in realizado ainda
                  </div>
                )}
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