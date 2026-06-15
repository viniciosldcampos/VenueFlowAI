import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate }   from "react-router-dom";
import Toolbar         from "../components/editor/Toolbar";
import ObjectLibrary   from "../components/editor/ObjectLibrary";
import Canvas          from "../components/editor/Canvas";
import PropertiesPanel from "../components/editor/PropertiesPanel";
import StatusBar       from "../components/editor/StatusBar";
import Minimap         from "../components/editor/Minimap";
import { useEditorStore } from "../store/editorStore";
import { THEME }          from "../constants/objects";
import roomService         from "../services/room.service";

export default function Editor() {
  const { darkMode }    = useEditorStore();
  const t               = darkMode ? THEME.dark : THEME.light;
  const { id }          = useParams();

  const [room,       setRoom]       = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");

  // ── carregar sala ao abrir ──
  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;
      try {
        const data = await roomService.getById(id);
        setRoom(data.room);
        // se tiver layout salvo, carrega no canvas
        if (data.room.layout) {
          useEditorStore.getState().setObjects(data.room.layout.objects || []);
          if (data.room.layout.roomInfo) {
            useEditorStore.getState().updateRoomInfo(data.room.layout.roomInfo);
          }
        }
        // atualiza nome da sala no store
        useEditorStore.getState().updateRoomInfo({ name: data.room.name });
      } catch (err) {
        console.error("Erro ao carregar sala:", err);
      }
    };
    loadRoom();
  }, [id]);

// ── salvar layout ──
const handleSave = useCallback(async () => {
  if (!id) return;
  try {
    setSaveStatus("saving");
    const { objects, roomInfo } = useEditorStore.getState();
    await roomService.saveLayout(id, { objects, roomInfo });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
  } catch (err) {
    console.error("Erro ao salvar:", err);
    setSaveStatus("error");
    setTimeout(() => setSaveStatus("idle"), 3000);
  }
}, [id]);

// ── publicar sala ──
const navigate = useNavigate();

const handlePublish = useCallback(async () => {
  if (!id) return;
  try {
    setSaveStatus("saving");
    const { objects, roomInfo } = useEditorStore.getState();
    await roomService.saveLayout(id, { objects, roomInfo });
    await roomService.update(id, { active: true });
    setSaveStatus("published");
    // redireciona para a tela de salas após publicar
    setTimeout(() => navigate("/rooms"), 1000);
  } catch (err) {
    console.error("Erro ao publicar:", err);
    setSaveStatus("error");
    setTimeout(() => setSaveStatus("idle"), 3000);
  }
}, [id, navigate]);

// ── atalho Ctrl+S ──
useEffect(() => {
  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [handleSave]);

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "100vh",
      width:         "100vw",
      background:    t.bg,
      color:         t.text,
      fontFamily:    "'Sora', system-ui, sans-serif",
      overflow:      "hidden",
      position:      "fixed",
      top: 0, left: 0,
    }}>
      {/* TOOLBAR */}
      <div style={{ flexShrink:0, zIndex:100 }}>
        <Toolbar
          roomName={room?.name}
          saveStatus={saveStatus}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

        {/* SIDEBAR ESQUERDA */}
        <div style={{ flexShrink:0, zIndex:50, display:"flex" }}>
          <ObjectLibrary />
        </div>

        {/* CANVAS + STATUSBAR + MINIMAP */}
        <div style={{
          flex:1, position:"relative",
          display:"flex", flexDirection:"column",
          overflow:"hidden", minWidth:0,
        }}>
          <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
            <Canvas />
            <Minimap />
          </div>
          <div style={{ flexShrink:0 }}>
            <StatusBar />
          </div>
        </div>

        {/* SIDEBAR DIREITA */}
        <div style={{ flexShrink:0, zIndex:50 }}>
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}