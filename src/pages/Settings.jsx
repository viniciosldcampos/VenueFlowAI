import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";

// ─── DADOS MOCKADOS ───────────────────────────────────────────────────────────
const SETTINGS_TABS = [
  "Perfil","Empresa","Plano e Assinatura",
  "Preferências","Usuários","Segurança",
  "Integrações","Notificações","Logs",
];

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",        path:"/"              },
  { icon:"🏛", label:"Salas",            path:"/rooms"         },
  { icon:"📅", label:"Eventos",          path:"/events"        },
  { icon:"📆", label:"Calendário",       path:"/calendar"      },
  { icon:"🎫", label:"Reservas",         path:"/reservations"  },
  { icon:"👥", label:"Clientes",         path:"/clients"       },
  { icon:"💰", label:"Financeiro",       path:"/financial"     },
  { icon:"📊", label:"Relatórios",       path:"/reports"       },
  { icon:"⏳", label:"Listas de Espera", path:"/waitlist"      },
  { icon:"✅", label:"Check-in",         path:"/checkin"       },
  { icon:"⚙",  label:"Configurações",   path:"/settings", active:true },
];

const PLAN_FEATURES = [
  "Eventos ilimitados",
  "Salas e espaços ilimitados",
  "Check-in com QR Code",
  "Relatórios avançados",
  "Acesso à API",
  "Suporte prioritário",
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Settings() {
  const { darkMode, toggleDarkMode } = useEditorStore();
  const t        = darkMode ? THEME.dark : THEME.light;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Perfil");

  // ── Perfil
  const [profile, setProfile] = useState({
    name:     "Vinicios Souza",
    email:    "admin@teatromuncipal.com",
    phone:    "(31) 99911-0000",
    role:     "Administrador",
    language: "Português (BR)",
    timezone: "(GMT-03:00) Brasília",
  });

  // ── Empresa
  const [company, setCompany] = useState({
    name:    "Teatro Municipal",
    cnpj:    "18.123.456/0001-90",
    segment: "Espaços para Eventos",
    phone:   "(31) 3222-1234",
    email:   "contato@teatromuncipal.com",
    address: "Praça da Liberdade, 21 - Funcionários",
    city:    "Belo Horizonte",
    state:   "MG",
    zip:     "30140-010",
  });

  // ── Preferências
  const [prefs, setPrefs] = useState({
    currency:    "BRL (R$)",
    dateFormat:  "DD/MM/YYYY",
    timeFormat:  "24 horas",
    weekStart:   "Segunda-feira",
    overbooking: true,
    autoConfirm: true,
    autoCancel:  false,
  });

  // ── Notificações
  const [notifs, setNotifs] = useState({
    email:          "Todas as notificações",
    sms:            "Apenas importantes",
    push:           "Todas as notificações",
    eventReminders: true,
    dailySummary:   false,
    newReservations:true,
    cancellations:  true,
  });

  const updateProfile  = (k, v) => setProfile(p  => ({...p, [k]:v}));
  const updateCompany  = (k, v) => setCompany(c  => ({...c, [k]:v}));
  const updatePrefs    = (k, v) => setPrefs(p    => ({...p, [k]:v}));
  const updateNotifs   = (k, v) => setNotifs(n   => ({...n, [k]:v}));

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
            <div style={{ fontSize:20, fontWeight:800, color:t.text }}>Configurações</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Gerencie suas preferências e as configurações da sua conta e organização.
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:t.surface, border:`1px solid ${t.border}`,
              borderRadius:8, padding:"8px 12px", width:260,
            }}>
              <span style={{ color:t.textMuted, fontSize:13 }}>🔍</span>
              <input placeholder="Buscar por configurações..." style={{
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
              }}>5</span>
            </button>
            <button style={{
              padding:"8px 20px", borderRadius:8, border:"none",
              background:t.primary, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
            }}>Salvar Alterações</button>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display:"flex", padding:"0 24px", marginTop:12,
          borderBottom:`1px solid ${t.border}`, flexShrink:0,
          overflowX:"auto",
        }}>
          {SETTINGS_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:"10px 16px", border:"none", background:"transparent",
              cursor:"pointer", fontSize:13, whiteSpace:"nowrap",
              fontWeight: activeTab===tab ? 700 : 400,
              color:      activeTab===tab ? t.primary : t.textMuted,
              borderBottom: activeTab===tab ? `2px solid ${t.primary}` : "2px solid transparent",
              fontFamily:"inherit", transition:"all 0.15s",
            }}>{tab}</button>
          ))}
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 300px", gap:16, alignItems:"start" }}>

            {/* COLUNA 1 */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <ProfileSection   profile={profile}   onChange={updateProfile}  theme={t} />
              <PrefsSection     prefs={prefs}        onChange={updatePrefs}    theme={t} />
            </div>

            {/* COLUNA 2 */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <CompanySection   company={company}    onChange={updateCompany}  theme={t} />
              <NotifsSection    notifs={notifs}       onChange={updateNotifs}   theme={t} />
            </div>

            {/* COLUNA 3 */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <PlanSection   theme={t} />
              <SecuritySection theme={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function ProfileSection({ profile, onChange, theme:t }) {
  return (
    <Card title="Informações do Perfil" theme={t}>
      {/* avatar */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <div style={{
            width:80, height:80, borderRadius:"50%",
            background:"linear-gradient(135deg, #705EBD, #A78BFA)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, fontWeight:700, color:"#fff",
          }}>VS</div>
          <button style={{
            position:"absolute", bottom:0, right:0,
            width:26, height:26, borderRadius:"50%",
            border:`2px solid ${t.surface}`,
            background:t.primary, color:"#fff",
            cursor:"pointer", fontSize:12,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>📷</button>
        </div>
      </div>

      <SettingsField label="Nome Completo" theme={t}>
        <Input value={profile.name} onChange={(v) => onChange("name", v)} theme={t} />
      </SettingsField>

      <SettingsField label="E-mail" theme={t}>
        <Input value={profile.email} onChange={(v) => onChange("email", v)} theme={t} />
      </SettingsField>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <SettingsField label="Telefone" theme={t}>
          <Input value={profile.phone} onChange={(v) => onChange("phone", v)} theme={t} />
        </SettingsField>
        <SettingsField label="Cargo" theme={t}>
          <Input value={profile.role} onChange={(v) => onChange("role", v)} theme={t} />
        </SettingsField>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <SettingsField label="Idioma" theme={t}>
          <Select
            value={profile.language}
            onChange={(v) => onChange("language", v)}
            options={["Português (BR)","English","Español"]}
            theme={t}
          />
        </SettingsField>
        <SettingsField label="Fuso Horário" theme={t}>
          <Select
            value={profile.timezone}
            onChange={(v) => onChange("timezone", v)}
            options={["(GMT-03:00) Brasília","(GMT-05:00) New York","(GMT+00:00) Londres"]}
            theme={t}
          />
        </SettingsField>
      </div>

      <div style={{ marginTop:4 }}>
        <div style={{ fontSize:12, color:t.textMuted, marginBottom:8, fontWeight:600 }}>Alterar Senha</div>
        <button style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"8px 16px", borderRadius:8,
          border:`1px solid ${t.border}`, background:t.bg,
          color:t.text, fontSize:12, fontWeight:600,
          cursor:"pointer", fontFamily:"inherit",
        }}>🔒 Redefinir Senha</button>
      </div>
    </Card>
  );
}

// ─── EMPRESA ──────────────────────────────────────────────────────────────────
function CompanySection({ company, onChange, theme:t }) {
  return (
    <Card title="Empresa / Organização" theme={t}>
      <SettingsField label="Nome da Empresa" theme={t}>
        <Input value={company.name} onChange={(v) => onChange("name", v)} theme={t} />
      </SettingsField>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <SettingsField label="CNPJ" theme={t}>
          <Input value={company.cnpj} onChange={(v) => onChange("cnpj", v)} theme={t} />
        </SettingsField>
        <SettingsField label="Segmento" theme={t}>
          <Select
            value={company.segment}
            onChange={(v) => onChange("segment", v)}
            options={["Espaços para Eventos","Teatro","Cinema","Arena","Auditório"]}
            theme={t}
          />
        </SettingsField>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <SettingsField label="Telefone" theme={t}>
          <Input value={company.phone} onChange={(v) => onChange("phone", v)} theme={t} />
        </SettingsField>
        <SettingsField label="E-mail Corporativo" theme={t}>
          <Input value={company.email} onChange={(v) => onChange("email", v)} theme={t} />
        </SettingsField>
      </div>

      <SettingsField label="Endereço" theme={t}>
        <Input value={company.address} onChange={(v) => onChange("address", v)} theme={t} />
      </SettingsField>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12 }}>
        <SettingsField label="Cidade" theme={t}>
          <Input value={company.city} onChange={(v) => onChange("city", v)} theme={t} />
        </SettingsField>
        <SettingsField label="Estado" theme={t}>
          <Input value={company.state} onChange={(v) => onChange("state", v)} theme={t} />
        </SettingsField>
        <SettingsField label="CEP" theme={t}>
          <Input value={company.zip} onChange={(v) => onChange("zip", v)} theme={t} />
        </SettingsField>
      </div>

      <SettingsField label="Logo da Empresa" theme={t}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:64, height:64, borderRadius:10,
            background:t.bg, border:`1px solid ${t.border}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
          }}>🏛</div>
          <div>
            <button style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 14px", borderRadius:8,
              border:`1px solid ${t.border}`, background:t.bg,
              color:t.text, fontSize:12, fontWeight:600,
              cursor:"pointer", fontFamily:"inherit", marginBottom:4,
            }}>📁 Alterar Logo</button>
            <div style={{ fontSize:10, color:t.textMuted }}>PNG ou JPG, máx. 2MB</div>
          </div>
        </div>
      </SettingsField>
    </Card>
  );
}

// ─── PREFERÊNCIAS ─────────────────────────────────────────────────────────────
function PrefsSection({ prefs, onChange, theme:t }) {
  return (
    <Card title="Preferências Gerais" theme={t}>
      {[
        { label:"Moeda Padrão",  key:"currency",   opts:["BRL (R$)","USD ($)","EUR (€)"] },
        { label:"Formato de Data", key:"dateFormat", opts:["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"] },
        { label:"Formato de Hora", key:"timeFormat", opts:["24 horas","12 horas (AM/PM)"] },
        { label:"Início da Semana",key:"weekStart",  opts:["Segunda-feira","Domingo"] },
      ].map((field) => (
        <div key={field.key} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"8px 0", borderBottom:`1px solid ${t.border}`,
        }}>
          <span style={{ fontSize:13, color:t.text }}>{field.label}</span>
          <Select
            value={prefs[field.key]}
            onChange={(v) => onChange(field.key, v)}
            options={field.opts}
            theme={t}
            compact
          />
        </div>
      ))}

      {[
        { label:"Permitir Overbooking",                   key:"overbooking" },
        { label:"Confirmação Automática de Reservas",     key:"autoConfirm" },
        { label:"Cancelamento Automático de Reservas Expiradas", key:"autoCancel" },
      ].map((tog) => (
        <div key={tog.key} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 0", borderBottom:`1px solid ${t.border}`,
        }}>
          <span style={{ fontSize:13, color:t.text }}>{tog.label}</span>
          <Toggle
            value={prefs[tog.key]}
            onChange={(v) => onChange(tog.key, v)}
            primary={t.primary} border={t.border}
          />
        </div>
      ))}
    </Card>
  );
}

// ─── NOTIFICAÇÕES ─────────────────────────────────────────────────────────────
function NotifsSection({ notifs, onChange, theme:t }) {
  return (
    <Card title="Notificações" theme={t}>
      <p style={{ fontSize:12, color:t.textMuted, marginBottom:12, marginTop:0 }}>
        Escolha como você deseja receber notificações.
      </p>

      {[
        { icon:"✉", label:"E-mail", key:"email", opts:["Todas as notificações","Apenas importantes","Nenhuma"] },
        { icon:"💬", label:"SMS",   key:"sms",   opts:["Todas as notificações","Apenas importantes","Nenhuma"] },
        { icon:"🔔", label:"Push",  key:"push",  opts:["Todas as notificações","Apenas importantes","Nenhuma"] },
      ].map((ch) => (
        <div key={ch.key} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"8px 0", borderBottom:`1px solid ${t.border}`,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>{ch.icon}</span>
            <span style={{ fontSize:13, color:t.text }}>{ch.label}</span>
          </div>
          <Select
            value={notifs[ch.key]}
            onChange={(v) => onChange(ch.key, v)}
            options={ch.opts}
            theme={t}
            compact
          />
        </div>
      ))}

      {[
        { label:"Lembretes de Eventos", key:"eventReminders" },
        { label:"Resumo Diário",        key:"dailySummary"   },
        { label:"Novas Reservas",       key:"newReservations"},
        { label:"Cancelamentos",        key:"cancellations"  },
      ].map((tog) => (
        <div key={tog.key} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"9px 0", borderBottom:`1px solid ${t.border}`,
        }}>
          <span style={{ fontSize:13, color:t.text }}>{tog.label}</span>
          <Toggle
            value={notifs[tog.key]}
            onChange={(v) => onChange(tog.key, v)}
            primary={t.primary} border={t.border}
          />
        </div>
      ))}
    </Card>
  );
}

// ─── PLANO ────────────────────────────────────────────────────────────────────
function PlanSection({ theme:t }) {
  return (
    <Card title="Plano Atual" theme={t}>
      <div style={{
        background:`${t.primary}11`,
        border:`1px solid ${t.primary}44`,
        borderRadius:10, padding:14, marginBottom:14,
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:20 }}>👑</span>
            <span style={{ fontSize:14, fontWeight:800, color:t.text }}>Plano Profissional</span>
          </div>
          <span style={{
            fontSize:10, fontWeight:700, color:"#22C55E",
            background:"#22C55E22", padding:"3px 8px", borderRadius:20,
          }}>Ativo</span>
        </div>
        <p style={{ fontSize:11, color:t.textMuted, margin:"0 0 10px" }}>
          Ideal para organizações que realizam eventos com frequência.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {PLAN_FEATURES.map((f) => (
            <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:t.text }}>
              <span style={{ color:"#22C55E", fontSize:14 }}>✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      <button style={{
        width:"100%", padding:"9px", borderRadius:8,
        border:`1px solid ${t.border}`, background:t.bg,
        color:t.text, fontWeight:700, fontSize:12,
        cursor:"pointer", fontFamily:"inherit",
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        marginBottom:12,
      }}>📅 Gerenciar Assinatura</button>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {[
          { label:"Próxima Cobrança", value:"24/06/2025" },
          { label:"Valor",            value:"R$ 199,90"  },
        ].map((row) => (
          <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
            <span style={{ color:t.textMuted }}>{row.label}</span>
            <span style={{ fontWeight:700, color:t.text }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button style={{
        background:"none", border:"none", color:t.primary,
        fontSize:12, fontWeight:600, cursor:"pointer",
        fontFamily:"inherit", marginTop:10, padding:0,
        textDecoration:"underline", textDecorationStyle:"dotted",
      }}>Ver detalhes da assinatura →</button>
    </Card>
  );
}

// ─── SEGURANÇA ────────────────────────────────────────────────────────────────
function SecuritySection({ theme:t }) {
  return (
    <Card title="Segurança" theme={t}>
      {/* 2FA */}
      <div style={{
        padding:"10px 12px", borderRadius:8,
        background:t.bg, border:`1px solid ${t.border}`,
        marginBottom:8,
      }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div style={{ display:"flex", gap:10 }}>
            <span style={{ fontSize:18, marginTop:2 }}>🛡</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:t.text }}>Autenticação de Dois Fatores</div>
              <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>
                Sua conta está protegida com 2FA.
              </div>
            </div>
          </div>
          <span style={{
            fontSize:10, fontWeight:700, color:"#22C55E",
            background:"#22C55E22", padding:"3px 8px", borderRadius:20,
            flexShrink:0,
          }}>Ativado</span>
        </div>
      </div>

      {/* Sessões ativas */}
      <div
        style={{
          padding:"10px 12px", borderRadius:8, cursor:"pointer",
          background:t.bg, border:`1px solid ${t.border}`,
          marginBottom:8, display:"flex", alignItems:"center",
          justifyContent:"space-between",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = t.surface2 || t.surface}
        onMouseLeave={(e) => e.currentTarget.style.background = t.bg}
      >
        <div style={{ display:"flex", gap:10 }}>
          <span style={{ fontSize:18 }}>🔑</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:t.text }}>Sessões Ativas</div>
            <div style={{ fontSize:11, color:t.textMuted }}>Gerencie seus dispositivos conectados.</div>
          </div>
        </div>
        <span style={{ color:t.textMuted, fontSize:14 }}>›</span>
      </div>

      {/* Logs */}
      <div
        style={{
          padding:"10px 12px", borderRadius:8, cursor:"pointer",
          background:t.bg, border:`1px solid ${t.border}`,
          marginBottom:12, display:"flex", alignItems:"center",
          justifyContent:"space-between",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = t.surface2 || t.surface}
        onMouseLeave={(e) => e.currentTarget.style.background = t.bg}
      >
        <div style={{ display:"flex", gap:10 }}>
          <span style={{ fontSize:18 }}>📋</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:t.text }}>Logs de Atividade</div>
            <div style={{ fontSize:11, color:t.textMuted }}>Veja os últimos acessos e ações.</div>
          </div>
        </div>
        <span style={{ color:t.textMuted, fontSize:14 }}>›</span>
      </div>

      {/* encerrar sessões */}
      <button style={{
        width:"100%", padding:"9px", borderRadius:8,
        border:"1px solid #EF444444", background:"#EF444411",
        color:"#EF4444", fontWeight:700, fontSize:12,
        cursor:"pointer", fontFamily:"inherit",
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      }}>⛔ Encerrar Todas as Sessões</button>
    </Card>
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
            Mantenha suas informações sempre atualizadas para uma melhor experiência.
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

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function Card({ title, children, theme:t }) {
  return (
    <div style={{
      background:t.surface, borderRadius:12, padding:"18px 20px",
      border:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", gap:12,
    }}>
      <div style={{ fontSize:15, fontWeight:800, color:t.text, marginBottom:2 }}>{title}</div>
      {children}
    </div>
  );
}

function SettingsField({ label, children, theme:t }) {
  return (
    <div>
      <div style={{ fontSize:11, color:t.textMuted, fontWeight:600, marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, theme:t }) {
  return (
    <input
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

function Select({ value, onChange, options, theme:t, compact }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: compact ? "auto" : "100%",
        padding:"8px 10px", borderRadius:8,
        border:`1px solid ${t.border}`, background:t.bg,
        color:t.text, fontSize:12, fontFamily:"inherit",
        cursor:"pointer", outline:"none",
      }}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ value, onChange, primary, border }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width:36, height:20, borderRadius:10,
        background: value ? primary : border,
        cursor:"pointer", position:"relative",
        transition:"background 0.2s", flexShrink:0,
      }}
    >
      <div style={{
        position:"absolute", top:3,
        left: value ? 18 : 3,
        width:14, height:14,
        borderRadius:"50%", background:"#fff",
        transition:"left 0.2s",
        boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}