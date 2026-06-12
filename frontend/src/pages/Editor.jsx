import Toolbar         from "../components/editor/Toolbar";
import ObjectLibrary   from "../components/editor/ObjectLibrary";
import Canvas          from "../components/editor/Canvas";
import PropertiesPanel from "../components/editor/PropertiesPanel";
import StatusBar       from "../components/editor/StatusBar";
import Minimap         from "../components/editor/Minimap";
import { useEditorStore } from "../store/editorStore";
import { THEME }          from "../constants/objects";

export default function Editor() {
  const { darkMode } = useEditorStore();
  const t = darkMode ? THEME.dark : THEME.light;

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100vh",
        width:         "100vw",
        background:    t.bg,
        color:         t.text,
        fontFamily:    "'Sora', system-ui, sans-serif",
        overflow:      "hidden",
        position:      "fixed",
        top:           0,
        left:          0,
      }}
    >
      {/* TOOLBAR FIXA NO TOPO */}
      <div style={{ flexShrink: 0, zIndex: 100 }}>
        <Toolbar />
      </div>

      {/* ÁREA PRINCIPAL */}
      <div
        style={{
          display:  "flex",
          flex:     1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* SIDEBAR ESQUERDA */}
        <div style={{ flexShrink: 0, zIndex: 50, display: "flex" }}>
          <ObjectLibrary />
        </div>

        {/* CANVAS + STATUSBAR + MINIMAP */}
        <div
          style={{
            flex:     1,
            position: "relative",
            display:  "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* canvas ocupa todo o espaço menos a statusbar */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Canvas />
            <Minimap />
          </div>

          {/* statusbar fica fixa na base */}
          <div style={{ flexShrink: 0 }}>
            <StatusBar />
          </div>
        </div>

        {/* SIDEBAR DIREITA */}
        <div style={{ flexShrink: 0, zIndex: 50 }}>
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}