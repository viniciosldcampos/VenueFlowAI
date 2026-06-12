import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import reservationService from "../services/reservation.service";

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/calendar"     },
  { icon:"🎫", label:"Reservas",         path:"/reservations", active:true },
  { icon:"👥", label:"Clientes",         path:"/clients"      },
  { icon:"💰", label:"Financeiro",       path:"/financial"    },
  { icon:"📊", label:"Relatórios",       path:"/reports"      },
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist"     },
  { icon:"✅", label:"Check-in",         path:"/checkin"      },
  { icon:"⚙",  label:"Configurações",   path:"/settings"     },
];

const STATUS_COLORS = {
  PENDING:   { color:"#F59E0B", label:"Pendente"   },
  CONFIRMED: { color:"#22C55E", label:"Confirmada" },
  CANCELLED: { color:"#EF4444", label:"Cancelada"  },
  REFUNDED:  { color:"#6B7280", label:"Reembolsada"},
};

// ─── MODAL DETALHES ───────────────────────────────────────────────────────────
function ReservationModal({ theme:t, reservation, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await reservationService.confirm(reservation.id, reservation.payment);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      setLoading(true);
      await reservationService.cancel(reservation.id);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = STATUS_COLORS[reservation.status] || STATUS_COLORS.PENDING;

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:t.surface, borderRadius:14, padding:28,
        border:`1px solid ${t.border}`, width:520,
        maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto",
      }}>
        {/* header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:t.text }}>
              {reservation.code}
            </div>
            <span style={{
              fontSize:11, fontWeight:700, color:status.color,
              background:`${status.color}22`, padding:"2px 8px", borderRadius:20,
            }}>{status.label}</span>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:t.textMuted,
            cursor:"pointer", fontSize:20,
          }}>✕</button>
        </div>

        {/* cliente */}
        <div style={{
          background:t.bg, borderRadius:10, padding:14,
          border:`1px solid ${t.border}`, marginBottom:14,
        }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, marginBottom:8 }}>CLIENTE</div>
          <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{reservation.user?.name}</div>
          <div style={{ fontSize:12, color:t.textMuted }}>{reservation.user?.email}</div>
          {reservation.user?.phone && (
            <div style={{ fontSize:12, color:t.textMuted }}>{reservation.user.phone}</div>
          )}
        </div>

        {/* evento */}
        <div style={{
          background:t.bg, borderRadius:10, padding:14,
          border:`1px solid ${t.border}`, marginBottom:14,
        }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, marginBottom:8 }}>EVENTO</div>
          <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{reservation.event?.name}</div>
          <div style={{ fontSize:12, color:t.textMuted }}>
            📅 {new Date(reservation.event?.date).toLocaleDateString("pt-BR", {
              day:"2-digit", month:"short", year:"numeric",
              hour:"2-digit", minute:"2-digit",
            })}
          </div>
          {reservation.event?.room && (
            <div style={{ fontSize:12, color:t.textMuted }}>
              📍 {reservation.event.room.name}
            </div>
          )}
        </div>

        {/* itens */}
        {reservation.items?.length > 0 && (
          <div style={{
            background:t.bg, borderRadius:10, padding:14,
            border:`1px solid ${t.border}`, marginBottom:14,
          }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, marginBottom:8 }}>INGRESSOS</div>
            {reservation.items.map((item) => (
              <div key={item.id} style={{
                display:"flex", justifyContent:"space-between",
                fontSize:13, padding:"4px 0",
                borderBottom:`1px solid ${t.border}`,
              }}>
                <span style={{ color:t.text }}>
                  {item.ticket?.type} x{item.quantity}
                  {item.seat && ` · ${item.seat.row}${item.seat.number}`}
                </span>
                <span style={{ fontWeight:700, color:t.text }}>
                  R$ {(Number(item.price) * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
                </span>
              </div>
            ))}
            <div style={{
              display:"flex", justifyContent:"space-between",
              fontSize:14, fontWeight:800, marginTop:8,
              color:t.text,
            }}>
              <span>Total</span>
              <span style={{ color:t.primary }}>
                R$ {Number(reservation.total).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
              </span>
            </div>
          </div>
        )}

        {/* pagamento */}
        <div style={{
          background:t.bg, borderRadius:10, padding:14,
          border:`1px solid ${t.border}`, marginBottom:20,
        }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, marginBottom:8 }}>PAGAMENTO</div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
            <span style={{ color:t.textMuted }}>Método</span>
            <span style={{ color:t.text, fontWeight:700 }}>{reservation.payment || "—"}</span>
          </div>
          {reservation.paidAt && (
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginTop:4 }}>
              <span style={{ color:t.textMuted }}>Pago em</span>
              <span style={{ color:t.text, fontWeight:700 }}>
                {new Date(reservation.paidAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        {/* ações */}
        <div style={{ display:"flex", gap:10 }}>
          {reservation.status === "PENDING" && (
            <button onClick={handleConfirm} disabled={loading} style={{
              flex:1, padding:"10px", borderRadius:8, border:"none",
              background:"#22C55E", color:"#fff",
              fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>✅ Confirmar</button>
          )}
          {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") && (
            <button onClick={handleCancel} disabled={loading} style={{
              flex:1, padding:"10px", borderRadius:8,
              border:"1px solid #EF4444", background:"transparent",
              color:"#EF4444", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>✕ Cancelar</button>
          )}
          <button onClick={onClose} style={{
            flex:1, padding:"10px", borderRadius:8,
            border:`1px solid ${t.border}`, background:"transparent",
            color:t.text, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Reservations() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [reservations,   setReservations]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [page,           setPage]           = useState(1);
  const [pagination,     setPagination]     = useState({});
  const [refresh,        setRefresh]        = useState(0);
  const [selected,       setSelected]       = useState(null);

  const STATUSES = ["","PENDING","CONFIRMED","CANCELLED","REFUNDED"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit:10 };
        if (search)       params.search = search;
        if (filterStatus) params.status = filterStatus;
        const data = await reservationService.getAll(params);
        setReservations(data.reservations);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filterStatus, refresh, search]);

  const handleSelect = async (id) => {
    try {
      const data = await reservationService.getById(id);
      setSelected(data.reservation);
    } catch (err) {
      alert(err.message);
    }
  };

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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Reservas</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Gerencie todas as reservas e ingressos.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:t.surface, border:`1px solid ${t.border}`,
              borderRadius:8, padding:"8px 12px", width:260,
            }}>
              <span style={{ color:t.textMuted }}>🔍</span>
              <input
                placeholder="Buscar por código, cliente ou evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key==="Enter" && setPage(1)}
                style={{
                  background:"none", border:"none", color:t.text,
                  fontSize:12, outline:"none", flex:1, fontFamily:"inherit",
                }}
              />
            </div>
            <button onClick={toggleDarkMode} style={{
              width:36, height:36, borderRadius:8, border:`1px solid ${t.border}`,
              background:t.surface, cursor:"pointer", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>{darkMode ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* FILTROS */}
        <div style={{ padding:"12px 24px 0", display:"flex", gap:8, flexWrap:"wrap" }}>
          {STATUSES.map((s) => {
            const info = STATUS_COLORS[s];
            return (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{
                padding:"6px 14px", borderRadius:20, cursor:"pointer",
                fontFamily:"inherit", fontSize:12, fontWeight:600,
                background: filterStatus===s ? (info?.color || t.primary) : t.surface,
                color:      filterStatus===s ? "#fff" : t.textMuted,
                border:     `1px solid ${filterStatus===s ? (info?.color || t.primary) : t.border}`,
              }}>{info?.label || "Todas"}</button>
            );
          })}
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 24px" }}>
          {loading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:60 }}>
              <div style={{
                width:40, height:40, borderRadius:"50%",
                border:`3px solid ${t.border}`, borderTop:`3px solid #705EBD`,
                animation:"spin 1s linear infinite",
              }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign:"center", padding:60, color:"#EF4444" }}>{error}</div>
          ) : reservations.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:t.textMuted }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎫</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:6 }}>
                Nenhuma reserva encontrada
              </div>
            </div>
          ) : (
            <>
              {/* tabela */}
              <div style={{
                background:t.surface, borderRadius:12,
                border:`1px solid ${t.border}`, overflow:"hidden", marginBottom:16,
              }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${t.border}` }}>
                      {["Código","Cliente","Evento","Data","Total","Pagamento","Status","Ações"].map((h) => (
                        <th key={h} style={{
                          padding:"12px 14px", textAlign:"left",
                          fontSize:11, fontWeight:700, color:t.textMuted,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r, i) => {
                      const status = STATUS_COLORS[r.status] || STATUS_COLORS.PENDING;
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: i < reservations.length-1 ? `1px solid ${t.border}` : "none",
                            transition:"background 0.15s", cursor:"pointer",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = t.bg}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{ fontSize:12, fontWeight:700, color:t.primary }}>
                              {r.code}
                            </span>
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ fontSize:13, fontWeight:700, color:t.text }}>{r.user?.name}</div>
                            <div style={{ fontSize:11, color:t.textMuted }}>{r.user?.email}</div>
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ fontSize:12, color:t.text, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {r.event?.name}
                            </div>
                            <div style={{ fontSize:10, color:t.textMuted }}>
                              {r.event?.room?.name}
                            </div>
                          </td>
                          <td style={{ padding:"12px 14px", fontSize:12, color:t.textMuted }}>
                            {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td style={{ padding:"12px 14px", fontSize:13, fontWeight:800, color:t.text }}>
                            R$ {Number(r.total).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
                          </td>
                          <td style={{ padding:"12px 14px", fontSize:12, color:t.textMuted }}>
                            {r.payment || "—"}
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{
                              fontSize:11, fontWeight:700, color:status.color,
                              background:`${status.color}22`, padding:"3px 8px", borderRadius:20,
                            }}>{status.label}</span>
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            <button
                              onClick={() => handleSelect(r.id)}
                              style={{
                                padding:"5px 12px", borderRadius:6, border:"none",
                                background:t.primary, color:"#fff",
                                fontSize:11, fontWeight:700,
                                cursor:"pointer", fontFamily:"inherit",
                              }}
                            >Ver</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* paginação */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:t.textMuted }}>
                  {pagination.total} reservas no total
                </span>
                {pagination.totalPages > 1 && (
                  <div style={{ display:"flex", gap:6 }}>
                    {Array.from({ length:pagination.totalPages }, (_,i) => i+1).map((p) => (
                      <button key={p} onClick={() => setPage(p)} style={{
                        width:32, height:32, borderRadius:6,
                        border:`1px solid ${p===page ? t.primary : t.border}`,
                        background: p===page ? t.primary : "transparent",
                        color: p===page ? "#fff" : t.text,
                        cursor:"pointer", fontFamily:"inherit", fontWeight:700,
                      }}>{p}</button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selected && (
        <ReservationModal
          theme={t}
          reservation={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => setRefresh(r => r + 1)}
        />
      )}
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