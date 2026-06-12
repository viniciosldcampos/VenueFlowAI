// frontend/src/pages/Clients.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import userService from "../services/user.service";

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events"       },
  { icon:"📆", label:"Calendário",       path:"/calendar"     },
  { icon:"🎫", label:"Reservas",         path:"/reservations" },
  { icon:"👥", label:"Clientes",         path:"/clients", active:true },
  { icon:"💰", label:"Financeiro",       path:"/financial"    },
  { icon:"📊", label:"Relatórios",       path:"/reports"      },
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist"     },
  { icon:"✅", label:"Check-in",         path:"/checkin"      },
  { icon:"⚙",  label:"Configurações",   path:"/settings"     },
];

const ROLE_COLORS = {
  ADMIN:    { color:"#705EBD", label:"Admin"     },
  OPERATOR: { color:"#4A90D9", label:"Operador"  },
  CLIENT:   { color:"#22C55E", label:"Cliente"   },
};

// ─── MODAL DETALHES DO CLIENTE ────────────────────────────────────────────────
function ClientModal({ theme:t, client, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      await userService.update(client.id, { active: !client.active });
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const role = ROLE_COLORS[client.role] || ROLE_COLORS.CLIENT;

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
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div style={{
              width:56, height:56, borderRadius:"50%",
              background:"linear-gradient(135deg, #705EBD, #A78BFA)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, fontWeight:700, color:"#fff", flexShrink:0,
            }}>
              {client.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:t.text }}>{client.name}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                <span style={{
                  fontSize:10, fontWeight:700, color:role.color,
                  background:`${role.color}22`, padding:"2px 8px", borderRadius:20,
                }}>{role.label}</span>
                <span style={{
                  fontSize:10, fontWeight:700,
                  color:  client.active ? "#22C55E" : "#EF4444",
                  background: client.active ? "#22C55E22" : "#EF444422",
                  padding:"2px 8px", borderRadius:20,
                }}>{client.active ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:t.textMuted,
            cursor:"pointer", fontSize:20,
          }}>✕</button>
        </div>

        {/* informações */}
        <div style={{
          background:t.bg, borderRadius:10, padding:14,
          border:`1px solid ${t.border}`, marginBottom:14,
        }}>
          <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, marginBottom:10 }}>INFORMAÇÕES</div>
          {[
            { label:"E-mail",   value:client.email                                                },
            { label:"Telefone", value:client.phone    || "—"                                      },
            { label:"Grupo",    value:client.group    || "Regular"                                },
            { label:"Membro desde", value:new Date(client.createdAt).toLocaleDateString("pt-BR") },
          ].map((row) => (
            <div key={row.label} style={{
              display:"flex", justifyContent:"space-between",
              fontSize:13, padding:"5px 0",
              borderBottom:`1px solid ${t.border}`,
            }}>
              <span style={{ color:t.textMuted }}>{row.label}</span>
              <span style={{ color:t.text, fontWeight:600 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* reservas recentes */}
        {client.reservations?.length > 0 && (
          <div style={{
            background:t.bg, borderRadius:10, padding:14,
            border:`1px solid ${t.border}`, marginBottom:14,
          }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, marginBottom:10 }}>
              ÚLTIMAS RESERVAS
            </div>
            {client.reservations.map((r) => (
              <div key={r.id} style={{
                display:"flex", justifyContent:"space-between",
                fontSize:12, padding:"5px 0",
                borderBottom:`1px solid ${t.border}`,
              }}>
                <div>
                  <div style={{ fontWeight:700, color:t.primary }}>{r.code}</div>
                  <div style={{ color:t.textMuted }}>{r.event?.name}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, color:t.text }}>
                    R$ {Number(r.total).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
                  </div>
                  <div style={{ color:t.textMuted }}>
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ações */}
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={handleToggleActive}
            disabled={loading}
            style={{
              flex:1, padding:"10px", borderRadius:8,
              border:`1px solid ${client.active ? "#EF4444" : "#22C55E"}`,
              background:"transparent",
              color: client.active ? "#EF4444" : "#22C55E",
              fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}
          >{client.active ? "Desativar" : "Ativar"}</button>
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
export default function Clients() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({});
  const [refresh,    setRefresh]    = useState(0);
  const [selected,   setSelected]   = useState(null);

  const ROLES = ["","CLIENT","OPERATOR","ADMIN"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit:10 };
        if (search)     params.search = search;
        if (filterRole) params.role   = filterRole;
        const data = await userService.getAll(params);
        setClients(data.users);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filterRole, refresh, search]);

  const handleSelect = async (id) => {
    try {
      const data = await userService.getById(id);
      setSelected(data.user);
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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Clientes</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Gerencie os usuários e clientes do sistema.
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
                placeholder="Buscar por nome, e-mail ou telefone..."
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
          {ROLES.map((r) => {
            const info = ROLE_COLORS[r];
            return (
              <button key={r} onClick={() => { setFilterRole(r); setPage(1); }} style={{
                padding:"6px 14px", borderRadius:20, cursor:"pointer",
                fontFamily:"inherit", fontSize:12, fontWeight:600,
                background: filterRole===r ? (info?.color || t.primary) : t.surface,
                color:      filterRole===r ? "#fff" : t.textMuted,
                border:     `1px solid ${filterRole===r ? (info?.color || t.primary) : t.border}`,
              }}>{info?.label || "Todos"}</button>
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
          ) : clients.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:t.textMuted }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:6 }}>
                Nenhum cliente encontrado
              </div>
            </div>
          ) : (
            <>
              {/* cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
                {clients.map((client) => {
                  const role = ROLE_COLORS[client.role] || ROLE_COLORS.CLIENT;
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleSelect(client.id)}
                      style={{
                        background:t.surface, borderRadius:12, padding:18,
                        border:`1px solid ${t.border}`, cursor:"pointer",
                        display:"flex", flexDirection:"column", gap:12,
                        transition:"border-color 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = t.primary}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
                    >
                      {/* header */}
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{
                          width:44, height:44, borderRadius:"50%",
                          background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:16, fontWeight:700, color:"#fff", flexShrink:0,
                        }}>
                          {client.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:800, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {client.name}
                          </div>
                          <div style={{ fontSize:11, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {client.email}
                          </div>
                        </div>
                        <span style={{
                          fontSize:10, fontWeight:700, color:role.color,
                          background:`${role.color}22`, padding:"2px 8px",
                          borderRadius:20, flexShrink:0,
                        }}>{role.label}</span>
                      </div>

                      {/* info */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {[
                          { label:"Grupo",    value:client.group || "Regular" },
                          { label:"Reservas", value:client._count?.reservations || 0 },
                        ].map((m) => (
                          <div key={m.label} style={{
                            background:t.bg, borderRadius:8, padding:"8px",
                            border:`1px solid ${t.border}`, textAlign:"center",
                          }}>
                            <div style={{ fontSize:14, fontWeight:800, color:t.primary }}>{m.value}</div>
                            <div style={{ fontSize:9, color:t.textMuted, marginTop:2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* status + data */}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{
                          fontSize:10, fontWeight:700,
                          color:  client.active ? "#22C55E" : "#EF4444",
                          background: client.active ? "#22C55E22" : "#EF444422",
                          padding:"3px 8px", borderRadius:20,
                        }}>{client.active ? "● Ativo" : "○ Inativo"}</span>
                        <span style={{ fontSize:10, color:t.textMuted }}>
                          desde {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* paginação */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:t.textMuted }}>
                  {pagination.total} usuários no total
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
        <ClientModal
          theme={t}
          client={selected}
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