import { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import {
  THEME,
  SEAT_TYPES,
  STRUCTURE_TYPES,
  EVENT_TYPES,
  SEAT_STATUS,
} from "../../constants/objects";

export default function PropertiesPanel() {
  const {
    darkMode,
    objects,
    selectedId,
    roomInfo,
    removeObject,
    updateObject,
    updateRoomInfo,
    duplicateObject,
    clearSelection,
    getCapacity,
  } = useEditorStore();

  const t           = darkMode ? THEME.dark : THEME.light;
  const [activeTab, setActiveTab] = useState("Propriedades");
  const selectedObj = objects.find((o) => o.id === selectedId) || null;
  const capacity    = getCapacity();

  return (
    <div
      style={{
        width:      240,
        background: t.surface,
        borderLeft: `1px solid ${t.border}`,
        display:    "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow:   "hidden",
      }}
    >
      {/* ── ABAS ── */}
      <div
        style={{
          display:     "flex",
          borderBottom: `1px solid ${t.border}`,
          flexShrink:  0,
        }}
      >
        {["Propriedades", "Setores", "Camadas"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex:        1,
              padding:     "10px 0",
              border:      "none",
              background:  "transparent",
              color:       activeTab === tab ? t.primary : t.textMuted,
              fontSize:    11,
              fontWeight:  700,
              cursor:      "pointer",
              borderBottom: activeTab === tab
                ? `2px solid ${t.primary}`
                : "2px solid transparent",
              fontFamily:  "inherit",
              transition:  "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── CONTEÚDO ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>

        {/* ── ABA: PROPRIEDADES ── */}
        {activeTab === "Propriedades" && (
          selectedObj
            ? <ObjectProperties
                obj={selectedObj}
                theme={t}
                onUpdate={(changes) => updateObject(selectedObj.id, changes)}
                onRemove={() => { removeObject(selectedObj.id); clearSelection(); }}
                onDuplicate={() => duplicateObject(selectedObj.id)}
              />
            : <RoomProperties
                roomInfo={roomInfo}
                theme={t}
                capacity={capacity}
                onUpdate={updateRoomInfo}
              />
        )}

        {/* ── ABA: SETORES ── */}
        {activeTab === "Setores" && (
          <SetoresPanel theme={t} objects={objects} />
        )}

        {/* ── ABA: CAMADAS ── */}
        {activeTab === "Camadas" && (
          <CamadasPanel
            theme={t}
            objects={objects}
            selectedId={selectedId}
            onSelect={(id) => useEditorStore.getState().setSelectedId(id)}
            onRemove={removeObject}
          />
        )}
      </div>
    </div>
  );
}

// ─── PROPRIEDADES DO OBJETO SELECIONADO ───────────────
function ObjectProperties({ obj, theme: t, onUpdate, onRemove, onDuplicate }) {
  const isSeат = obj.kind === "seat";
  const cfg    = isSeат
    ? SEAT_TYPES[obj.seatType]
    : obj.kind === "structure"
      ? STRUCTURE_TYPES[obj.structureType]
      : EVENT_TYPES[obj.eventType];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* cabeçalho do objeto */}
      <div
        style={{
          background:   t.bg,
          borderRadius: 8,
          padding:      10,
          border:       `1px solid ${t.border}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: t.text, marginBottom: 4 }}>
          {cfg?.emoji} {obj.label}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted }}>
          Tipo: {cfg?.label || obj.kind}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted }}>
          Posição: ({obj.x}, {obj.y})
        </div>
      </div>

      {/* label editável */}
      <Field label="Identificação" theme={t}>
        <input
          value={obj.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          style={inputStyle(t)}
        />
      </Field>

      {/* propriedades específicas de assento */}
      {isSeат && (
        <>
          {/* tipo de assento */}
          <div>
            <SectionLabel label="Tipo de Assento" theme={t} />
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "1fr 1fr",
                gap:                 6,
                marginTop:           6,
              }}
            >
              {Object.entries(SEAT_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => onUpdate({ seatType: key })}
                  style={{
                    padding:      "6px",
                    borderRadius: 7,
                    border:       `1px solid ${obj.seatType === key ? val.color : t.border}`,
                    background:   obj.seatType === key ? `${val.color}22` : t.bg,
                    cursor:       "pointer",
                    display:      "flex",
                    flexDirection: "column",
                    alignItems:   "center",
                    gap:          2,
                    fontFamily:   "inherit",
                    transition:   "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{val.emoji}</span>
                  <span
                    style={{
                      fontSize:   9,
                      color:      obj.seatType === key ? val.color : t.text,
                      fontWeight: 600,
                    }}
                  >
                    {val.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* status */}
          <div>
            <SectionLabel label="Status" theme={t} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
              {Object.entries(SEAT_STATUS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => onUpdate({ status: key })}
                  style={{
                    padding:      "6px 10px",
                    borderRadius: 7,
                    border:       `1px solid ${obj.status === key ? t.primary : t.border}`,
                    background:   obj.status === key ? `${t.primary}22` : t.bg,
                    cursor:       "pointer",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          8,
                    fontFamily:   "inherit",
                    transition:   "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 10 }}>{val.dot}</span>
                  <span
                    style={{
                      fontSize:   12,
                      color:      obj.status === key ? t.primary : t.text,
                      fontWeight: obj.status === key ? 700 : 400,
                    }}
                  >
                    {val.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* setor */}
          <Field label="Setor" theme={t}>
            <select
              value={obj.sector || "plateia"}
              onChange={(e) => onUpdate({ sector: e.target.value })}
              style={inputStyle(t)}
            >
              <option value="plateia">Plateia</option>
              <option value="mezanino">Mezanino</option>
              <option value="vip">VIP</option>
              <option value="camarote">Camarote</option>
            </select>
          </Field>
        </>
      )}

      {/* dimensões para estrutura e evento */}
      {!isSeат && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Field label="Largura" theme={t}>
            <input
              type="number"
              min={1}
              max={20}
              value={obj.w || 2}
              onChange={(e) => onUpdate({ w: Number(e.target.value) })}
              style={inputStyle(t)}
            />
          </Field>
          <Field label="Altura" theme={t}>
            <input
              type="number"
              min={1}
              max={20}
              value={obj.h || 1}
              onChange={(e) => onUpdate({ h: Number(e.target.value) })}
              style={inputStyle(t)}
            />
          </Field>
        </div>
      )}

      {/* ações */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={onDuplicate}
          style={{
            padding:      "8px",
            borderRadius: 8,
            border:       `1px solid ${t.border}`,
            background:   t.bg,
            color:        t.text,
            fontWeight:   600,
            fontSize:     12,
            cursor:       "pointer",
            fontFamily:   "inherit",
          }}
        >
          ⧉ Duplicar Objeto
        </button>
        <button
          onClick={onRemove}
          style={{
            padding:      "8px",
            borderRadius: 8,
            border:       "1px solid #EF444444",
            background:   "#EF444411",
            color:        "#EF4444",
            fontWeight:   700,
            fontSize:     12,
            cursor:       "pointer",
            fontFamily:   "inherit",
          }}
        >
          🗑 Remover Objeto
        </button>
      </div>
    </div>
  );
}

// ─── PROPRIEDADES DA SALA (sem seleção) ───────────────
function RoomProperties({ roomInfo, theme: t, capacity, onUpdate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <SectionLabel label="Informações da Sala" theme={t} />

      <Field label="Nome" theme={t}>
        <input
          value={roomInfo.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          style={inputStyle(t)}
        />
      </Field>

      <Field label="Descrição" theme={t}>
        <textarea
          value={roomInfo.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          style={{ ...inputStyle(t), resize: "vertical", minHeight: 60 }}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="Largura" theme={t}>
          <input
            value={roomInfo.width}
            onChange={(e) => onUpdate({ width: e.target.value })}
            style={inputStyle(t)}
          />
        </Field>
        <Field label="Comprimento" theme={t}>
          <input
            value={roomInfo.height}
            onChange={(e) => onUpdate({ height: e.target.value })}
            style={inputStyle(t)}
          />
        </Field>
      </div>

      {/* configurações */}
      <div>
        <SectionLabel label="Configurações" theme={t} />
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { key: "allowOverlap",     label: "Permitir sobreposição" },
            { key: "showNumbering",    label: "Exibir numeração"      },
            { key: "enable3D",         label: "Habilitar 3D"          },
            { key: "accessibilityPCD", label: "Acessibilidade PCD"    },
          ].map((cfg) => (
            <div
              key={cfg.key}
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, color: t.text }}>{cfg.label}</span>
              <Toggle
                value={roomInfo[cfg.key]}
                onChange={(val) => onUpdate({ [cfg.key]: val })}
                primary={t.primary}
                border={t.border}
              />
            </div>
          ))}
        </div>
      </div>

      {/* capacidade */}
      <div>
        <SectionLabel label="Ocupação por Tipo" theme={t} />
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(SEAT_TYPES).map(([key, val]) =>
            capacity[key] ? (
              <div
                key={key}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width:        8,
                      height:       8,
                      borderRadius: "50%",
                      background:   val.color,
                    }}
                  />
                  <span style={{ fontSize: 11, color: t.textMuted }}>{val.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>
                  {capacity[key]}
                </span>
              </div>
            ) : null
          )}
          {capacity.total > 0 && (
            <div
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                paddingTop:     6,
                borderTop:      `1px solid ${t.border}`,
                marginTop:      2,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: t.primary }}>
                {capacity.total}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* botão salvar */}
      <button
        style={{
          padding:      "10px",
          borderRadius: 8,
          border:       "none",
          cursor:       "pointer",
          background:   `linear-gradient(135deg, #705EBD, #A78BFA)`,
          color:        "#fff",
          fontWeight:   700,
          fontSize:     13,
          fontFamily:   "inherit",
        }}
      >
        💾 Salvar Alterações
      </button>
    </div>
  );
}

// ─── ABA: SETORES ───────────────
function SetoresPanel({ theme: t, objects }) {
  const SETORES = [
    { key: "plateia",  label: "Plateia",  color: "#3B82F6" },
    { key: "mezanino", label: "Mezanino", color: "#8B5CF6" },
    { key: "vip",      label: "VIP",      color: "#705EBD" },
    { key: "camarote", label: "Camarote", color: "#F59E0B" },
  ];

  const countBySector = objects
    .filter((o) => o.kind === "seat")
    .reduce((acc, o) => {
      const s = o.sector || "plateia";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SectionLabel label="Setores da Sala" theme={t} />
      {SETORES.map((setor) => (
        <div
          key={setor.key}
          style={{
            background:   t.bg,
            border:       `1px solid ${t.border}`,
            borderRadius: 8,
            padding:      "10px 12px",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width:        12,
                height:       12,
                borderRadius: 3,
                background:   setor.color,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
              {setor.label}
            </span>
          </div>
          <span
            style={{
              fontSize:     12,
              fontWeight:   700,
              color:        setor.color,
              background:   `${setor.color}22`,
              padding:      "2px 8px",
              borderRadius: 20,
            }}
          >
            {countBySector[setor.key] || 0} lugares
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ABA: CAMADAS ───────────────
function CamadasPanel({ theme: t, objects, selectedId, onSelect, onRemove }) {
  const reversed = [...objects].reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <SectionLabel label={`${objects.length} objetos`} theme={t} />
      {reversed.map((obj) => {
        const isSelected = obj.id === selectedId;
        const cfg =
          obj.kind === "seat"
            ? SEAT_TYPES[obj.seatType]
            : obj.kind === "structure"
              ? STRUCTURE_TYPES[obj.structureType]
              : EVENT_TYPES[obj.eventType];

        return (
          <div
            key={obj.id}
            onClick={() => onSelect(obj.id)}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "6px 8px",
              borderRadius:   7,
              border:         `1px solid ${isSelected ? t.primary : t.border}`,
              background:     isSelected ? `${t.primary}11` : t.bg,
              cursor:         "pointer",
              transition:     "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{cfg?.emoji || "□"}</span>
              <span style={{ fontSize: 11, color: t.text, fontWeight: 600 }}>
                {obj.label}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(obj.id); }}
              style={{
                background: "none",
                border:     "none",
                color:      t.textMuted,
                cursor:     "pointer",
                fontSize:   12,
                padding:    "2px 4px",
                borderRadius: 4,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}

      {objects.length === 0 && (
        <div
          style={{
            textAlign:  "center",
            color:      t.textMuted,
            fontSize:   12,
            padding:    "20px 0",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
          Nenhum objeto no canvas
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ───────────────
function SectionLabel({ label, theme: t }) {
  return (
    <div
      style={{
        fontSize:      11,
        fontWeight:    700,
        color:         t.textMuted,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom:  4,
      }}
    >
      {label}
    </div>
  );
}

function Field({ label, children, theme: t }) {
  return (
    <div>
      <div
        style={{
          fontSize:     10,
          color:        t.textMuted,
          marginBottom: 4,
          fontWeight:   600,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, primary, border }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width:      32,
        height:     18,
        borderRadius: 9,
        background: value ? primary : border,
        cursor:     "pointer",
        position:   "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position:   "absolute",
          top:        2,
          left:       value ? 16 : 2,
          width:      14,
          height:     14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </div>
  );
}

function inputStyle(t) {
  return {
    width:        "100%",
    padding:      "7px 10px",
    borderRadius: 7,
    border:       `1px solid ${t.border}`,
    background:   t.bg,
    color:        t.text,
    fontSize:     12,
    fontFamily:   "inherit",
    boxSizing:    "border-box",
    outline:      "none",
  };
}