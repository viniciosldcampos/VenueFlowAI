import { useRef, useCallback, useEffect, useMemo } from "react";
import { useEditorStore } from "../../store/editorStore";
import {
  THEME,
  GRID_SIZE,
  STRUCTURE_TYPES,
  EVENT_TYPES,
} from "../../constants/objects";
import SeatIcon from "./SeatIcon";
import { OBJECT_ICONS } from "./objectIconsMap";

export default function Canvas() {
  const {
    darkMode,
    objects,
    selectedId,
    activeTool,
    selectedSeatType,
    selectedStructureType,
    selectedEventType,
    objectConfig,
    zoom,
    pan,
    gridMode,
    view3D,
    setSelectedId,
    setPan,
    setZoom,
    setActiveTool,
    addObject,
    removeObject,
    updateObject,
    clearSelection,
  } = useEditorStore();

  const t            = darkMode ? THEME.dark : THEME.light;
  const canvasRef    = useRef(null);
  const isPanning    = useRef(false);
  const panStart     = useRef({ x: 0, y: 0 });
  const draggingId   = useRef(null);
  const dragOffset   = useRef({ x: 0, y: 0 });
  const rotatingId   = useRef(null);
  const rotateCenter = useRef({ x: 0, y: 0 });

  const cursor = useMemo(() => {
    if (activeTool === "pan")   return "grab";
    if (activeTool === "erase") return "crosshair";
    return "default";
  }, [activeTool]);

  // ── metros para pixels ─────────────
  // 1 metro = GRID_SIZE pixels, suporta decimais
  const metersToPx = (meters) => meters * GRID_SIZE;

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

  // ── MOUSE DOWN NO CANVAS ─────────────
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1 || e.altKey || activeTool === "pan") {
        isPanning.current = true;
        panStart.current  = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        e.preventDefault();
        return;
      }

      if (activeTool === "erase" || activeTool === "select") return;

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
          rotation: 0,
          label:    generateLabel(seats.length + 1),
          sector:   "plateia",
          status:   "available",
        });
        setActiveTool("select");
        return;
      }

      if (activeTool === "structure") {
        const cfg = STRUCTURE_TYPES[selectedStructureType];
        const w   = Math.max(0.1, objectConfig.width);
        const h   = Math.max(0.1, objectConfig.height);
        for (let i = 0; i < objectConfig.quantity; i++) {
          addObject({
            id:            Date.now() + i,
            kind:          "structure",
            structureType: selectedStructureType,
            x:             gx,
            y:             gy,
            w,
            h,
            rotation:      0,
            label:         cfg.label.toUpperCase(),
          });
        }
        setActiveTool("select");
        return;
      }

      if (activeTool === "event") {
        const cfg = EVENT_TYPES[selectedEventType];
        const w   = Math.max(0.1, objectConfig.width);
        const h   = Math.max(0.1, objectConfig.height);
        for (let i = 0; i < objectConfig.quantity; i++) {
          addObject({
            id:        Date.now() + i,
            kind:      "event",
            eventType: selectedEventType,
            x:         gx,
            y:         gy,
            w,
            h,
            rotation:  0,
            label:     cfg.label.toUpperCase(),
          });
        }
        setActiveTool("select");
      }
    },
    [
      activeTool, pan, objects, objectConfig,
      selectedSeatType, selectedStructureType, selectedEventType,
      toCanvas, addObject, setActiveTool,
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

      if (rotatingId.current !== null) {
        const { x, y } = toCanvas(e.clientX, e.clientY);
        const cx    = rotateCenter.current.x;
        const cy    = rotateCenter.current.y;
        const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
        updateObject(rotatingId.current, { rotation: angle });
        return;
      }

      if (draggingId.current !== null) {
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
    rotatingId.current = null;
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
      setSelectedId(obj.id);
    },
    [activeTool, removeObject, setSelectedId]
  );

  // ── INÍCIO DO DRAG ─────────────
  const handleObjectMouseDown = useCallback(
    (e, obj) => {
      if (activeTool === "erase") return;
      e.stopPropagation();
      e.preventDefault();
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

  // ── INÍCIO DA ROTAÇÃO ─────────────
  const handleRotateMouseDown = useCallback(
    (e, obj) => {
      e.stopPropagation();
      e.preventDefault();
      const wPx = metersToPx(obj.w || 1);
      const hPx = metersToPx(obj.h || 1);
      rotatingId.current   = obj.id;
      rotateCenter.current = {
        x: obj.x * GRID_SIZE + wPx / 2,
        y: obj.y * GRID_SIZE + hPx / 2,
      };
    },
    []
  );

// ── ATALHOS DE TECLADO ─────────────
useEffect(() => {
  const onKey = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    // desfazer / refazer
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      useEditorStore.getState().undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      useEditorStore.getState().redo();
      return;
    }

    // duplicar com Ctrl+D
    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      if (selectedId) {
        useEditorStore.getState().duplicateObject(selectedId);
      }
      return;
    }

    // mover com setas (1px por clique)
    if (selectedId && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const { objects } = useEditorStore.getState();
      const obj = objects.find((o) => o.id === selectedId);
      if (!obj) return;

      // 1px = 1/GRID_SIZE de célula
      const step = e.shiftKey ? 1 : 1 / GRID_SIZE;

      const delta = {
        ArrowUp:    { x: 0,     y: -step },
        ArrowDown:  { x: 0,     y:  step },
        ArrowLeft:  { x: -step, y: 0     },
        ArrowRight: { x:  step, y: 0     },
      }[e.key];

      updateObject(selectedId, {
        x: obj.x + delta.x,
        y: obj.y + delta.y,
      });
      return;
    }

    // deletar
    if (e.key === "Delete" && selectedId) {
      removeObject(selectedId);
      return;
    }

    // escapar seleção
    if (e.key === "Escape") {
      clearSelection();
      return;
    }

    // atalhos de ferramenta
    const toolKeys = { v:"select", h:"pan", s:"seat", e:"structure", c:"event" };
    if (toolKeys[e.key] && !e.ctrlKey && !e.metaKey) {
      useEditorStore.getState().setActiveTool(toolKeys[e.key]);
    }
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [selectedId, removeObject, clearSelection, updateObject]);

  // ── WHEEL LISTENER ─────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ── MOUSE UP GLOBAL ─────────────
  useEffect(() => {
    const onUp = () => {
      isPanning.current  = false;
      draggingId.current = null;
      rotatingId.current = null;
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        flex:       1,
        position:   "relative",
        overflow:   "hidden",
        background: t.canvas || (darkMode ? "#141E2E" : "#E8EEF7"),
        cursor,
        width:      "100%",
        height:     "100%",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => clearSelection()}
    >
      <GridBackground zoom={zoom} pan={pan} mode={gridMode} color={t.grid || "#1E2D40"} />

      {activeTool !== "select" && activeTool !== "pan" && (
        <div style={{
          position:"absolute", top:12, left:"50%", transform:"translateX(-50%)",
          background:"#705EBD", color:"#fff", padding:"6px 14px",
          borderRadius:20, fontSize:12, fontWeight:700, zIndex:100,
          pointerEvents:"none",
        }}>
          {activeTool === "seat"      && "💺 Clique para adicionar assento"}
          {activeTool === "structure" && "🏛 Clique para adicionar estrutura"}
          {activeTool === "event"     && "🎭 Clique para adicionar elemento"}
          {activeTool === "erase"     && "✕ Clique em um objeto para apagar"}
        </div>
      )}

      <div style={{
        position:        "absolute",
        transform:       `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: "0 0",
        width:           "10000px",
        height:          "10000px",
      }}>
        {!view3D && objects.map((obj) => {
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
                onRotateMouseDown={handleRotateMouseDown}
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
                onRotateMouseDown={handleRotateMouseDown}
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
function SeatObject({ obj, isSelected, zoom, activeTool, onClick, onMouseDown, onRotateMouseDown }) {
  const rotation = obj.rotation || 0;
  const size     = GRID_SIZE - 2;

  return (
    <div style={{
      position:        "absolute",
      left:            obj.x * GRID_SIZE,
      top:             obj.y * GRID_SIZE,
      width:           size,
      height:          size,
      transform:       `rotate(${rotation}deg)`,
      transformOrigin: "center center",
      zIndex:          isSelected ? 10 : 1,
    }}>
      {/* alça de rotação */}
      {isSelected && (
        <>
          <div style={{
            position:"absolute", top:-20, left:"50%",
            transform:"translateX(-50%)",
            width:1, height:18, background:"#705EBD", pointerEvents:"none",
          }} />
          <div
            onMouseDown={(e) => onRotateMouseDown(e, { ...obj, w:1, h:1 })}
            style={{
              position:"absolute", top:-32, left:"50%",
              transform:"translateX(-50%)",
              width:14, height:14, borderRadius:"50%",
              background:"#705EBD", border:"2px solid #fff",
              cursor:"grab", zIndex:20,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, color:"#fff",
            }}
          >↻</div>
        </>
      )}

      <div
        onClick={(e) => onClick(e, obj)}
        onMouseDown={(e) => onMouseDown(e, obj)}
        style={{
          width:"100%", height:"100%",
          cursor: activeTool === "erase" ? "crosshair" : "grab",
          filter: isSelected ? "drop-shadow(0 0 6px rgba(112,94,189,0.8))" : "none",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"filter 0.15s",
        }}
      >
        {/* ícone preenchendo 100% do tamanho */}
        <SeatIcon
          type={obj.seatType}
          size={size}
          selected={isSelected}
          status={obj.status}
        />
        {zoom > 1.8 && (
          <div style={{
            position:"absolute", bottom:-11, left:"50%",
            transform:"translateX(-50%)",
            fontSize:8, color:"#94A3B8",
            whiteSpace:"nowrap", fontWeight:600, pointerEvents:"none",
          }}>{obj.label}</div>
        )}
      </div>
    </div>
  );
}

// ─── OBJETO: ESTRUTURA / EVENTO ─────────────
function BlockObject({ obj, isSelected, activeTool, onClick, onMouseDown, onRotateMouseDown }) {
  const cfg =
    obj.kind === "structure"
      ? STRUCTURE_TYPES[obj.structureType]
      : EVENT_TYPES[obj.eventType];

  const typeKey  = obj.kind === "structure" ? obj.structureType : obj.eventType;
  const col      = cfg?.color || "#475569";
  const emoji    = cfg?.emoji || "□";
  const rotation = obj.rotation || 0;
  const wPx      = (obj.w || 2) * GRID_SIZE;
  const hPx      = (obj.h || 1) * GRID_SIZE;

  const IconComponent = OBJECT_ICONS[typeKey];

  return (
    <div style={{
      position:        "absolute",
      left:            obj.x * GRID_SIZE,
      top:             obj.y * GRID_SIZE,
      width:           wPx,
      height:          hPx,
      transform:       `rotate(${rotation}deg)`,
      transformOrigin: "center center",
      zIndex:          isSelected ? 10 : 1,
    }}>
      {/* alça de rotação */}
      {isSelected && (
        <>
          <div style={{
            position:"absolute", top:-22, left:"50%",
            transform:"translateX(-50%)",
            width:1, height:20, background:"#705EBD", pointerEvents:"none",
          }} />
          <div
            onMouseDown={(e) => onRotateMouseDown(e, obj)}
            style={{
              position:"absolute", top:-34, left:"50%",
              transform:"translateX(-50%)",
              width:16, height:16, borderRadius:"50%",
              background:"#705EBD", border:"2px solid #fff",
              cursor:"grab", zIndex:20,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:"#fff",
            }}
          >↻</div>
        </>
      )}

      <div
        onClick={(e) => onClick(e, obj)}
        onMouseDown={(e) => onMouseDown(e, obj)}
        style={{
          width:          "100%",
          height:         "100%",
          border:         `2px solid ${isSelected ? "#705EBD" : col + "88"}`,
          borderRadius:   6,
          cursor:         activeTool === "erase" ? "crosshair" : "grab",
          boxShadow:      isSelected ? "0 0 0 2px #705EBD" : "none",
          transition:     "box-shadow 0.15s",
          userSelect:     "none",
          overflow:       "hidden",
          position:       "relative",
          background:     "#0F1929",
        }}
      >
        {/* ilustração SVG blueprint preenchendo 100% */}
        {IconComponent ? (
          <div style={{
            position:  "absolute",
            inset:     0,
            display:   "flex",
            alignItems:"center",
            justifyContent:"center",
          }}>
            <IconComponent color={col} />
          </div>
        ) : (
          /* fallback: emoji centralizado */
          <div style={{
            position:       "absolute",
            inset:          0,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       Math.min(wPx, hPx) * 0.55,
            lineHeight:     1,
          }}>
            {emoji}
          </div>
        )}

        {/* emoji overlay pequeno no canto */}
        <div style={{
          position:   "absolute",
          top:        4,
          left:       4,
          fontSize:   Math.max(10, Math.min(16, Math.min(wPx, hPx) * 0.2)),
          lineHeight: 1,
          pointerEvents:"none",
          userSelect: "none",
          filter:     "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
        }}>
          {emoji}
        </div>

        {/* label na parte inferior */}
        {hPx > 30 && (
          <div style={{
            position:       "absolute",
            bottom:         0,
            left:           0,
            right:          0,
            padding:        "2px 4px",
            background:     "rgba(0,0,0,0.65)",
            fontSize:       Math.max(7, Math.min(11, hPx * 0.12)),
            color:          col,
            fontWeight:     800,
            letterSpacing:  0.5,
            textTransform:  "uppercase",
            textAlign:      "center",
            pointerEvents:  "none",
            userSelect:     "none",
            overflow:       "hidden",
            textOverflow:   "ellipsis",
            whiteSpace:     "nowrap",
          }}>
            {obj.label}
          </div>
        )}

        {/* dimensões quando selecionado */}
        {isSelected && (
          <div style={{
            position:     "absolute",
            top:          3,
            right:        4,
            fontSize:     9,
            color:        "#fff",
            fontWeight:   700,
            background:   "rgba(0,0,0,0.6)",
            padding:      "1px 4px",
            borderRadius: 3,
            pointerEvents:"none",
          }}>
            {obj.w}m×{obj.h}m
          </div>
        )}
      </div>
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
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
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
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
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
    <div style={{
      position:"absolute", inset:0,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      gap:12,
      background:"linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
    }}>
      <div style={{ fontSize:64 }}>🎭</div>
      <div style={{ color:"#a78bfa", fontWeight:700, fontSize:18 }}>Visualização 3D</div>
      <div style={{ color:"#64748b", fontSize:13, textAlign:"center", maxWidth:300, lineHeight:1.6 }}>
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