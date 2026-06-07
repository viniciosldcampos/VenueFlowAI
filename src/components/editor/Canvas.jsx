import { useRef, useCallback, useEffect, useMemo } from "react";
import { useEditorStore } from "../../store/editorStore";
import {
  THEME,
  GRID_SIZE,
  STRUCTURE_TYPES,
  EVENT_TYPES,
} from "../../constants/objects";
import SeatIcon from "./SeatIcon";

export default function Canvas() {
  const {
    darkMode,
    objects,
    selectedId,
    activeTool,
    selectedSeatType,
    selectedStructureType,
    selectedEventType,
    zoom,
    pan,
    gridMode,
    view3D,
    setSelectedId,
    setPan,
    setZoom,
    addObject,
    removeObject,
    updateObject,
    clearSelection,
  } = useEditorStore();

  const t          = darkMode ? THEME.dark : THEME.light;
  const canvasRef  = useRef(null);
  const isPanning  = useRef(false);
  const panStart   = useRef({ x: 0, y: 0 });
  const draggingId = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const cursor = useMemo(() => {
  if (activeTool === "pan")    return "grab";
  if (activeTool === "erase")  return "crosshair";
  if (activeTool === "select") return "default";
  return "cell";
}, [activeTool]);

  // ── COORDENADAS DO CANVAS ─────────────
  const toCanvas = useCallback(
    (clientX, clientY) => {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top  - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // ── MOUSE DOWN ─────────────
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1 || e.altKey || activeTool === "pan") {
        isPanning.current = true;
        panStart.current  = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        e.preventDefault();
        return;
      }

      if (activeTool === "select" || activeTool === "erase") return;

      const { x, y } = toCanvas(e.clientX, e.clientY);
      const gx = Math.floor(x / GRID_SIZE);
      const gy = Math.floor(y / GRID_SIZE);

      if (activeTool === "seat") {
        const seats = objects.filter((o) => o.kind === "seat");
        addObject({
          id:       Date.now(),
          kind:     "seat",
          seatType: selectedSeatType,
          x:        gx,
          y:        gy,
          label:    generateLabel(seats.length + 1),
          sector:   "plateia",
          status:   "available",
        });
        return;
      }

      if (activeTool === "structure") {
        const cfg = STRUCTURE_TYPES[selectedStructureType];
        addObject({
          id:            Date.now(),
          kind:          "structure",
          structureType: selectedStructureType,
          x:             gx,
          y:             gy,
          w:             cfg.w,
          h:             cfg.h,
          label:         cfg.label.toUpperCase(),
        });
        return;
      }

      if (activeTool === "event") {
        const cfg = EVENT_TYPES[selectedEventType];
        addObject({
          id:        Date.now(),
          kind:      "event",
          eventType: selectedEventType,
          x:         gx,
          y:         gy,
          w:         cfg.w,
          h:         cfg.h,
          label:     cfg.label.toUpperCase(),
        });
      }
    },
    [
      activeTool, pan, objects,
      selectedSeatType, selectedStructureType, selectedEventType,
      toCanvas, addObject,
    ]
  );

  // ── MOUSE MOVE ─────────────
  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning.current) {
        setPan({
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        });
        return;
      }

      if (draggingId.current) {
        const { x, y } = toCanvas(e.clientX, e.clientY);
        const gx = Math.round((x - dragOffset.current.x) / GRID_SIZE);
        const gy = Math.round((y - dragOffset.current.y) / GRID_SIZE);
        updateObject(draggingId.current, { x: gx, y: gy });
      }
    },
    [setPan, toCanvas, updateObject]
  );

  // ── MOUSE UP ─────────────
  const handleMouseUp = useCallback(() => {
    isPanning.current  = false;
    draggingId.current = null;
  }, []);

  // ── SCROLL: ZOOM ─────────────
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(useEditorStore.getState().zoom * delta);
    },
    [setZoom]
  );

  // ── CLIQUE EM OBJETO ─────────────
  const handleObjectClick = useCallback(
    (e, obj) => {
      e.stopPropagation();
      if (activeTool === "erase") {
        removeObject(obj.id);
        return;
      }
      if (activeTool === "select") {
        setSelectedId(obj.id);
      }
    },
    [activeTool, removeObject, setSelectedId]
  );

  // ── INÍCIO DO DRAG ─────────────
  const handleObjectMouseDown = useCallback(
    (e, obj) => {
      if (activeTool !== "select") return;
      e.stopPropagation();
      const { x, y } = toCanvas(e.clientX, e.clientY);
      draggingId.current = obj.id;
      dragOffset.current = {
        x: x - obj.x * GRID_SIZE,
        y: y - obj.y * GRID_SIZE,
      };
      setSelectedId(obj.id);
    },
    [activeTool, toCanvas, setSelectedId]
  );

  // ── ATALHOS DE TECLADO ─────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
      if (e.key === "Delete" && selectedId) {
        removeObject(selectedId);
      }
      if (e.key === "Escape") {
        clearSelection();
      }

      const toolKeys = { v: "select", h: "pan", s: "seat", e: "structure", c: "event" };
      if (toolKeys[e.key] && !e.ctrlKey && !e.metaKey) {
        useEditorStore.getState().setActiveTool(toolKeys[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeObject, clearSelection]);

  // ── WHEEL LISTENER ─────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <div
      ref={canvasRef}
      style={{
        flex:       1,
        position:   "relative",
        overflow:   "hidden",
        background: t.canvas,
        cursor,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => clearSelection()}
    >
      <GridBackground zoom={zoom} pan={pan} mode={gridMode} color={t.grid} />

      <div
        style={{
          position:        "absolute",
          transform:       `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {!view3D &&
          objects.map((obj) => {
            const isSelected = selectedId === obj.id;

            if (obj.kind === "seat") {
              return (
                <SeatObject
                  key={obj.id}
                  obj={obj}
                  isSelected={isSelected}
                  zoom={zoom}
                  activeTool={activeTool}
                  onClick={handleObjectClick}
                  onMouseDown={handleObjectMouseDown}
                />
              );
            }

            if (obj.kind === "structure" || obj.kind === "event") {
              return (
                <BlockObject
                  key={obj.id}
                  obj={obj}
                  isSelected={isSelected}
                  activeTool={activeTool}
                  onClick={handleObjectClick}
                  onMouseDown={handleObjectMouseDown}
                />
              );
            }

            return null;
          })}
      </div>

      {view3D && <View3DPlaceholder />}
    </div>
  );
}

// ─── OBJETO: ASSENTO ─────────────
function SeatObject({ obj, isSelected, zoom, activeTool, onClick, onMouseDown }) {
  return (
    <div
      onClick={(e) => onClick(e, obj)}
      onMouseDown={(e) => onMouseDown(e, obj)}
      style={{
        position:       "absolute",
        left:           obj.x * GRID_SIZE,
        top:            obj.y * GRID_SIZE,
        width:          GRID_SIZE - 2,
        height:         GRID_SIZE - 2,
        cursor:         activeTool === "select" ? "move" : "pointer",
        zIndex:         isSelected ? 10 : 1,
        filter:         isSelected ? "drop-shadow(0 0 6px rgba(112,94,189,0.8))" : "none",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        transition:     "filter 0.15s",
      }}
    >
      <SeatIcon
        type={obj.seatType}
        size={GRID_SIZE - 4}
        selected={isSelected}
        status={obj.status}
      />
      {zoom > 1.8 && (
        <div
          style={{
            position:      "absolute",
            bottom:        -11,
            left:          "50%",
            transform:     "translateX(-50%)",
            fontSize:      8,
            color:         "#94A3B8",
            whiteSpace:    "nowrap",
            fontWeight:    600,
            pointerEvents: "none",
          }}
        >
          {obj.label}
        </div>
      )}
    </div>
  );
}

// ─── OBJETO: ESTRUTURA / EVENTO ─────────────
function BlockObject({ obj, isSelected, activeTool, onClick, onMouseDown }) {
  const cfg =
    obj.kind === "structure"
      ? STRUCTURE_TYPES[obj.structureType]
      : EVENT_TYPES[obj.eventType];

  const col   = cfg?.color || "#475569";
  const w     = (obj.w || 2) * GRID_SIZE;
  const h     = (obj.h || 1) * GRID_SIZE;
  const emoji = cfg?.emoji  || "□";

  return (
    <div
      onClick={(e) => onClick(e, obj)}
      onMouseDown={(e) => onMouseDown(e, obj)}
      style={{
        position:       "absolute",
        left:           obj.x * GRID_SIZE,
        top:            obj.y * GRID_SIZE,
        width:          w - 2,
        height:         h - 2,
        background:     `${col}18`,
        border:         `2px solid ${isSelected ? "#705EBD" : col + "66"}`,
        borderRadius:   8,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         activeTool === "select" ? "move" : "pointer",
        zIndex:         isSelected ? 10 : 1,
        boxShadow:      isSelected ? "0 0 0 2px #705EBD" : "none",
        transition:     "box-shadow 0.15s",
        gap:            4,
        userSelect:     "none",
      }}
    >
      <span style={{ fontSize: Math.max(10, Math.min(22, h * 0.28)) }}>
        {emoji}
      </span>
      <span
        style={{
          fontSize:      Math.max(8, Math.min(12, h * 0.18)),
          color:         col,
          fontWeight:    800,
          letterSpacing: 1,
          textTransform: "uppercase",
          textAlign:     "center",
          padding:       "0 4px",
        }}
      >
        {obj.label}
      </span>
    </div>
  );
}

// ─── GRID DE FUNDO ─────────────
function GridBackground({ zoom, pan, mode, color }) {
  if (mode === "none") return null;

  const cellSize = GRID_SIZE * zoom;
  const offsetX  = pan.x % cellSize;
  const offsetY  = pan.y % cellSize;

  if (mode === "dots") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <pattern id="dots" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse" x={offsetX} y={offsetY}>
            <circle cx={cellSize / 2} cy={cellSize / 2} r="1" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    );
  }

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <pattern id="lines" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse" x={offsetX} y={offsetY}>
          <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke={color} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lines)" />
    </svg>
  );
}

// ─── PLACEHOLDER 3D ─────────────
function View3DPlaceholder() {
  return (
    <div
      style={{
        position:       "absolute",
        inset:          0,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            12,
        background:     "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
      }}
    >
      <div style={{ fontSize: 64 }}>🎭</div>
      <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 18 }}>
        Visualização 3D
      </div>
      <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", maxWidth: 300, lineHeight: 1.6 }}>
        A visualização 3D será integrada com React Three Fiber na próxima fase do projeto.
      </div>
    </div>
  );
}

// ─── HELPER ─────────────
function generateLabel(index) {
  const row = String.fromCharCode(65 + Math.floor((index - 1) / 12));
  const col = ((index - 1) % 12) + 1;
  return `${row}${col}`;
}