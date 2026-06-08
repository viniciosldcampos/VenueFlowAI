import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const CURRENT_EVENT = {
  name:     "Show de Inverno 2025",
  date:     "25/07/2025 às 20:00",
  room:     "Teatro Municipal",
  sold:     1250,
  checkins: 1048,
  waiting:  202,
  refused:  0,
  capacity: 1450,
  color:    "#705EBD",
};

const CHECKIN_RESULT = {
  success: true,
  time:    "19:42:31",
  client: {
    name:     "Juliana Costa",
    email:    "juliana@email.com",
    phone:    "(11) 98888-7777",
    group:    "VIP",
    initials: "JC",
  },
  ticket: {
    type:     "VIP - Inteira",
    code:     "INVERNO2025-7X9K2",
    sector:   "Plateia VIP",
    row:      "A",
    seat:     "12",
    ticketType: "Inteira",
    price:    "R$ 350,00",
    boughtAt: "15/07/2025 14:32",
  },
};

const RECENT_ACTIVITY = [
  { name:"Juliana Costa",   detail:"VIP · Plateia VIP A12",  time:"19:42", status:"Check-in",  initials:"JC" },
  { name:"Lucas Almeida",   detail:"Inteira · Plateia A15",  time:"19:41", status:"Check-in",  initials:"LA" },
  { name:"Fernanda Lima",   detail:"Meia · Balcão B07",      time:"19:41", status:"Check-in",  initials:"FL" },
  { name:"Rafael Souza",    detail:"Inteira · Plateia A16",  time:"19:40", status:"Check-in",  initials:"RS" },
  { name:"Mariana Santos",  detail:"VIP · Plateia VIP A10",  time:"19:39", status:"Recusado",  initials:"MS" },
];

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
  { icon:"⚙",  label:"Configurações",   path:"/"             },
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Checkin() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [scanTab,      setScanTab]      = useState("Leitor de QR Code");
  const [showResult,   setShowResult]   = useState(true);
  const [manualCode,   setManualCode]   = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const occ = Math.round((CURRENT_EVENT.checkins / CURRENT_EVENT.sold) * 100);

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
              }}>3</span>
            </button>
            <button style={{
              padding:"8px 16px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:6,
            }}>📋 Histórico de Check-ins ⏱</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* EVENTO ATUAL */}
          <EventBanner event={CURRENT_EVENT} theme={t} />

          {/* ÁREA PRINCIPAL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 300px", gap:16, alignItems:"start" }}>

            {/* LEITOR QR */}
            <QRScanner
              theme={t}
              scanTab={scanTab}
              setScanTab={setScanTab}
              manualCode={manualCode}
              setManualCode={setManualCode}
              cameraActive={cameraActive}
              setCameraActive={setCameraActive}
              onScan={() => setShowResult(true)}
            />

            {/* RESULTADO DO CHECK-IN */}
            {showResult ? (
              <CheckinResult
                result={CHECKIN_RESULT}
                theme={t}
                onClose={() => setShowResult(false)}
                onNext={() => setShowResult(false)}
              />
            ) : (
              <EmptyResult theme={t} />
            )}

            {/* PAINEL DIREITO */}
            <RightPanel
              event={CURRENT_EVENT}
              activity={RECENT_ACTIVITY}
              theme={t}
              occ={occ}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EVENTO ATUAL ─────────────────────────────────────────────────────────────
function EventBanner({ event, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"14px 18px",
      border:`1px solid ${t.border}`,
      display:"flex", alignItems:"center", gap:16,
    }}>
      {/* thumb */}
      <div style={{
        width:72, height:52, borderRadius:8, flexShrink:0,
        background:`${event.color}33`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
        overflow:"hidden",
      }}>🎭</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color:t.textMuted, fontWeight:600, marginBottom:3 }}>
          Evento Atual
        </div>
        <div style={{ fontSize:16, fontWeight:800, color:t.text }}>{event.name}</div>
        <div style={{ display:"flex", gap:16, marginTop:3 }}>
          <span style={{ fontSize:11, color:t.textMuted }}>📅 {event.date}</span>
          <span style={{ fontSize:11, color:t.textMuted }}>📍 {event.room}</span>
        </div>
      </div>

      <button style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"9px 18px", borderRadius:8,
        border:`1px solid ${t.border}`, background:t.bg,
        color:t.text, fontSize:13, fontWeight:600,
        cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
      }}>⇄ Trocar Evento</button>
    </div>
  );
}

// ─── LEITOR QR ────────────────────────────────────────────────────────────────
function QRScanner({ theme:t, scanTab, setScanTab, manualCode, setManualCode, cameraActive, setCameraActive, onScan }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12,
      border:`1px solid ${t.border}`, overflow:"hidden",
    }}>
      {/* tabs */}
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
            {/* frame do QR */}
            <div style={{
              width:"100%", aspectRatio:"1",
              maxHeight:280,
              background: cameraActive ? "#000" : t.bg,
              borderRadius:12, border:`2px dashed ${t.border}`,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              position:"relative", overflow:"hidden", marginBottom:16,
            }}>
              {/* cantos do frame */}
              {[
                { top:12, left:12,  borderTop:`3px solid ${t.primary}`, borderLeft:`3px solid ${t.primary}` },
                { top:12, right:12, borderTop:`3px solid ${t.primary}`, borderRight:`3px solid ${t.primary}` },
                { bottom:12, left:12,  borderBottom:`3px solid ${t.primary}`, borderLeft:`3px solid ${t.primary}` },
                { bottom:12, right:12, borderBottom:`3px solid ${t.primary}`, borderRight:`3px solid ${t.primary}` },
              ].map((style, i) => (
                <div key={i} style={{
                  position:"absolute", width:28, height:28, borderRadius:3, ...style,
                }} />
              ))}

              {cameraActive ? (
                <div style={{ color:"#fff", fontSize:13, textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>📷</div>
                  Câmera ativa
                  <br />
                  <span style={{ fontSize:11, opacity:0.7 }}>Aguardando leitura...</span>
                </div>
              ) : (
                <>
                  {/* ícone QR decorativo */}
                  <div style={{
                    width:80, height:80, display:"grid",
                    gridTemplateColumns:"1fr 1fr", gap:4,
                    opacity:0.2, marginBottom:12,
                  }}>
                    {[...Array(4)].map((_,i) => (
                      <div key={i} style={{
                        background:t.text, borderRadius:4,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <div style={{
                          width:"60%", height:"60%",
                          background:t.bg, borderRadius:2,
                        }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:13, color:t.textMuted, textAlign:"center", lineHeight:1.6 }}>
                    Aponte o QR Code do ingresso
                    <br />
                    <span style={{ fontSize:11 }}>Centralize o código no frame para escanear</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ textAlign:"center", color:t.textMuted, fontSize:12, marginBottom:14 }}>ou</div>

            <button
              onClick={() => { setCameraActive(!cameraActive); if (!cameraActive) setTimeout(onScan, 2000); }}
              style={{
                width:"100%", padding:"11px",
                borderRadius:8, border:`1px solid ${t.border}`,
                background:cameraActive ? t.primary : t.bg,
                color: cameraActive ? "#fff" : t.text,
                fontWeight:700, fontSize:13, cursor:"pointer",
                fontFamily:"inherit", display:"flex",
                alignItems:"center", justifyContent:"center", gap:8,
                marginBottom:12,
              }}
            >
              📷 {cameraActive ? "Desativar câmera" : "Ativar câmera"}
            </button>

            <button
              onClick={onScan}
              style={{
                width:"100%", background:"none", border:"none",
                color:t.primary, fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit",
                textDecoration:"underline", textDecorationStyle:"dotted",
              }}
            >
              Digitar código do ingresso
            </button>
          </>
        ) : (
          /* BUSCA MANUAL */
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:12, color:t.textMuted, marginBottom:6, fontWeight:600 }}>
                Código do Ingresso
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Ex: INVERNO2025-7X9K2"
                  style={{
                    flex:1, padding:"10px 12px", borderRadius:8,
                    border:`1px solid ${t.border}`, background:t.bg,
                    color:t.text, fontSize:13, fontFamily:"inherit", outline:"none",
                  }}
                />
                <button
                  onClick={() => manualCode && onScan()}
                  style={{
                    padding:"10px 16px", borderRadius:8, border:"none",
                    background:t.primary, color:"#fff",
                    fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
                  }}
                >Buscar</button>
              </div>
            </div>

            <div style={{ textAlign:"center", color:t.textMuted, fontSize:12 }}>— ou busque por —</div>

            {[
              { label:"Nome do Participante", placeholder:"Ex: Juliana Costa" },
              { label:"E-mail",               placeholder:"Ex: juliana@email.com" },
              { label:"CPF",                  placeholder:"Ex: 123.456.789-00" },
            ].map((field) => (
              <div key={field.label}>
                <div style={{ fontSize:12, color:t.textMuted, marginBottom:5, fontWeight:600 }}>
                  {field.label}
                </div>
                <input
                  placeholder={field.placeholder}
                  style={{
                    width:"100%", padding:"10px 12px", borderRadius:8,
                    border:`1px solid ${t.border}`, background:t.bg,
                    color:t.text, fontSize:12, fontFamily:"inherit",
                    outline:"none", boxSizing:"border-box",
                  }}
                />
              </div>
            ))}

            <button
              onClick={onScan}
              style={{
                width:"100%", padding:"11px", borderRadius:8, border:"none",
                background:t.primary, color:"#fff",
                fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}
            >🔍 Buscar Participante</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RESULTADO DO CHECK-IN ────────────────────────────────────────────────────
function CheckinResult({ result, theme:t, onClose, onNext }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12,
      border:`1px solid ${t.border}`, overflow:"hidden",
    }}>
      {/* banner de sucesso */}
      <div style={{
        background:"#22C55E11", borderBottom:`1px solid #22C55E33`,
        padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>✅</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:"#22C55E" }}>
              Check-in realizado com sucesso!
            </div>
            <div style={{ fontSize:11, color:t.textMuted }}>
              Entrada registrada às {result.time}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background:"none", border:"none", color:t.textMuted,
          cursor:"pointer", fontSize:18, lineHeight:1,
        }}>✕</button>
      </div>

      <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
        {/* dados do cliente */}
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{
            width:64, height:64, borderRadius:"50%", flexShrink:0,
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:700, color:"#fff",
          }}>{result.client.initials}</div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:18, fontWeight:800, color:t.text }}>{result.client.name}</span>
              <span style={{
                fontSize:10, fontWeight:700, color:"#F59E0B",
                background:"#F59E0B22", padding:"2px 8px", borderRadius:20,
              }}>{result.client.group}</span>
            </div>
            <div style={{ fontSize:12, color:t.textMuted }}>✉ {result.client.email}</div>
            <div style={{ fontSize:12, color:t.textMuted }}>📞 {result.client.phone}</div>
          </div>
        </div>

        {/* detalhes do ingresso */}
        <div style={{
          background:t.bg, borderRadius:10, padding:14,
          border:`1px solid ${t.border}`,
          display:"flex", flexDirection:"column", gap:8,
        }}>
          {[
            { label:"Ingresso",           value:result.ticket.type       },
            { label:"Código do Ingresso", value:result.ticket.code       },
            { label:"Setor",              value:result.ticket.sector     },
            { label:"Fila / Assento",     value:`${result.ticket.row} / ${result.ticket.seat}` },
            { label:"Tipo",               value:result.ticket.ticketType },
            { label:"Preço Pago",         value:result.ticket.price      },
            { label:"Compra em",          value:result.ticket.boughtAt   },
          ].map((row) => (
            <div key={row.label} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              fontSize:12, paddingBottom:6,
              borderBottom:`1px solid ${t.border}`,
            }}>
              <span style={{ color:t.textMuted }}>{row.label}</span>
              <span style={{ fontWeight:700, color:t.text }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* ações */}
        <button style={{
          width:"100%", padding:"11px", borderRadius:8, border:"none",
          background:"#22C55E", color:"#fff",
          fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>✅ Check-in Confirmado</button>

        <button style={{
          width:"100%", padding:"11px", borderRadius:8,
          border:`1px solid ${t.border}`, background:t.bg,
          color:t.text, fontWeight:700, fontSize:13,
          cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>🖨 Imprimir Comprovante</button>

        <button
          onClick={onNext}
          style={{
            width:"100%", padding:"13px", borderRadius:8, border:"none",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            color:"#fff", fontWeight:800, fontSize:14,
            cursor:"pointer", fontFamily:"inherit",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}
        >Próximo Check-in ›</button>
      </div>
    </div>
  );
}

// ─── ESTADO VAZIO ─────────────────────────────────────────────────────────────
function EmptyResult({ theme:t }) {
  return (
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
  );
}

// ─── PAINEL DIREITO ───────────────────────────────────────────────────────────
function RightPanel({ event, activity, theme:t, occ }) {
  return (
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
            { value:event.sold.toLocaleString(),     label:"Ingressos Vendidos", color:t.primary, icon:"🎫" },
            { value:event.checkins.toLocaleString(), label:"Check-ins Realizados",color:"#22C55E",icon:"✅" },
            { value:`${occ}%`,                       label:"Taxa de Comparecimento",color:"#4A90D9",icon:"📊" },
            { value:event.waiting.toLocaleString(),  label:"Aguardando",         color:"#F59E0B", icon:"⏳" },
            { value:event.refused,                   label:"Recusados",          color:"#EF4444", icon:"❌" },
            { value:event.capacity.toLocaleString(), label:"Capacidade Total",   color:t.textMuted,icon:"🏟"},
          ].map((m) => (
            <div key={m.label} style={{
              background:t.bg, borderRadius:8, padding:"10px",
              border:`1px solid ${t.border}`,
              display:"flex", alignItems:"center", gap:8,
            }}>
              <div style={{
                width:34, height:34, borderRadius:8, flexShrink:0,
                background:`${m.color}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
              }}>{m.icon}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:m.color }}>{m.value}</div>
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
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10 }}>
            <span style={{ color:t.textMuted }}>{event.checkins.toLocaleString()} / {event.sold.toLocaleString()}</span>
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
          <button style={{
            background:"none", border:"none", color:t.primary,
            fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
          }}>Ver todas</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {activity.map((a, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                background:"linear-gradient(135deg, #705EBD, #A78BFA)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, color:"#fff",
              }}>{a.initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {a.name}
                </div>
                <div style={{ fontSize:10, color:t.textMuted }}>{a.detail}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:11, color:t.textMuted, marginBottom:2 }}>{a.time}</div>
                <span style={{
                  fontSize:10, fontWeight:700,
                  color: a.status === "Check-in" ? "#22C55E" : "#EF4444",
                  background: a.status === "Check-in" ? "#22C55E22" : "#EF444422",
                  padding:"2px 6px", borderRadius:20,
                }}>{a.status}</span>
              </div>
            </div>
          ))}
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
            Use o leitor de QR Code para agilizar o check-in e evitar filas.
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