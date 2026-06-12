import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import dashboardService from "../services/dashboard.service";

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/",            active:true },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/calendar"     },
  { icon:"🎫", label:"Reservas",         path:"/reservations" },
  { icon:"👥", label:"Clientes",         path:"/clients"      },
  { icon:"💰", label:"Financeiro",       path:"/financial"    },
  { icon:"📊", label:"Relatórios",       path:"/reports"      },
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist"     },
  { icon:"✅", label:"Check-in",         path:"/checkin"      },
  { icon:"⚙",  label:"Configurações",   path:"/settings"     },
];

const COLORS = ["#705EBD","#4A90D9","#22C55E","#F59E0B","#EF4444"];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display:"flex", height:"100vh", width:"100vw",
        alignItems:"center", justifyContent:"center",
        background:t.bg, flexDirection:"column", gap:12,
        fontFamily:"'Sora', system-ui, sans-serif",
      }}>
        <div style={{
          width:48, height:48, borderRadius:"50%",
          border:`3px solid ${t.border}`,
          borderTop:`3px solid #705EBD`,
          animation:"spin 1s linear infinite",
        }} />
        <span style={{ color:t.textMuted, fontSize:13 }}>Carregando dashboard...</span>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display:"flex", height:"100vh", width:"100vw",
        alignItems:"center", justifyContent:"center",
        background:t.bg, flexDirection:"column", gap:12,
        fontFamily:"'Sora', system-ui, sans-serif",
      }}>
        <span style={{ fontSize:32 }}>⚠️</span>
        <span style={{ color:"#EF4444", fontSize:14 }}>{error}</span>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding:"8px 16px", borderRadius:8, border:"none",
            background:t.primary, color:"#fff",
            cursor:"pointer", fontFamily:"inherit",
          }}
        >Tentar novamente</button>
      </div>
    );
  }

  const overview      = stats?.overview      || {};
  const thisMonth     = stats?.thisMonth     || {};
  const upcomingEvents = stats?.upcomingEvents || [];
  const topRooms      = stats?.topRooms      || [];
  const eventsToday   = stats?.eventsToday   || [];

  // dados para o gráfico de ocupação
  const occupancyData = topRooms.map((r, i) => ({
    name:  r.name,
    value: r.occupancy,
    color: COLORS[i % COLORS.length],
  }));

  // métricas do mês
// calcular tendência de receita
const revenueTrend = thisMonth.revenueLastMonth > 0
  ? `${thisMonth.revenue >= thisMonth.revenueLastMonth ? "+" : ""}${Math.round(((thisMonth.revenue - thisMonth.revenueLastMonth) / thisMonth.revenueLastMonth) * 100)}%`
  : null;

const METRIC_CARDS = [
  {
    title: "Receita do Mês",
    value: `R$ ${(thisMonth.revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits:2 })}`,
    trend: revenueTrend,
    up:    thisMonth.revenue >= thisMonth.revenueLastMonth,
    icon:  "💰",
    color: "#705EBD",
    sub:   revenueTrend ? "vs mês passado" : "sem dados anteriores",
  },
  {
    title: "Reservas",
    value: thisMonth.reservations || 0,
    trend: null,
    up:    true,
    icon:  "🎫",
    color: "#22C55E",
    sub:   "este mês",
  },
  {
    title: "Check-ins",
    value: thisMonth.checkins || 0,
    trend: null,
    up:    true,
    icon:  "✅",
    color: "#4A90D9",
    sub:   "este mês",
  },
  {
    title: "Novos Clientes",
    value: thisMonth.newClients || 0,
    trend: null,
    up:    true,
    icon:  "👥",
    color: "#F59E0B",
    sub:   "este mês",
  },
  {
    title: "Taxa de Ocupação",
    value: `${overview.occupancyRate || 0}%`,
    trend: null,
    up:    true,
    icon:  "📊",
    color: "#8B5CF6",
    sub:   "média geral",
  },
  {
    title: "Lista de Espera",
    value: overview.waitlistCount || 0,
    trend: null,
    up:    true,
    icon:  "⏳",
    color: "#06B6D4",
    sub:   "aguardando",
  },
];

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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>
              Bom dia, {user?.name?.split(" ")[0]} 👋
            </div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Aqui está o resumo geral da sua operação hoje.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:t.surface, border:`1px solid ${t.border}`,
              borderRadius:8, padding:"8px 12px", width:280,
            }}>
              <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
              <input placeholder="Buscar por salas, eventos, clientes..." style={{
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
              width:36, height:36, borderRadius:8, border:`1px solid ${t.border}`,
              background:t.surface, cursor:"pointer", fontSize:16, position:"relative",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>🔔</button>
            <button
              onClick={() => navigate("/rooms")}
              style={{
                padding:"8px 16px", borderRadius:8, border:"none",
                background:t.primary, color:"#fff", fontWeight:700,
                fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}
            >+ Nova Sala ▾</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* METRIC CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
            {METRIC_CARDS.map((c) => (
              <div key={c.title} style={{
                background:t.surface, borderRadius:12, padding:"14px",
                border:`1px solid ${t.border}`,
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontSize:10, color:t.textMuted, fontWeight:600 }}>{c.title}</div>
                  <div style={{
                    width:30, height:30, borderRadius:7, background:`${c.color}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                  }}>{c.icon}</div>
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:t.text, marginBottom:4 }}>{c.value}</div>
                <div style={{ fontSize:11, color:t.textMuted }}>
                  {c.trend && (
                    <span style={{ color: c.up ? "#22C55E" : "#EF4444", fontWeight:700 }}>
                      {c.trend}{" "}
                    </span>
                  )}
                  {c.sub}
                </div>
              </div>
            ))}
          </div>

          {/* GRÁFICO + EVENTOS HOJE + PRÓXIMOS */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

            {/* gráfico de ocupação por sala */}
            <div style={{
              background:t.surface, borderRadius:12, padding:"18px 20px",
              border:`1px solid ${t.border}`,
            }}>
              <div style={{ fontWeight:700, fontSize:15, color:t.text, marginBottom:16 }}>
                Ocupação por Sala
              </div>
              {occupancyData.length > 0 ? (
                <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                  <div style={{ width:200, height:200, flexShrink:0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                          {occupancyData.map((e,i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v}%`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                    {occupancyData.map((item) => (
                      <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:"50%", background:item.color }} />
                          <span style={{ fontSize:12, color:t.text }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:item.color }}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:"center", color:t.textMuted, padding:40 }}>
                  Nenhuma sala cadastrada ainda
                </div>
              )}
            </div>

            {/* eventos hoje + próximos */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* eventos hoje */}
              <div style={{
                background:t.surface, borderRadius:12, padding:"14px 16px",
                border:`1px solid ${t.border}`, flex:1,
              }}>
                <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:10 }}>
                  Eventos Hoje ({eventsToday.length})
                </div>
                {eventsToday.length > 0 ? eventsToday.map((e) => (
                  <div key={e.id} style={{
                    display:"flex", justifyContent:"space-between",
                    padding:"6px 0", borderBottom:`1px solid ${t.border}`,
                    fontSize:12,
                  }}>
                    <div>
                      <div style={{ fontWeight:700, color:t.text }}>{e.name}</div>
                      <div style={{ color:t.textMuted }}>{e.room}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:t.primary, fontWeight:700 }}>{e.sold}/{e.capacity}</div>
                      <div style={{ color:t.textMuted }}>{e.checkins} check-ins</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ color:t.textMuted, fontSize:12, textAlign:"center", padding:16 }}>
                    Nenhum evento hoje
                  </div>
                )}
              </div>

              {/* resumo geral */}
              <div style={{
                background:t.surface, borderRadius:12, padding:"14px 16px",
                border:`1px solid ${t.border}`,
              }}>
                <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:10 }}>
                  Resumo Geral
                </div>
                {[
                  { label:"Total de Salas",    value:overview.totalRooms      || 0, color:t.primary  },
                  { label:"Total de Eventos",  value:overview.totalEvents     || 0, color:"#22C55E"  },
                  { label:"Total de Clientes", value:overview.totalClients    || 0, color:"#4A90D9"  },
                  { label:"Total de Reservas", value:overview.totalReservations||0, color:"#F59E0B"  },
                ].map((row) => (
                  <div key={row.label} style={{
                    display:"flex", justifyContent:"space-between",
                    padding:"5px 0", fontSize:12,
                    borderBottom:`1px solid ${t.border}`,
                  }}>
                    <span style={{ color:t.textMuted }}>{row.label}</span>
                    <span style={{ fontWeight:800, color:row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRÓXIMOS EVENTOS */}
          {upcomingEvents.length > 0 && (
            <div style={{
              background:t.surface, borderRadius:12, padding:"18px 20px",
              border:`1px solid ${t.border}`,
            }}>
              <div style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:14,
              }}>
                <span style={{ fontWeight:700, fontSize:15, color:t.text }}>Próximos Eventos</span>
                <button
                  onClick={() => navigate("/events")}
                  style={{
                    background:"none", border:"none", color:t.primary,
                    fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
                  }}
                >Ver todos →</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {upcomingEvents.slice(0, 4).map((e) => (
                  <div key={e.id} style={{
                    background:t.bg, borderRadius:10, padding:12,
                    border:`1px solid ${t.border}`,
                  }}>
                    <div style={{ fontSize:10, color:t.textMuted, marginBottom:4 }}>
                      {new Date(e.date).toLocaleDateString("pt-BR")}
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:4 }}>{e.name}</div>
                    <div style={{ fontSize:11, color:t.textMuted, marginBottom:8 }}>{e.room}</div>
                    <div style={{ height:4, background:t.border, borderRadius:2, overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        width: e.capacity > 0 ? `${Math.round((e.sold/e.capacity)*100)}%` : "0%",
                        background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                        borderRadius:2,
                      }} />
                    </div>
                    <div style={{ fontSize:10, color:t.textMuted, marginTop:4 }}>
                      {e.sold}/{e.capacity} ingressos
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      <div style={{ padding:"12px", borderTop:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{
          background:"linear-gradient(135deg, #705EBD22, #A78BFA11)",
          borderRadius:10, padding:"10px 12px", border:"1px solid #705EBD33",
        }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.primary, marginBottom:4 }}>✨ Dica da IA</div>
          <div style={{ fontSize:10, color:t.textMuted, lineHeight:1.5 }}>
            Configure alertas de ocupação para maximizar sua receita.
          </div>
          <button style={{
            marginTop:6, width:"100%", padding:"5px", borderRadius:6, border:"none",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          }}>Ver insights</button>
        </div>

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
          <button
            onClick={logout}
            title="Sair"
            style={{
              background:"none", border:"none", color:t.textMuted,
              cursor:"pointer", fontSize:14, padding:4,
            }}
          >→</button>
        </div>
      </div>
    </div>
  );
}