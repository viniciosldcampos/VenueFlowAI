import Toolbar from "../components/editor/Toolbar";
import ObjectLibrary from "../components/editor/ObjectLibrary";
import { useEditorStore } from "../store/editorStore";
import { THEME } from "../constants/objects";
import SeatIcon from "../components/editor/SeatIcon";



export default function Editor() {
  const { darkMode } = useEditorStore();
  const t = darkMode ? THEME.dark : THEME.light;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "'Sora', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* TOOLBAR NO TOPO */}
      <Toolbar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* BIBLIOTECA NA LATERAL */}
        <ObjectLibrary />

        {/* dentro do div do canvas temporário:*/}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <span style={{ color: t.textMuted, fontSize: 13, fontWeight: 700 }}> Preview dos assentos
          </span>

          {/* linha de tipos */}
          <div style={{ display: "flex", gap: 12 }}>
            {["standard","vip","premium","pcd","dbox","guidedog","puff","banqueta"].map((type) => (
              <div key={type} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <SeatIcon type={type} size={32} status="available" />
                <span style={{ fontSize: 9, color: t.textMuted }}>{type}</span>
              </div>
            ))}
          </div>

          {/* linha de status */}
          <div style={{ display: "flex", gap: 12 }}>
            {["available","occupied","reserved","blocked","selected"].map((status) => (
              <div key={status} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <SeatIcon type="standard" size={32} status={status} selected={status === "selected"} />
                <span style={{ fontSize: 9, color: t.textMuted }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}