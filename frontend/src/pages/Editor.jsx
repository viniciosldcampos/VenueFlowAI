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
        background:    t.bg,
        color:         t.text,
        fontFamily:    "'Sora', system-ui, sans-serif",
        overflow:      "hidden",
      }}
    >
      <Toolbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ObjectLibrary />

        {/* canvas + statusbar + minimapa agrupados */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          <Canvas />
          <StatusBar />
          <Minimap />
        </div>

        <PropertiesPanel />
      </div>
    </div>
  );
}