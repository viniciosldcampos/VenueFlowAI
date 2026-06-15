import { useEditorStore } from "../../store/editorStore";
import { THEME } from "../../constants/objects";

export default function Toolbar({ roomName, saveStatus, onSave, onPublish }) {
  const {
    darkMode,
    toggleDarkMode,
    activeTool,
    setActiveTool,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    view3D,
    toggleView3D,
    undo,
    redo,
    history,
    redoStack,
  } = useEditorStore();

  const t = darkMode ? THEME.dark : THEME.light;

  return (
    <div style={{
      height:       52,
      display:      "flex",
      alignItems:   "center",
      background:   t.surface,
      borderBottom: `1px solid ${t.border}`,
      padding:      "0 16px",
      gap:          10,
      flexShrink:   0,
      zIndex:       100,
    }}>
      {/* ── LOGO ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:8 }}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:"linear-gradient(135deg, #705EBD, #A78BFA)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, fontWeight:900, color:"#fff",
        }}>V</div>
        <span style={{ fontWeight:700, fontSize:15, color:t.text }}>
          VenueFlow{" "}
          <span style={{
            color:t.primary, fontSize:11, fontWeight:600,
            background:`${t.primary}22`, padding:"1px 6px", borderRadius:4,
          }}>AI</span>
        </span>
      </div>

      <Divider color={t.border} />

      {/* ── VOLTAR + NOME DA SALA ── */}
      <button onClick={() => window.history.back()} style={ghostBtn(t)} title="Voltar">←</button>
      <span style={{ fontWeight:700, fontSize:14, color:t.text }}>
        {roomName || "Nova Sala"}
      </span>

      {/* status de salvamento */}
      {saveStatus === "saving" && (
        <span style={{
          fontSize:11, color:"#F59E0B", background:"#F59E0B22",
          padding:"2px 8px", borderRadius:20, fontWeight:600,
        }}>⏳ Salvando...</span>
      )}
      {saveStatus === "saved" && (
        <span style={{
          fontSize:11, color:"#22C55E", background:"#22C55E22",
          padding:"2px 8px", borderRadius:20, fontWeight:600,
        }}>✓ Salvo</span>
      )}
      {saveStatus === "error" && (
        <span style={{
          fontSize:11, color:"#EF4444", background:"#EF444422",
          padding:"2px 8px", borderRadius:20, fontWeight:600,
        }}>✕ Erro ao salvar</span>
      )}
      {saveStatus === "published" && (
        <span style={{
          fontSize:11, color:"#705EBD", background:"#705EBD22",
          padding:"2px 8px", borderRadius:20, fontWeight:600,
        }}>🚀 Publicada</span>
      )}

      <div style={{ flex:1 }} />

      {/* ── TOGGLE 2D / 3D ── */}
      <ToggleGroup
        options={["2D","3D"]}
        value={view3D ? "3D" : "2D"}
        onChange={() => toggleView3D()}
        theme={t}
      />

      <Divider color={t.border} />

      {/* ── FERRAMENTAS ── */}
      <div style={{
        display:"flex", background:t.bg || "#0F172A",
        borderRadius:8, padding:3, gap:2, border:`1px solid ${t.border}`,
      }}>
        {TOOLBAR_TOOLS.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            active={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
            theme={t}
          />
        ))}
      </div>

      <Divider color={t.border} />

      {/* ── DESFAZER / REFAZER ── */}
      <div style={{ display:"flex", gap:4 }}>
        <button
          onClick={undo}
          disabled={history.length === 0}
          title="Desfazer (Ctrl+Z)"
          style={{
            ...iconBtn(t),
            opacity: history.length === 0 ? 0.35 : 1,
            cursor:  history.length === 0 ? "default" : "pointer",
          }}
        >↩</button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Refazer (Ctrl+Y)"
          style={{
            ...iconBtn(t),
            opacity: redoStack.length === 0 ? 0.35 : 1,
            cursor:  redoStack.length === 0 ? "default" : "pointer",
          }}
        >↪</button>
      </div>

      <Divider color={t.border} />

      {/* ── ZOOM ── */}
      <div style={{
        display:"flex", alignItems:"center", gap:6,
        background:t.bg || "#0F172A", border:`1px solid ${t.border}`,
        borderRadius:8, padding:"4px 10px",
      }}>
        <button onClick={zoomOut} title="Diminuir zoom"
          style={{ background:"none", border:"none", color:t.text, cursor:"pointer", fontSize:18, lineHeight:1, padding:0 }}>
          −
        </button>
        <button onClick={resetZoom} title="Resetar zoom"
          style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:12, fontWeight:700, minWidth:44, textAlign:"center", padding:0 }}>
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} title="Aumentar zoom"
          style={{ background:"none", border:"none", color:t.text, cursor:"pointer", fontSize:18, lineHeight:1, padding:0 }}>
          +
        </button>
      </div>

      <Divider color={t.border} />

      {/* ── BOTÃO IA ── */}
      <button title="Gerar layout com IA" style={{
        padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
        background:"linear-gradient(135deg, #705EBD, #A78BFA)",
        color:"#fff", fontWeight:700, fontSize:12,
        display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
      }}>✨ Gerar com IA</button>

      {/* ── DARK MODE ── */}
      <button onClick={toggleDarkMode} title={darkMode ? "Modo claro" : "Modo escuro"}
        style={{ ...iconBtn(t), fontSize:18 }}>
        {darkMode ? "☀" : "🌙"}
      </button>

      {/* ── SALVAR ── */}
      <button
        onClick={onSave}
        disabled={saveStatus === "saving"}
        title="Salvar layout"
        style={{
          padding:"7px 14px", borderRadius:8,
          border:`1px solid ${t.border}`,
          background: t.surface,
          color: t.text,
          fontWeight:700, fontSize:13,
          cursor: saveStatus === "saving" ? "default" : "pointer",
          whiteSpace:"nowrap", opacity: saveStatus === "saving" ? 0.6 : 1,
        }}
      >💾 Salvar</button>

      {/* ── PUBLICAR ── */}
      <button
        onClick={onPublish}
        disabled={saveStatus === "saving" || saveStatus === "published"}
        style={{
          padding:"7px 18px", borderRadius:8, border:"none",
          cursor: saveStatus === "published" ? "default" : "pointer",
          background: saveStatus === "published"
            ? "#22C55E"
            : "linear-gradient(135deg, #705EBD, #A78BFA)",
          color:"#fff", fontWeight:700, fontSize:13, whiteSpace:"nowrap",
          opacity: saveStatus === "saving" ? 0.6 : 1,
        }}
      >
        {saveStatus === "published" ? "✓ Publicada" : "Publicar Sala ▾"}
      </button>
    </div>
  );
}

// ─── FERRAMENTAS ────────────────
const TOOLBAR_TOOLS = [
  { id:"select",    icon:"↖", label:"Selecionar (V)" },
  { id:"pan",       icon:"✋", label:"Mover tela (H)" },
  { id:"seat",      icon:"💺", label:"Assentos (S)"   },
  { id:"structure", icon:"🏛", label:"Estrutura (E)"  },
  { id:"event",     icon:"🎭", label:"Eventos (C)"    },
  { id:"erase",     icon:"✕", label:"Apagar (Del)"   },
];

// ─── COMPONENTES AUXILIARES ────────────────
function Divider({ color }) {
  return <div style={{ width:1, height:24, background:color, flexShrink:0 }} />;
}

function ToggleGroup({ options, value, onChange, theme:t }) {
  return (
    <div style={{
      display:"flex", background:t.bg || "#0F172A",
      borderRadius:8, padding:3, gap:2, border:`1px solid ${t.border}`,
    }}>
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding:"4px 14px", borderRadius:6, border:"none", cursor:"pointer",
          fontSize:13, fontWeight:700,
          background: value===opt ? t.primary : "transparent",
          color:      value===opt ? "#fff"     : t.textMuted,
          transition: "all 0.15s",
        }}>{opt}</button>
      ))}
    </div>
  );
}

function ToolButton({ tool, active, onClick, theme:t }) {
  return (
    <button title={tool.label} onClick={onClick} style={{
      width:32, height:32, borderRadius:6, border:"none", cursor:"pointer",
      background: active ? `${t.primary}33` : "transparent",
      color:      active ? t.primary        : t.textMuted,
      fontSize:   tool.icon.length > 1 ? 13 : 18,
      fontWeight: 700,
      display:"flex", alignItems:"center", justifyContent:"center",
      transition: "all 0.15s",
    }}>{tool.icon}</button>
  );
}

function ghostBtn(t) {
  return {
    background:"transparent", border:"none", color:t.textMuted,
    cursor:"pointer", fontSize:16, fontWeight:700,
    padding:"4px 8px", borderRadius:6,
  };
}

function iconBtn(t) {
  return {
    width:32, height:32, borderRadius:8,
    border:`1px solid ${t.border}`, background:"transparent",
    color:t.text, cursor:"pointer", fontSize:16,
    display:"flex", alignItems:"center", justifyContent:"center",
  };
}