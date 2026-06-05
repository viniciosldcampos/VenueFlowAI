import Toolbar       from "../components/editor/Toolbar";
import ObjectLibrary from "../components/editor/ObjectLibrary";
import Canvas        from "../components/editor/Canvas";
import { useEditorStore } from "../store/editorStore";
import { THEME }          from "../constants/objects";

export default function Editor() {
  const { darkMode } = useEditorStore();
  const t = darkMode ? THEME.dark : THEME.light;

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        height:         "100vh",
        background:     t.bg,
        color:          t.text,
        fontFamily:     "'Sora', system-ui, sans-serif",
        overflow:       "hidden",
      }}
    >
      <Toolbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ObjectLibrary />
        <Canvas />
      </div>
    </div>
  );
}