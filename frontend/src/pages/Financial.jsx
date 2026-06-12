import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import dashboardService from "../services/dashboard.service";

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/calendar"     },
  { icon:"🎫", label:"Reservas",         path:"/reservations" },
  { icon:"👥", label:"Clientes",         path:"/clients"      },
  { icon:"💰", label:"Financeiro",       path:"/financial", active:true },
  { icon:"📊", label:"Relatórios",       path:"/reports"      },
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist"     },
  { icon:"✅", label:"Check-in",         path:"/checkin"      },
  { icon:"⚙",  label:"Configurações",   path:"/settings"     },
];

const METHOD_ICONS = {
  "PIX":              "🔵",
  "Cartão de Crédito":"💳",
  "Transferência":    "🏦",
  "Dinheiro":         "💵",
  "Boleto":           "📄",
};

const PER_PAGE = 5;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Financial() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [financial, setFinancial] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [page,      setPage]      = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getFinancial();
        setFinancial(data);
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
          border:`3px solid ${t.border}`, borderTop:`3px solid #705EBD`,
          animation:"spin 1s linear infinite",
        }} />
        <span style={{ color:t.textMuted, fontSize:13 }}>Carregando dados financeiros...</span>
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
        <button onClick={() => window.location.reload()} style={{
          padding:"8px 16px", borderRadius:8, border:"none",
          background:t.primary, color:"#fff", cursor:"pointer", fontFamily:"inherit",
        }}>Tentar novamente</button>
      </div>
    );
  }

  const summary      = financial?.summary      || {};
  const topEvents    = financial?.topEvents    || [];
  const transactions = financial?.recentTransactions || [];
  const byStatus     = financial?.byStatus     || [];

  const totalRevenue  = summary.totalRevenue  || 0;
  const totalConfirmed = summary.totalConfirmed || 0;

  // calcular métricas
  const cancelled = byStatus.find(s => s.status === "CANCELLED");
  const pending   = byStatus.find(s => s.status === "PENDING");

  const METRIC_CARDS = [
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits:2 })}`,
      icon:  "💰", color:"#705EBD",
      sub:   `${totalConfirmed} reservas confirmadas`,
    },
    {
      title: "Ticket Médio",
      value: totalConfirmed > 0
        ? `R$ ${(totalRevenue / totalConfirmed).toLocaleString("pt-BR", { minimumFractionDigits:2 })}`
        : "R$ 0,00",
      icon:  "🎟", color:"#22C55E",
      sub:   "por reserva confirmada",
    },
    {
      title: "Pendente",
      value: pending
        ? `R$ ${Number(pending._sum?.total || 0).toLocaleString("pt-BR", { minimumFractionDigits:2 })}`
        : "R$ 0,00",
      icon:  "⏳", color:"#F59E0B",
      sub:   `${pending?._count?.status || 0} reservas`,
    },
    {
      title: "Cancelamentos",
      value: cancelled?._count?.status || 0,
      icon:  "❌", color:"#EF4444",
      sub:   `R$ ${Number(cancelled?._sum?.total || 0).toLocaleString("pt-BR", { minimumFractionDigits:2 })} perdidos`,
    },
  ];

  // dados para gráfico de top eventos
  const chartData = topEvents.slice(0, 6).map(e => ({
    name:    e.name?.length > 15 ? e.name.slice(0,15)+"..." : e.name,
    receita: e.revenue,
  }));

  // paginação das transações
  const totalPages  = Math.ceil(transactions.length / PER_PAGE);
  const paginated   = transactions.slice((page-1)*PER_PAGE, page*PER_PAGE);

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
            }}>+ Nova Transação ▾</button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* METRIC CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {METRIC_CARDS.map((c) => (
              <div key={c.title} style={{
                background:t.surface, borderRadius:12, padding:16,
                border:`1px solid ${t.border}`,
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ fontSize:11, color:t.textMuted, fontWeight:600 }}>{c.title}</div>
                  <div style={{
                    width:36, height:36, borderRadius:9, background:`${c.color}22`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                  }}>{c.icon}</div>
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:t.text, marginBottom:4 }}>{c.value}</div>
                <div style={{ fontSize:11, color:t.textMuted }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* GRÁFICO TOP EVENTOS + RESUMO */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>

            {/* gráfico de receita por evento */}
            <div style={{
              background:t.surface, borderRadius:12, padding:"18px 20px",
              border:`1px solid ${t.border}`,
            }}>
              <div style={{ fontWeight:700, fontSize:15, color:t.text, marginBottom:16 }}>
                Top Eventos por Receita
              </div>
              {chartData.length > 0 ? (
                <div style={{ height:220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top:5, right:5, bottom:5, left:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`}
                        tick={{ fontSize:10, fill:t.textMuted }} axisLine={false} tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, fontSize:11, color:t.text }}
                        formatter={(v) => [`R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits:2 })}`]}
                      />
                      <Bar dataKey="receita" fill="#705EBD" radius={[4,4,0,0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:60, color:t.textMuted }}>
                  Nenhum dado disponível
                </div>
              )}
            </div>

            {/* resumo do período */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{
                background:t.surface, borderRadius:12, padding:"16px 18px",
                border:`1px solid ${t.border}`,
              }}>
                <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:12 }}>
                  Resumo do Período
                </div>
                {[
                  { label:"Receita Total",    value:`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits:2 })}`, color:"#705EBD" },
                  { label:"Confirmadas",      value:totalConfirmed,                                                             color:"#22C55E"  },
                  { label:"Pendentes",        value:pending?._count?.status || 0,                                               color:"#F59E0B"  },
                  { label:"Cancelamentos",    value:cancelled?._count?.status || 0,                                             color:"#EF4444", bold:true },
                ].map((row, i) => (
                  <div key={i} style={{
                    display:"flex", justifyContent:"space-between",
                    padding:"7px 0", borderBottom:`1px solid ${t.border}`,
                    fontSize:13,
                  }}>
                    <span style={{ color:t.textMuted }}>{row.label}</span>
                    <span style={{ fontWeight:row.bold ? 800 : 700, color:row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* status por forma de pagamento */}
              <div style={{
                background:t.surface, borderRadius:12, padding:"16px 18px",
                border:`1px solid ${t.border}`, flex:1,
              }}>
                <div style={{ fontWeight:700, fontSize:14, color:t.text, marginBottom:10 }}>
                  Por Status
                </div>
                {byStatus.map((s, i) => {
                  const STATUS_MAP = {
                    CONFIRMED: { label:"Confirmada", color:"#22C55E" },
                    PENDING:   { label:"Pendente",   color:"#F59E0B" },
                    CANCELLED: { label:"Cancelada",  color:"#EF4444" },
                    REFUNDED:  { label:"Reembolsada",color:"#6B7280" },
                  };
                  const info = STATUS_MAP[s.status] || { label:s.status, color:t.textMuted };
                  return (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"5px 0", fontSize:12,
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:info.color }} />
                        <span style={{ color:t.textMuted }}>{info.label}</span>
                      </div>
                      <span style={{ fontWeight:700, color:t.text }}>{s._count?.status || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TOP EVENTOS TABELA */}
          {topEvents.length > 0 && (
            <div style={{
              background:t.surface, borderRadius:12, padding:"18px 20px",
              border:`1px solid ${t.border}`,
            }}>
              <div style={{ fontWeight:700, fontSize:15, color:t.text, marginBottom:14 }}>
                Top 10 Eventos por Receita
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {topEvents.map((e, i) => (
                  <div key={e.eventId} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:t.textMuted, width:20, textAlign:"right" }}>
                      {i+1}
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:3 }}>
                        {e.name}
                      </div>
                      <div style={{ height:5, background:t.border, borderRadius:3, overflow:"hidden" }}>
                        <div style={{
                          height:"100%",
                          width: topEvents[0].revenue > 0
                            ? `${Math.round((e.revenue/topEvents[0].revenue)*100)}%`
                            : "0%",
                          background:"linear-gradient(90deg, #705EBD, #A78BFA)",
                          borderRadius:3,
                        }} />
                      </div>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:t.text, flexShrink:0 }}>
                      R$ {e.revenue.toLocaleString("pt-BR", { minimumFractionDigits:2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSAÇÕES RECENTES */}
          {transactions.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:12,
              }}>
                <span style={{ fontWeight:700, fontSize:15, color:t.text }}>Transações Recentes</span>
              </div>

              <div style={{
                background:t.surface, borderRadius:12,
                border:`1px solid ${t.border}`, overflow:"hidden",
              }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${t.border}` }}>
                      {["Data","Cliente","Evento","Método","Valor","Ações"].map((h) => (
                        <th key={h} style={{
                          padding:"11px 14px", textAlign:"left",
                          fontSize:11, fontWeight:700, color:t.textMuted,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((tr, i) => (
                      <tr
                        key={tr.id}
                        style={{
                          borderBottom: i < paginated.length-1 ? `1px solid ${t.border}` : "none",
                          transition:"background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding:"11px 14px", fontSize:12, color:t.textMuted }}>
                          {tr.paidAt ? new Date(tr.paidAt).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{tr.client}</div>
                          <div style={{ fontSize:10, color:t.textMuted }}>{tr.code}</div>
                        </td>
                        <td style={{ padding:"11px 14px", fontSize:12, color:t.text, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {tr.event}
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:t.text }}>
                            <span>{METHOD_ICONS[tr.payment] || "💳"}</span>
                            {tr.payment || "—"}
                          </div>
                        </td>
                        <td style={{ padding:"11px 14px", fontSize:13, fontWeight:800, color:"#22C55E" }}>
                          R$ {tr.total.toLocaleString("pt-BR", { minimumFractionDigits:2 })}
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <button style={{
                            width:28, height:28, borderRadius:6,
                            border:`1px solid ${t.border}`, background:"transparent",
                            color:t.textMuted, cursor:"pointer", fontSize:13,
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>👁</button>
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
                  Mostrando {(page-1)*PER_PAGE+1} a {Math.min(page*PER_PAGE, transactions.length)} de {transactions.length} transações
                </span>
                {totalPages > 1 && (
                  <div style={{ display:"flex", gap:4 }}>
                    <PagBtn onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} theme={t}>‹</PagBtn>
                    {Array.from({ length:totalPages }, (_,i) => i+1).map((p) => (
                      <PagBtn key={p} onClick={() => setPage(p)} active={p===page} theme={t}>{p}</PagBtn>
                    ))}
                    <PagBtn onClick={() => setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} theme={t}>›</PagBtn>
                  </div>
                )}
              </div>
            </div>
          )}

          {transactions.length === 0 && !loading && (
            <div style={{ textAlign:"center", padding:40, color:t.textMuted }}>
              <div style={{ fontSize:32, marginBottom:8 }}>💰</div>
              <div style={{ fontSize:14, fontWeight:700, color:t.text, marginBottom:4 }}>
                Nenhuma transação encontrada
              </div>
              <div style={{ fontSize:12 }}>
                As transações aparecerão aqui quando houver reservas confirmadas.
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