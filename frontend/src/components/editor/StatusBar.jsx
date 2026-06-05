import { useEditorStore } from "../../store/editorStore";
import { THEME, SEAT_TYPES } from "../../constants/objects";

export default function StatusBar() {
  const {
    darkMode,
    zoom,
    objects,
    gridMode,
    snapEnabled,
    setGridMode,
    toggleSnap,
    zoomIn,
    zoomOut,
    resetZoom,
    getCapacity,
  } = useEditorStore();

  const t        = darkMode ? THEME.dark : THEME.light;
  const capacity = getCapacity();

  return (
    <div
      style={{
        height:     38,
        background: t.surface,
        borderTop:  `1px solid ${t.border}`,
        display:    "flex",
        alignItems: "center",
        padding:    "0 14px",
        gap:        16,
        fontSize:   12,
        flexShrink: 0,
        zIndex:     50,
      }}
    >
      {/* ── CAPACIDADE TOTAL ── */}
      <StatusItem label="Total" value={capacity.total || 0} theme={t} />

      <Divider theme={t} />

      {/* ── BREAKDOWN POR TIPO ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {Object.entries(SEAT_TYPES).map(([key, val]) =>
          capacity[key] ? (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <div
                style={{
                  width:        7,
                  height:       7,
                  borderRadius: "50%",
                  background:   val.color,
                  flexShrink:   0,
                }}
              />
              <span style={{ color: t.textMuted }}>
                {val.label}:{" "}
                <strong style={{ color: t.text }}>{capacity[key]}</strong>
              </span>
            </div>
          ) : null
        )}
      </div>

      <Divider theme={t} />

      {/* ── OBJETOS NO CANVAS ── */}
      <StatusItem
        label="Objetos"
        value={objects.length}
        theme={t}
      />

      {/* ── ESPAÇO CENTRAL ── */}
      <div style={{ flex: 1 }} />

      {/* ── TOGGLE GRADE ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: t.textMuted, fontSize: 11 }}>Grade:</span>
        <div
          style={{
            display:      "flex",
            background:   t.bg,
            borderRadius: 6,
            padding:      2,
            gap:          2,
            border:       `1px solid ${t.border}`,
          }}
        >
          {[
            { id: "none",  label: "Nenhum" },
            { id: "dots",  label: "Pontos" },
            { id: "lines", label: "Linhas" },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGridMode(g.id)}
              style={{
                padding:      "2px 8px",
                borderRadius: 5,
                fontSize:     10,
                fontWeight:   600,
                cursor:       "pointer",
                border:       "none",
                background:   gridMode === g.id ? `${t.primary}33` : "transparent",
                color:        gridMode === g.id ? t.primary : t.textMuted,
                fontFamily:   "inherit",
                transition:   "all 0.15s",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <Divider theme={t} />

      {/* ── SNAP ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: t.textMuted, fontSize: 11 }}>Snap:</span>
        <div
          onClick={toggleSnap}
          style={{
            width:        32,
            height:       18,
            borderRadius: 9,
            background:   snapEnabled ? t.primary : t.border,
            cursor:       "pointer",
            position:     "relative",
            transition:   "background 0.2s",
          }}
        >
          <div
            style={{
              position:     "absolute",
              top:          2,
              left:         snapEnabled ? 16 : 2,
              width:        14,
              height:       14,
              borderRadius: "50%",
              background:   "#fff",
              transition:   "left 0.2s",
            }}
          />
        </div>
      </div>

      <Divider theme={t} />

      {/* ── ZOOM ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={zoomOut}
          title="Diminuir zoom"
          style={zoomBtnStyle(t)}
        >
          −
        </button>
        <button
          onClick={resetZoom}
          title="Resetar zoom (100%)"
          style={{
            background:  "none",
            border:      "none",
            color:       t.textMuted,
            cursor:      "pointer",
            fontSize:    11,
            fontWeight:  700,
            minWidth:    42,
            textAlign:   "center",
            padding:     0,
            fontFamily:  "inherit",
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={zoomIn}
          title="Aumentar zoom"
          style={zoomBtnStyle(t)}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function StatusItem({ label, value, theme: t }) {
  return (
    <span style={{ color: t.textMuted, whiteSpace: "nowrap" }}>
      {label}:{" "}
      <strong style={{ color: t.text }}>{value}</strong>
    </span>
  );
}

function Divider({ theme: t }) {
  return (
    <div
      style={{
        width:      1,
        height:     16,
        background: t.border,
        flexShrink: 0,
      }}
    />
  );
}

function zoomBtnStyle(t) {
  return {
    background:   "none",
    border:       "none",
    color:        t.text,
    cursor:       "pointer",
    fontSize:     16,
    lineHeight:   1,
    padding:      "0 2px",
    fontFamily:   "inherit",
  };
}