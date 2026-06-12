import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import roomService from "../services/room.service";

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms", active:true },
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

const STATUS_COLORS = {
  true:  { color:"#22C55E", label:"Ativa"   },
  false: { color:"#EF4444", label:"Inativa" },
};

// ─── MODAL CRIAR SALA ─────────────────────────────────────────────────────────
function CreateRoomModal({ theme:t, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:"", type:"Auditório", capacity:"", location:"", description:"",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const TYPES = ["Auditório","Teatro","Arena","Cinema","Sala Multiuso","Sala VIP","Centro de Eventos"];

  const handleSubmit = async () => {
    if (!form.name || !form.capacity) {
      setError("Nome e capacidade são obrigatórios");
      return;
    }
    try {
      setLoading(true);
      await roomService.create({ ...form, capacity: Number(form.capacity) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000,
    }}>
      <div style={{
        background:t.surface, borderRadius:14, padding:28,
        border:`1px solid ${t.border}`, width:480, maxWidth:"90vw",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontSize:16, fontWeight:800, color:t.text }}>Nova Sala</span>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:t.textMuted,
            cursor:"pointer", fontSize:20,
          }}>✕</button>
        </div>

        {error && (
          <div style={{
            background:"#EF444422", border:"1px solid #EF444444",
            borderRadius:8, padding:"8px 12px", fontSize:12,
            color:"#EF4444", marginBottom:14,
          }}>{error}</div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Field label="Nome da Sala" theme={t}>
            <Input value={form.name} onChange={(v) => setForm(f=>({...f,name:v}))} placeholder="Ex: Auditório Principal" theme={t} />
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Tipo" theme={t}>
              <Select value={form.type} onChange={(v) => setForm(f=>({...f,type:v}))} options={TYPES} theme={t} />
            </Field>
            <Field label="Capacidade" theme={t}>
              <Input value={form.capacity} onChange={(v) => setForm(f=>({...f,capacity:v}))} placeholder="Ex: 500" type="number" theme={t} />
            </Field>
          </div>
          <Field label="Localização" theme={t}>
            <Input value={form.location} onChange={(v) => setForm(f=>({...f,location:v}))} placeholder="Ex: Bloco A, 2º andar" theme={t} />
          </Field>
          <Field label="Descrição" theme={t}>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f=>({...f,description:e.target.value}))}
              placeholder="Descrição opcional..."
              rows={3}
              style={{
                width:"100%", padding:"9px 12px", borderRadius:8,
                border:`1px solid ${t.border}`, background:t.bg,
                color:t.text, fontSize:13, fontFamily:"inherit",
                outline:"none", resize:"vertical", boxSizing:"border-box",
              }}
            />
          </Field>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"10px", borderRadius:8,
            border:`1px solid ${t.border}`, background:"transparent",
            color:t.text, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex:1, padding:"10px", borderRadius:8, border:"none",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:700,
          }}>{loading ? "Criando..." : "Criar Sala"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Rooms() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [rooms,      setRooms]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState("");
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal,  setShowModal]  = useState(false);
  const [refresh,    setRefresh]    = useState(0);

  const TYPES = ["","Auditório","Teatro","Arena","Cinema","Sala Multiuso","Sala VIP","Centro de Eventos"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit:10 };
        if (search)     params.search = search;
        if (filterType) params.type   = filterType;
        const data = await roomService.getAll(params);
        setRooms(data.rooms);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, filterType, refresh, search]);

  const handleSearch = (e) => {
    if (e.key === "Enter") setPage(1);
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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Salas</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Gerencie os espaços e salas do seu negócio.
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
                placeholder="Buscar por nome ou localização..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
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
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding:"8px 16px", borderRadius:8, border:"none",
                background:t.primary, color:"#fff", fontWeight:700,
                fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}
            >+ Nova Sala</button>
          </div>
        </div>

        {/* FILTROS */}
        <div style={{ padding:"12px 24px 0", display:"flex", gap:8, flexWrap:"wrap" }}>
          {TYPES.map((tp) => (
            <button key={tp} onClick={() => { setFilterType(tp); setPage(1); }} style={{
              padding:"6px 14px", borderRadius:20, cursor:"pointer",
              fontFamily:"inherit", fontSize:12, fontWeight:600,
              background: filterType===tp ? t.primary : t.surface,
              color:      filterType===tp ? "#fff"     : t.textMuted,
              border:     `1px solid ${filterType===tp ? t.primary : t.border}`,
            }}>{tp || "Todos"}</button>
          ))}
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
          ) : rooms.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:t.textMuted }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🏛</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:6 }}>
                Nenhuma sala encontrada
              </div>
              <div style={{ fontSize:13, marginBottom:20 }}>
                Crie sua primeira sala para começar.
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding:"10px 20px", borderRadius:8, border:"none",
                  background:t.primary, color:"#fff", fontWeight:700,
                  cursor:"pointer", fontFamily:"inherit",
                }}
              >+ Nova Sala</button>
            </div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    theme={t}
                    navigate={navigate}
                    onRefresh={() => setRefresh(r => r + 1)}
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
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
            </>
          )}
        </div>
      </div>

      {showModal && (
        <CreateRoomModal
          theme={t}
          onClose={() => setShowModal(false)}
          onSuccess={() => setRefresh(r => r + 1)}
        />
      )}
    </div>
  );
}

// ─── ROOM CARD ────────────────────────────────────────────────────────────────
function RoomCard({ room, theme:t, navigate }) {
  const status = STATUS_COLORS[room.active];

  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:18,
      border:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", gap:12,
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{
            width:44, height:44, borderRadius:10, flexShrink:0,
            background:`${t.primary}22`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
          }}>🏛</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{room.name}</div>
            <div style={{ fontSize:11, color:t.textMuted }}>{room.type}</div>
          </div>
        </div>
        <span style={{
          fontSize:10, fontWeight:700, color:status.color,
          background:`${status.color}22`, padding:"3px 8px", borderRadius:20,
        }}>{status.label}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { label:"Capacidade", value:room.capacity },
          { label:"Setores",    value:room.sectors?.length || 0 },
          { label:"Eventos",    value:room._count?.events  || 0 },
        ].map((m) => (
          <div key={m.label} style={{
            background:t.bg, borderRadius:8, padding:"8px",
            border:`1px solid ${t.border}`, textAlign:"center",
          }}>
            <div style={{ fontSize:16, fontWeight:800, color:t.primary }}>{m.value}</div>
            <div style={{ fontSize:9, color:t.textMuted, marginTop:2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {room.location && (
        <div style={{ fontSize:12, color:t.textMuted, display:"flex", alignItems:"center", gap:5 }}>
          <span>📍</span> {room.location}
        </div>
      )}

      {room.sectors?.length > 0 && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {room.sectors.map((s) => (
            <span key={s.id} style={{
              fontSize:10, fontWeight:600,
              color:s.color, background:`${s.color}22`,
              padding:"2px 8px", borderRadius:20,
              border:`1px solid ${s.color}44`,
            }}>{s.name} ({s.capacity})</span>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginTop:4 }}>
        <button
          onClick={() => navigate(`/rooms/${room.id}/edit`)}
          style={{
            flex:1, padding:"8px", borderRadius:8, border:"none",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            color:"#fff", fontWeight:700, fontSize:12,
            cursor:"pointer", fontFamily:"inherit",
          }}
        >✏ Editor Visual</button>
        <button style={{
          width:34, height:34, borderRadius:8,
          border:`1px solid ${t.border}`, background:"transparent",
          color:t.textMuted, cursor:"pointer", fontSize:14,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>···</button>
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
function Field({ label, children, theme:t }) {
  return (
    <div>
      <div style={{ fontSize:11, color:t.textMuted, fontWeight:600, marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", theme:t }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width:"100%", padding:"9px 12px", borderRadius:8,
        border:`1px solid ${t.border}`, background:t.bg,
        color:t.text, fontSize:13, fontFamily:"inherit",
        outline:"none", boxSizing:"border-box",
      }}
    />
  );
}

function Select({ value, onChange, options, theme:t }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width:"100%", padding:"9px 12px", borderRadius:8,
        border:`1px solid ${t.border}`, background:t.bg,
        color:t.text, fontSize:13, fontFamily:"inherit",
        outline:"none", cursor:"pointer",
      }}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}