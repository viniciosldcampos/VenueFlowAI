import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const EVENTS_BY_DAY = {
  1:  [{ id:1,  time:"09:00", name:"Congresso Tech",        room:"Sala 02",            type:"Congresso", color:"#4A90D9" }],
  2:  [{ id:2,  time:"20:00", name:"Show de Inverno 2025",  room:"Teatro Municipal",   type:"Show",      color:"#705EBD" }],
  4:  [{ id:3,  time:"19:30", name:"Peça: Além do Tempo",   room:"Auditório Principal",type:"Teatro",    color:"#22C55E" }],
  7:  [{ id:4,  time:"14:00", name:"Workshop de Design",    room:"Sala Multiuso 03",   type:"Workshop",  color:"#D97706" }],
  9:  [{ id:5,  time:"10:00", name:"Palestra: Inovação",    room:"Auditório Principal",type:"Palestra",  color:"#06B6D4" }],
  11: [{ id:6,  time:"20:00", name:"Espetáculo Infantil",   room:"Teatro Municipal",   type:"Show",      color:"#EC4899" }],
  15: [{ id:7,  time:"09:00", name:"Congresso Tech",        room:"Sala 02",            type:"Congresso", color:"#4A90D9" },
       { id:8,  time:"14:00", name:"Workshop de Marketing", room:"Sala Multiuso 01",   type:"Workshop",  color:"#D97706" }],
  17: [{ id:9,  time:"19:30", name:"Peça: Além do Tempo",   room:"Teatro Municipal",   type:"Teatro",    color:"#22C55E" }],
  19: [{ id:10, time:"20:00", name:"Gala de Premiação 2025",room:"Auditório Principal",type:"Show",      color:"#705EBD" }],
  22: [{ id:11, time:"09:00", name:"Fórum de Inovação",     room:"Centro de Eventos",  type:"Fórum",     color:"#0EA5E9" }],
  24: [{ id:12, time:"20:00", name:"Show de Inverno 2025",  room:"Teatro Municipal",   type:"Show",      color:"#705EBD" }],
  25: [{ id:13, time:"09:00", name:"Congresso Tech",        room:"Sala 02",            type:"Congresso", color:"#4A90D9" },
       { id:14, time:"20:00", name:"Festival de Música",    room:"Arena Eventos",      type:"Festival",  color:"#22C55E" }],
  27: [{ id:15, time:"16:00", name:"Espetáculo Infantil",   room:"Teatro Municipal",   type:"Show",      color:"#EC4899" }],
  29: [{ id:16, time:"10:00", name:"Palestra: Inovação",    room:"Auditório Principal",type:"Palestra",  color:"#06B6D4" }],
  30: [{ id:17, time:"20:00", name:"Festival de Música",    room:"Arena Eventos",      type:"Festival",  color:"#22C55E" }],
};

const NEXT_EVENTS = [
  { id:1,  name:"Show de Inverno 2025",  when:"Hoje • 20:00",    room:"Teatro Municipal",    tickets:482, color:"#705EBD" },
  { id:2,  name:"Congresso Tech",        when:"Amanhã • 09:00",  room:"Sala 02",             tickets:120, color:"#4A90D9" },
  { id:3,  name:"Peça: Além do Tempo",   when:"Amanhã • 19:30",  room:"Auditório Principal", tickets:320, color:"#22C55E" },
  { id:4,  name:"Workshop de Design",    when:"28/07 • 14:00",   room:"Sala Multiuso 03",    tickets:45,  color:"#D97706" },
];

const MINI_CALENDAR_EVENTS = [1,2,4,7,9,11,15,17,19,22,24,25,27,29,30];
const TODAY = 25;

const WEEKS = [
  [29,30,1,2,3,4,5],
  [6,7,8,9,10,11,12],
  [13,14,15,16,17,18,19],
  [20,21,22,23,24,25,26],
  [27,28,29,30,31,1,2],
];

const LEGEND = [
  { color:"#705EBD", label:"Shows"      },
  { color:"#4A90D9", label:"Congressos" },
  { color:"#22C55E", label:"Teatros"    },
  { color:"#D97706", label:"Workshops"  },
  { color:"#06B6D4", label:"Palestras"  },
  { color:"#EF4444", label:"Outros"     },
];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"            },
  { icon:"🏛", label:"Salas",            path:"/rooms"       },
  { icon:"📅", label:"Eventos",          path:"/events"      },
  { icon:"📆", label:"Calendário",       path:"/calendar", active:true },
  { icon:"🎫", label:"Reservas",         path:"/reservations"},
  { icon:"👥", label:"Clientes",         path:"/"            },
  { icon:"💰", label:"Financeiro",       path:"/"            },
  { icon:"📊", label:"Relatórios",       path:"/"            },
  { icon:"⏳", label:"Listas de Espera", path:"/"            },
  { icon:"✅", label:"Check-in",         path:"/"            },
  { icon:"⚙",  label:"Configurações",   path:"/"            },
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Calendar() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [viewMode,   setViewMode]   = useState("Mês");
  const [activeDay,  setActiveDay]  = useState(null);

  const VIEW_MODES = ["Mês","Semana","Dia","Agenda"];

  return (
    <div style={{
      display:"flex", height:"100vh", width:"100vw",
      background:t.bg, color:t.text,
      fontFamily:"'Sora', system-ui, sans-serif",
      overflow:"hidden", position:"fixed", top:0, left:0,
    }}>
      <Sidebar theme={t} navigate={navigate} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* TOPBAR */}
        <div style={{
          padding:"16px 24px 0", display:"flex",
          alignItems:"flex-start", justifyContent:"space-between", flexShrink:0,
        }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Calendário</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Visualize todos os eventos e reservas no calendário.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <SearchBar theme={t} />
            <IconBtn onClick={toggleDarkMode} theme={t}>{darkMode ? "☀" : "🌙"}</IconBtn>
            <NotifBtn theme={t} />
            <button style={{
              padding:"8px 16px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:6,
            }}>+ Novo Evento ▾</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflow:"hidden", padding:"16px 24px 24px", display:"flex", flexDirection:"column", gap:0 }}>

          {/* CONTROLES DO CALENDÁRIO */}
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            marginBottom:16, flexWrap:"wrap",
          }}>
            {/* nav mês */}
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <NavBtn theme={t}>‹</NavBtn>
              <NavBtn theme={t}>›</NavBtn>
              <div style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 12px", background:t.surface,
                border:`1px solid ${t.border}`, borderRadius:8,
                fontSize:14, fontWeight:700, color:t.text,
              }}>
                Julho 2025
                <span style={{ fontSize:10, color:t.textMuted }}>▼</span>
              </div>
              <button style={{
                padding:"6px 14px", borderRadius:8, fontSize:12,
                border:`1px solid ${t.border}`, background:t.surface,
                color:t.text, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
              }}>Hoje</button>
            </div>

            <div style={{ flex:1 }} />

            {/* filtros */}
            <FilterSelect theme={t} options={["Todas as Salas","Teatro Municipal","Arena Eventos","Centro de Eventos"]} />
            <FilterSelect theme={t} options={["Todos os Tipos","Show","Congresso","Teatro","Workshop"]} />
            <FilterSelect theme={t} options={["Todos os Status","Agendado","Em andamento","Encerrado"]} />
            <button style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 12px", borderRadius:8,
              border:`1px solid ${t.border}`, background:t.surface,
              color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit",
            }}>🔧 Filtros</button>

            {/* view modes */}
            <div style={{
              display:"flex", background:t.surface, borderRadius:8,
              border:`1px solid ${t.border}`, overflow:"hidden",
            }}>
              {VIEW_MODES.map((vm) => (
                <button key={vm} onClick={() => setViewMode(vm)} style={{
                  padding:"7px 16px", border:"none", cursor:"pointer",
                  fontSize:13, fontWeight: viewMode===vm ? 700 : 400,
                  background: viewMode===vm ? t.primary : "transparent",
                  color:      viewMode===vm ? "#fff" : t.textMuted,
                  fontFamily:"inherit", transition:"all 0.15s",
                }}>{vm}</button>
              ))}
            </div>
          </div>

          {/* GRID PRINCIPAL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16, flex:1, overflow:"hidden" }}>

            {/* CALENDÁRIO MENSAL */}
            <div style={{
              background:t.surface, borderRadius:12,
              border:`1px solid ${t.border}`,
              display:"flex", flexDirection:"column", overflow:"hidden",
            }}>
              {/* cabeçalho dias da semana */}
              <div style={{
                display:"grid", gridTemplateColumns:"repeat(7,1fr)",
                borderBottom:`1px solid ${t.border}`,
              }}>
                {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => (
                  <div key={d} style={{
                    padding:"10px 0", textAlign:"center",
                    fontSize:12, fontWeight:700, color:t.textMuted,
                    borderRight:`1px solid ${t.border}`,
                  }}>{d}</div>
                ))}
              </div>

              {/* semanas */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                {WEEKS.map((week, wi) => (
                  <div key={wi} style={{
                    display:"grid", gridTemplateColumns:"repeat(7,1fr)",
                    flex:1, borderBottom: wi < WEEKS.length-1 ? `1px solid ${t.border}` : "none",
                  }}>
                    {week.map((day, di) => {
                      const isOther   = (wi===0 && day>20) || (wi===4 && day<10);
                      const isToday   = day===TODAY && !isOther;
                      const events    = (!isOther && EVENTS_BY_DAY[day]) || [];
                      const visible   = events.slice(0,2);
                      const extra     = events.length - 2;
                      const isActive  = activeDay === day && !isOther;

                      return (
                        <div
                          key={di}
                          onClick={() => !isOther && setActiveDay(isActive ? null : day)}
                          style={{
                            borderRight: di < 6 ? `1px solid ${t.border}` : "none",
                            padding:"6px 8px", cursor: isOther ? "default" : "pointer",
                            background: isActive ? `${t.primary}11` : "transparent",
                            transition:"background 0.15s",
                            display:"flex", flexDirection:"column", gap:3, overflow:"hidden",
                          }}
                        >
                          {/* número do dia */}
                          <div style={{
                            width:26, height:26, borderRadius:"50%",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:13, fontWeight: isToday ? 700 : 400,
                            background: isToday ? t.primary : "transparent",
                            color: isOther ? t.border : isToday ? "#fff" : t.text,
                            flexShrink:0,
                          }}>{day}</div>

                          {/* eventos */}
                          {visible.map((ev) => (
                            <div key={ev.id} style={{
                              fontSize:10, fontWeight:600,
                              color:      ev.color,
                              background: `${ev.color}18`,
                              border:     `1px solid ${ev.color}44`,
                              borderRadius:4, padding:"2px 5px",
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                              lineHeight:1.4,
                            }}>
                              {ev.time} {ev.name}
                            </div>
                          ))}

                          {/* + N eventos */}
                          {extra > 0 && (
                            <div style={{
                              fontSize:10, fontWeight:700,
                              color:t.primary, cursor:"pointer",
                              padding:"1px 4px",
                            }}>+ {extra} evento{extra>1?"s":""}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* legenda */}
              <div style={{
                padding:"10px 16px", borderTop:`1px solid ${t.border}`,
                display:"flex", gap:16, flexWrap:"wrap",
              }}>
                {LEGEND.map((l) => (
                  <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:l.color }} />
                    <span style={{ fontSize:11, color:t.textMuted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUNA DIREITA */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, overflowY:"auto" }}>
              <MiniCalendar theme={t} today={TODAY} eventDays={MINI_CALENDAR_EVENTS} />
              <NextEvents events={NEXT_EVENTS} theme={t} />
              <MonthSummary theme={t} />
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
            Você possui 18 eventos agendados para este mês.
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

// ─── MINI CALENDÁRIO ─────────────────────────────────────────────────────────
function MiniCalendar({ theme:t, today, eventDays }) {
  const days = ["D","S","T","Q","Q","S","S"];
  const MINI_WEEKS = [
    [29,30,1,2,3,4,5],
    [6,7,8,9,10,11,12],
    [13,14,15,16,17,18,19],
    [20,21,22,23,24,25,26],
    [27,28,29,30,31,1,2],
    [3,4,5,6,7,8,9],
  ];

  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:14,
      border:`1px solid ${t.border}`,
    }}>
      <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:10 }}>
        Calendário Mini
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <button style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14 }}>‹</button>
        <span style={{ fontSize:12, fontWeight:700, color:t.text }}>Julho 2025</span>
        <button style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:14 }}>›</button>
      </div>

      {/* dias da semana */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:2 }}>
        {days.map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:9, color:t.textMuted, fontWeight:700, padding:"2px 0" }}>{d}</div>
        ))}
      </div>

      {/* semanas */}
      {MINI_WEEKS.map((week, wi) => (
        <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {week.map((day, di) => {
            const isOther   = (wi===0 && day>20) || (wi===5 && day<10);
            const isToday   = day===today && !isOther;
            const hasEvent  = eventDays.includes(day) && !isOther;

            return (
              <div key={di} style={{
                textAlign:"center", padding:"3px 0", fontSize:11,
                color: isOther ? t.border : isToday ? "#fff" : t.text,
                fontWeight: isToday ? 700 : 400,
                background: isToday ? t.primary : "transparent",
                borderRadius: isToday ? "50%" : 0,
                cursor: "pointer", position:"relative",
                width:24, height:24, display:"flex",
                alignItems:"center", justifyContent:"center",
                margin:"1px auto",
              }}>
                {day}
                {hasEvent && !isToday && (
                  <div style={{
                    position:"absolute", bottom:1, left:"50%",
                    transform:"translateX(-50%)",
                    width:3, height:3, borderRadius:"50%",
                    background:t.primary,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── PRÓXIMOS EVENTOS ─────────────────────────────────────────────────────────
function NextEvents({ events, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:14,
      border:`1px solid ${t.border}`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12,
      }}>
        <span style={{ fontWeight:700, fontSize:13, color:t.text }}>Próximos Eventos</span>
        <button style={{
          background:"none", border:"none", color:t.primary,
          fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
        }}>Ver todos</button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {events.map((ev) => (
          <div key={ev.id} style={{
            display:"flex", alignItems:"center", gap:10,
          }}>
            {/* thumb */}
            <div style={{
              width:40, height:40, borderRadius:8, flexShrink:0,
              background:`${ev.color}22`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            }}>🎭</div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:12, fontWeight:700, color:t.text,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>{ev.name}</div>
              <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>
                🕐 {ev.when}
              </div>
              <div style={{ fontSize:10, color:t.textMuted }}>
                📍 {ev.room}
              </div>
            </div>

            <span style={{
              fontSize:10, fontWeight:700, color:ev.color,
              background:`${ev.color}22`, padding:"2px 7px",
              borderRadius:20, whiteSpace:"nowrap", flexShrink:0,
            }}>{ev.tickets} ingressos</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RESUMO DO MÊS ───────────────────────────────────────────────────────────
function MonthSummary({ theme:t }) {
  const items = [
    { value:"18",          label:"Eventos",           icon:"📅", color:t.primary },
    { value:"7.850",       label:"Ingressos Vendidos", icon:"🎫", color:"#4A90D9" },
    { value:"R$ 89.500",   label:"Receita Gerada",    icon:"💰", color:"#22C55E" },
    { value:"87%",         label:"Taxa de Ocupação",  icon:"📊", color:"#F59E0B" },
  ];

  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:14,
      border:`1px solid ${t.border}`,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12,
      }}>
        <span style={{ fontWeight:700, fontSize:13, color:t.text }}>Resumo do Mês</span>
        <button style={{
          background:"none", border:"none", color:t.primary,
          fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
        }}>Ver relatório</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {items.map((item) => (
          <div key={item.label} style={{
            background:t.bg, borderRadius:8, padding:"10px",
            border:`1px solid ${t.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:item.color }}>
                {item.value}
              </div>
              <div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>
                {item.label}
              </div>
            </div>
            <span style={{
              fontSize:20,
              background:`${item.color}22`,
              width:36, height:36, borderRadius:8,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>{item.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function SearchBar({ theme:t }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:8,
      background:t.surface, border:`1px solid ${t.border}`,
      borderRadius:8, padding:"8px 12px", width:280,
    }}>
      <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
      <input
        placeholder="Buscar por evento, sala ou cliente..."
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
  );
}

function IconBtn({ children, onClick, theme:t }) {
  return (
    <button onClick={onClick} style={{
      width:36, height:36, borderRadius:8, border:`1px solid ${t.border}`,
      background:t.surface, cursor:"pointer", fontSize:16,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>{children}</button>
  );
}

function NotifBtn({ theme:t }) {
  return (
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
  );
}

function NavBtn({ children, theme:t }) {
  return (
    <button style={{
      width:30, height:30, borderRadius:7,
      border:`1px solid ${t.border}`, background:t.surface,
      color:t.textMuted, cursor:"pointer", fontSize:16,
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