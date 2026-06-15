// frontend/src/pages/Events.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import { useAuth } from "../hooks/useAuth";
import eventService from "../services/event.service";
import roomService from "../services/room.service";

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"             },
  { icon:"🏛", label:"Salas",            path:"/rooms"        },
  { icon:"📅", label:"Eventos",          path:"/events", active:true },
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
  SCHEDULED: { color:"#4A90D9", label:"Agendado"     },
  ONGOING:   { color:"#22C55E", label:"Em andamento" },
  FINISHED:  { color:"#6B7280", label:"Finalizado"   },
  CANCELLED: { color:"#EF4444", label:"Cancelado"    },
};

const TYPE_ICONS = {
  Show:        "🎭",
  Teatro:      "🎪",
  Cinema:      "🎬",
  Congresso:   "🎤",
  Workshop:    "🛠",
  Palestra:    "📢",
  Festival:    "🎉",
  Esportivo:   "⚽",
  Corporativo: "💼",
  Outro:       "📅",
};

// ─── MODAL CRIAR EVENTO ───────────────────────────────────────────────────────
function CreateEventModal({ theme:t, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:"", type:"Show", date:"", endDate:"",
    roomId:"", description:"", highlight:false,
  });
  const [tickets, setTickets] = useState([
    { type:"Inteira", price:"", quantity:"" },
  ]);
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const TYPES = ["Show","Teatro","Cinema","Congresso","Workshop","Palestra","Festival","Esportivo","Corporativo","Outro"];

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await roomService.getAll({ limit:100 });
        setRooms(data.rooms);
      } catch (err) {
        console.error("Erro ao carregar salas:", err);
      }
    };
    loadRooms();
  }, []);

  const addTicket    = () => setTickets(ts => [...ts, { type:"Inteira", price:"", quantity:"" }]);
  const removeTicket = (i) => setTickets(ts => ts.filter((_,idx) => idx !== i));
  const updateTicket = (i, field, value) => setTickets(ts => ts.map((tk,idx) => idx===i ? {...tk,[field]:value} : tk));

  const handleSubmit = async () => {
    if (!form.name || !form.date || !form.roomId) {
      setError("Nome, data e sala são obrigatórios");
      return;
    }
    try {
      setLoading(true);
      await eventService.create({
        ...form,
        roomId:  Number(form.roomId),
        tickets: tickets.filter(tk => tk.type && tk.price && tk.quantity).map(tk => ({
          ...tk,
          price:    Number(tk.price),
          quantity: Number(tk.quantity),
        })),
      });
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
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:t.surface, borderRadius:14, padding:28,
        border:`1px solid ${t.border}`, width:560,
        maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontSize:16, fontWeight:800, color:t.text }}>Novo Evento</span>
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
          <Field label="Nome do Evento" theme={t}>
            <Input value={form.name} onChange={(v) => setForm(f=>({...f,name:v}))} placeholder="Ex: Show de Inverno 2025" theme={t} />
          </Field>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Tipo" theme={t}>
              <Select value={form.type} onChange={(v) => setForm(f=>({...f,type:v}))} options={TYPES} theme={t} />
            </Field>
            <Field label="Sala" theme={t}>
              <select
                value={form.roomId}
                onChange={(e) => setForm(f=>({...f,roomId:e.target.value}))}
                style={{
                  width:"100%", padding:"9px 12px", borderRadius:8,
                  border:`1px solid ${t.border}`, background:t.bg,
                  color:t.text, fontSize:13, fontFamily:"inherit",
                  outline:"none", cursor:"pointer",
                }}
              >
                <option value="">Selecione uma sala</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Data e Hora de Início" theme={t}>
              <Input value={form.date} onChange={(v) => setForm(f=>({...f,date:v}))} type="datetime-local" theme={t} />
            </Field>
            <Field label="Data e Hora de Fim" theme={t}>
              <Input value={form.endDate} onChange={(v) => setForm(f=>({...f,endDate:v}))} type="datetime-local" theme={t} />
            </Field>
          </div>

          <Field label="Descrição" theme={t}>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f=>({...f,description:e.target.value}))}
              placeholder="Descrição opcional..."
              rows={2}
              style={{
                width:"100%", padding:"9px 12px", borderRadius:8,
                border:`1px solid ${t.border}`, background:t.bg,
                color:t.text, fontSize:13, fontFamily:"inherit",
                outline:"none", resize:"vertical", boxSizing:"border-box",
              }}
            />
          </Field>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input
              type="checkbox"
              checked={form.highlight}
              onChange={(e) => setForm(f=>({...f,highlight:e.target.checked}))}
              id="highlight"
            />
            <label htmlFor="highlight" style={{ fontSize:13, color:t.text, cursor:"pointer" }}>
              Destacar evento
            </label>
          </div>

          {/* ingressos */}
          <div style={{ borderTop:`1px solid ${t.border}`, paddingTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Ingressos</span>
              <button onClick={addTicket} style={{
                padding:"4px 10px", borderRadius:6, border:"none",
                background:`${t.primary}22`, color:t.primary,
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              }}>+ Adicionar</button>
            </div>
            {tickets.map((ticket, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, marginBottom:8 }}>
                <Input value={ticket.type}     onChange={(v) => updateTicket(i,"type",v)}     placeholder="Tipo"  theme={t} />
                <Input value={ticket.price}    onChange={(v) => updateTicket(i,"price",v)}    placeholder="Preço" type="number" theme={t} />
                <Input value={ticket.quantity} onChange={(v) => updateTicket(i,"quantity",v)} placeholder="Qtd"   type="number" theme={t} />
                <button onClick={() => removeTicket(i)} style={{
                  width:34, height:34, borderRadius:7,
                  border:`1px solid ${t.border}`, background:"transparent",
                  color:"#EF4444", cursor:"pointer", fontSize:14,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>✕</button>
              </div>
            ))}
          </div>
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
          }}>{loading ? "Criando..." : "Criar Evento"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Events() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);
  const [pagination,   setPagination]   = useState({});
  const [showModal,    setShowModal]    = useState(false);
  const [refresh,      setRefresh]      = useState(0);

  const STATUSES = ["","SCHEDULED","ONGOING","FINISHED","CANCELLED"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit:9 };
        if (search)       params.search = search;
        if (filterStatus) params.status = filterStatus;
        const data = await eventService.getAll(params);
        setEvents(data.events);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filterStatus, refresh, search]);

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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Eventos</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Gerencie todos os eventos do seu negócio.
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
                placeholder="Buscar por nome ou descrição..."
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
            <button onClick={() => setShowModal(true)} style={{
              padding:"8px 16px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
            }}>+ Novo Evento</button>
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
          ) : events.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:t.textMuted }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:6 }}>
                Nenhum evento encontrado
              </div>
              <div style={{ fontSize:13, marginBottom:20 }}>
                Crie seu primeiro evento para começar.
              </div>
              <button onClick={() => setShowModal(true)} style={{
                padding:"10px 20px", borderRadius:8, border:"none",
                background:t.primary, color:"#fff", fontWeight:700,
                cursor:"pointer", fontFamily:"inherit",
              }}>+ Novo Evento</button>
            </div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
                {events.map((event) => (
                  <EventCard key={event.id} event={event} theme={t} navigate={navigate} />
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
        <CreateEventModal
          theme={t}
          onClose={() => setShowModal(false)}
          onSuccess={() => setRefresh(r => r + 1)}
        />
      )}
    </div>
  );
}

// ─── EVENT CARD ───────────────────────────────────────────────────────────────
function EventCard({ event, theme:t }) {
  const status        = STATUS_COLORS[event.status] || STATUS_COLORS.SCHEDULED;
  const icon          = TYPE_ICONS[event.type]      || "📅";
  const totalSold     = event.tickets?.reduce((a,tk) => a + tk.sold,     0) || 0;
  const totalCapacity = event.tickets?.reduce((a,tk) => a + tk.quantity, 0) || 0;
  const occupancy     = totalCapacity > 0 ? Math.round((totalSold/totalCapacity)*100) : 0;

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
          }}>{icon}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:t.text }}>{event.name}</div>
            <div style={{ fontSize:11, color:t.textMuted }}>{event.type}</div>
          </div>
        </div>
        <span style={{
          fontSize:10, fontWeight:700, color:status.color,
          background:`${status.color}22`, padding:"3px 8px", borderRadius:20,
        }}>{status.label}</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ fontSize:12, color:t.textMuted, display:"flex", alignItems:"center", gap:5 }}>
          <span>📅</span>
          {new Date(event.date).toLocaleDateString("pt-BR", {
            day:"2-digit", month:"short", year:"numeric",
            hour:"2-digit", minute:"2-digit",
          })}
        </div>
        {event.room && (
          <div style={{ fontSize:12, color:t.textMuted, display:"flex", alignItems:"center", gap:5 }}>
            <span>📍</span> {event.room.name}
            {event.room.location && ` · ${event.room.location}`}
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { label:"Vendidos",   value:totalSold                  },
          { label:"Capacidade", value:totalCapacity              },
          { label:"Check-ins",  value:event._count?.checkins || 0 },
        ].map((m) => (
          <div key={m.label} style={{
            background:t.bg, borderRadius:8, padding:"8px",
            border:`1px solid ${t.border}`, textAlign:"center",
          }}>
            <div style={{ fontSize:15, fontWeight:800, color:t.primary }}>{m.value}</div>
            <div style={{ fontSize:9, color:t.textMuted, marginTop:2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {totalCapacity > 0 && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
            <span style={{ color:t.textMuted }}>Ocupação</span>
            <span style={{ color:t.primary, fontWeight:700 }}>{occupancy}%</span>
          </div>
          <div style={{ height:5, background:t.border, borderRadius:3, overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${occupancy}%`,
              background:"linear-gradient(90deg, #705EBD, #A78BFA)",
              borderRadius:3,
            }} />
          </div>
        </div>
      )}

      {event.tickets?.length > 0 && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {event.tickets.map((ticket) => (
            <span key={ticket.id} style={{
              fontSize:10, fontWeight:600, color:t.primary,
              background:`${t.primary}22`, padding:"2px 8px",
              borderRadius:20, border:`1px solid ${t.primary}44`,
            }}>
              {ticket.type} · R$ {Number(ticket.price).toLocaleString("pt-BR", { minimumFractionDigits:2 })}
            </span>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginTop:4 }}>
        <button style={{
          flex:1, padding:"8px", borderRadius:8, border:"none",
          background:"linear-gradient(135deg, #705EBD, #A78BFA)",
          color:"#fff", fontWeight:700, fontSize:12,
          cursor:"pointer", fontFamily:"inherit",
        }}>👁 Ver Detalhes</button>
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