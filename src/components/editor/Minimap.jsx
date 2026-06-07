import { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { THEME, SEAT_TYPES, GRID_SIZE } from "../../constants/objects";

export default function Minimap() {
  const {
    darkMode,
    objects,
    pan,
    zoom,
  } = useEditorStore();

  const t          = darkMode ? THEME.dark : THEME.light;
  const [visible, setVisible] = useState(true);

  // escala do minimapa
  const SCALE_X = 3.5;
  const SCALE_Y = 2.5;
  const MAP_W   = 150;
  const MAP_H   = 90;

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        title="Mostrar minimapa"
        style={{
          position:     "absolute",
          bottom:       48,
          right:        16,
          width:        32,
          height:       32,
          borderRadius: 8,
          border:       `1px solid ${t.border}`,
          background:   t.surface,
          color:        t.textMuted,
          cursor:       "pointer",
          fontSize:     14,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
        }}
      >
        🗺
      </button>
    );
  }

  return (
    <div
      style={{
        position:     "absolute",
        bottom:       48,
        right:        16,
        width:        MAP_W,
        background:   t.surface,
        border:       `1px solid ${t.border}`,
        borderRadius: 8,
        overflow:     "hidden",
        zIndex:       40,
        boxShadow:    "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      {/* cabeçalho */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "4px 8px",
          borderBottom:   `1px solid ${t.border}`,
        }}
      >
        <span
          style={{
            fontSize:      9,
            fontWeight:    700,
            color:         t.textMuted,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Minimapa
        </span>
        <button
          onClick={() => setVisible(false)}
          title="Fechar minimapa"
          style={{
            background: "none",
            border:     "none",
            color:      t.textMuted,
            cursor:     "pointer",
            fontSize:   10,
            lineHeight: 1,
            padding:    2,
          }}
        >
          ✕
        </button>
      </div>

      {/* mapa SVG */}
      <svg
        width={MAP_W}
        height={MAP_H}
        style={{ display: "block" }}
      >
        {/* fundo */}
        <rect width={MAP_W} height={MAP_H} fill={t.canvas} />

        {/* objetos: estruturas e eventos */}
        {objects
          .filter((o) => o.kind !== "seat")
          .map((o) => (
            <rect
              key={o.id}
              x={o.x * SCALE_X + 4}
              y={o.y * SCALE_Y + 4}
              width={Math.max(4, (o.w || 1) * GRID_SIZE * SCALE_X / GRID_SIZE)}
              height={Math.max(4, (o.h || 1) * GRID_SIZE * SCALE_Y / GRID_SIZE)}
              rx={1}
              fill="#475569"
              opacity={0.5}
            />
          ))}

        {/* objetos: assentos */}
        {objects
          .filter((o) => o.kind === "seat")
          .map((o) => {
            const col = SEAT_TYPES[o.seatType]?.color || "#705EBD";
            return (
              <rect
                key={o.id}
                x={o.x * SCALE_X + 4}
                y={o.y * SCALE_Y + 4}
                width={3}
                height={3}
                rx={0.5}
                fill={col}
                opacity={0.85}
              />
            );
          })}

        {/* indicador do viewport atual */}
        <rect
          x={Math.max(0, (-pan.x / zoom) * SCALE_X / GRID_SIZE * GRID_SIZE + 4)}
          y={Math.max(0, (-pan.y / zoom) * SCALE_Y / GRID_SIZE * GRID_SIZE + 4)}
          width={Math.min(MAP_W - 8, (window.innerWidth / zoom) * SCALE_X / GRID_SIZE)}
          height={Math.min(MAP_H - 8, (window.innerHeight / zoom) * SCALE_Y / GRID_SIZE)}
          rx={2}
          fill="none"
          stroke="#705EBD"
          strokeWidth={1}
          opacity={0.6}
        />
      </svg>

      {/* legenda */}
      <div
        style={{
          display:    "flex",
          gap:        8,
          padding:    "4px 8px",
          borderTop:  `1px solid ${t.border}`,
          flexWrap:   "wrap",
        }}
      >
        {[
          { color: "#4A90D9", label: "Padrão" },
          { color: "#705EBD", label: "VIP"    },
          { color: "#22C55E", label: "PCD"    },
          { color: "#F59E0B", label: "Premium" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 3 }}
          >
            <div
              style={{
                width:        6,
                height:       6,
                borderRadius: "50%",
                background:   item.color,
              }}
            />
            <span style={{ fontSize: 8, color: t.textMuted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}