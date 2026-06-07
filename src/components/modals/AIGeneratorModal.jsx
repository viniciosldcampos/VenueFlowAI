// src/components/modals/AIGeneratorModal.jsx
import { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import {
  THEME,
  SEAT_TYPES,
  STRUCTURE_TYPES,
} from "../../constants/objects";

// ─── CONFIGURAÇÕES DO FORMULÁRIO ──────────────────────────────────────────────
const ROOM_TYPES = [
  { id: "auditorium",  label: "Auditório",            emoji: "🏛" },
  { id: "cinema",      label: "Cinema",               emoji: "🎬" },
  { id: "theater",     label: "Teatro",               emoji: "🎭" },
  { id: "classroom",   label: "Sala de Aula",         emoji: "📚" },
  { id: "arena",       label: "Arena 360°",           emoji: "🏟" },
  { id: "convention",  label: "Centro de Convenções", emoji: "🏢" },
  { id: "corporate",   label: "Corporativo",          emoji: "💼" },
];

const INITIAL_FORM = {
  roomType:       "auditorium",
  capacity:       200,
  hasStage:       true,
  hasScreen:      false,
  accessibility:  true,
  sectors:        2,
  corridors:      2,
  vipPercent:     10,
  pcdPercent:     5,
};

export default function AIGeneratorModal({ onClose }) {
  const { darkMode, setObjects, clearCanvas } = useEditorStore();
  const t = darkMode ? THEME.dark : THEME.light;

  const [form,    setForm]    = useState(INITIAL_FORM);
  const [step,    setStep]    = useState(1); // 1 = formulário, 2 = gerando, 3 = resultado
  const [preview, setPreview] = useState([]);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── GERAR LAYOUT ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setStep(2);
    await new Promise((r) => setTimeout(r, 2000));
    const layout = generateLayout(form);
    setPreview(layout);
    setStep(3);
  };

  // ── APLICAR NO CANVAS ─────────────────────────────────────────────────────
  const handleApply = () => {
    clearCanvas();
    setObjects(preview);
    onClose();
  };

  return (
    // overlay
    <div
      onClick={onClose}
      style={{
        position:        "fixed",
        inset:           0,
        background:      "rgba(0,0,0,0.7)",
        zIndex:          1000,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        backdropFilter:  "blur(4px)",
      }}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   t.surface,
          borderRadius: 16,
          width:        480,
          maxHeight:    "85vh",
          display:      "flex",
          flexDirection: "column",
          border:       `1px solid ${t.border}`,
          boxShadow:    "0 24px 80px rgba(0,0,0,0.5)",
          overflow:     "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <ModalHeader onClose={onClose} theme={t} step={step} />

        {/* ── CONTEÚDO ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {step === 1 && (
            <StepForm
              form={form}
              onChange={updateForm}
              theme={t}
            />
          )}
          {step === 2 && (
            <StepLoading theme={t} form={form} />
          )}
          {step === 3 && (
            <StepResult
              preview={preview}
              form={form}
              theme={t}
            />
          )}
        </div>

        {/* ── FOOTER ── */}
        <ModalFooter
          step={step}
          onClose={onClose}
          onGenerate={handleGenerate}
          onBack={() => setStep(1)}
          onApply={handleApply}
          theme={t}
        />
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function ModalHeader({ onClose, theme: t, step }) {
  const titles = {
    1: "Gerar Layout com IA",
    2: "Gerando Layout...",
    3: "Layout Gerado!",
  };
  const subtitles = {
    1: "Descreva o espaço e a IA cria automaticamente",
    2: "Aguarde enquanto calculamos a melhor distribuição",
    3: "Revise o layout antes de aplicar ao canvas",
  };

  return (
    <div
      style={{
        padding:      "20px 24px 16px",
        borderBottom: `1px solid ${t.border}`,
        display:      "flex",
        alignItems:   "flex-start",
        justifyContent: "space-between",
        gap:          12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width:          42,
            height:         42,
            borderRadius:   12,
            background:     "linear-gradient(135deg, #705EBD, #A78BFA)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       20,
            flexShrink:     0,
          }}
        >
          ✨
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: t.text }}>
            {titles[step]}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
            {subtitles[step]}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background:   "none",
          border:       "none",
          color:        t.textMuted,
          cursor:       "pointer",
          fontSize:     18,
          lineHeight:   1,
          padding:      4,
          borderRadius: 6,
          flexShrink:   0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── STEP 1: FORMULÁRIO ───────────────────────────────────────────────────────
function StepForm({ form, onChange, theme: t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* tipo de espaço */}
      <div>
        <FieldLabel label="Tipo de Espaço" theme={t} />
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap:                 8,
            marginTop:           8,
          }}
        >
          {ROOM_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onChange("roomType", type.id)}
              style={{
                padding:      "8px 4px",
                borderRadius: 8,
                border:       `1px solid ${
                  form.roomType === type.id ? "#705EBD" : t.border
                }`,
                background:   form.roomType === type.id
                  ? "#705EBD22"
                  : t.bg,
                cursor:       "pointer",
                display:      "flex",
                flexDirection: "column",
                alignItems:   "center",
                gap:          4,
                fontFamily:   "inherit",
                transition:   "all 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{type.emoji}</span>
              <span
                style={{
                  fontSize:  9,
                  color:     form.roomType === type.id ? "#705EBD" : t.textMuted,
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* capacidade */}
      <div>
        <FieldLabel
          label={`Capacidade Total — ${form.capacity} pessoas`}
          theme={t}
        />
        <input
          type="range"
          min={20}
          max={2000}
          step={10}
          value={form.capacity}
          onChange={(e) => onChange("capacity", Number(e.target.value))}
          style={{ width: "100%", marginTop: 8, accentColor: "#705EBD" }}
        />
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            fontSize:       10,
            color:          t.textMuted,
            marginTop:      4,
          }}
        >
          <span>20</span>
          <span>2.000</span>
        </div>
      </div>

      {/* distribuição VIP e PCD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <FieldLabel label={`VIP — ${form.vipPercent}%`} theme={t} />
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={form.vipPercent}
            onChange={(e) => onChange("vipPercent", Number(e.target.value))}
            style={{ width: "100%", marginTop: 8, accentColor: "#705EBD" }}
          />
        </div>
        <div>
          <FieldLabel label={`PCD — ${form.pcdPercent}%`} theme={t} />
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={form.pcdPercent}
            onChange={(e) => onChange("pcdPercent", Number(e.target.value))}
            style={{ width: "100%", marginTop: 8, accentColor: "#22C55E" }}
          />
        </div>
      </div>

      {/* número de setores e corredores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <FieldLabel label="Número de Setores" theme={t} />
          <select
            value={form.sectors}
            onChange={(e) => onChange("sectors", Number(e.target.value))}
            style={selectStyle(t)}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} setor{n > 1 ? "es" : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel label="Corredores" theme={t} />
          <select
            value={form.corridors}
            onChange={(e) => onChange("corridors", Number(e.target.value))}
            style={selectStyle(t)}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} corredor{n > 1 ? "es" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* opções booleanas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FieldLabel label="Elementos do Espaço" theme={t} />
        {[
          { key: "hasStage",     label: "Incluir Palco",         emoji: "🎭" },
          { key: "hasScreen",    label: "Incluir Tela de Cinema", emoji: "🎬" },
          { key: "accessibility",label: "Espaços de Acessibilidade", emoji: "♿" },
        ].map((opt) => (
          <div
            key={opt.key}
            onClick={() => onChange(opt.key, !form[opt.key])}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "10px 12px",
              borderRadius:   8,
              border:         `1px solid ${form[opt.key] ? "#705EBD" : t.border}`,
              background:     form[opt.key] ? "#705EBD11" : t.bg,
              cursor:         "pointer",
              transition:     "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{opt.emoji}</span>
              <span style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>
                {opt.label}
              </span>
            </div>
            <Toggle value={form[opt.key]} primary="#705EBD" border={t.border} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 2: LOADING ──────────────────────────────────────────────────────────
function StepLoading({ theme: t, form }) {
  const roomType = ROOM_TYPES.find((r) => r.id === form.roomType);

  const steps = [
    { label: "Calculando distribuição de assentos...", done: true  },
    { label: "Posicionando corredores...",             done: true  },
    { label: "Adicionando estruturas...",              done: false },
    { label: "Aplicando acessibilidade PCD...",        done: false },
    { label: "Otimizando layout final...",             done: false },
  ];

  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            24,
        padding:        "20px 0",
      }}
    >
      {/* ícone animado */}
      <div
        style={{
          width:          80,
          height:         80,
          borderRadius:   "50%",
          background:     "linear-gradient(135deg, #705EBD22, #A78BFA22)",
          border:         "2px solid #705EBD44",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       36,
          animation:      "spin 2s linear infinite",
        }}
      >
        {roomType?.emoji || "🏛"}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 6 }}>
          Gerando {form.capacity} lugares
        </div>
        <div style={{ fontSize: 12, color: t.textMuted }}>
          {roomType?.label} com {form.sectors} setor{form.sectors > 1 ? "es" : ""}
        </div>
      </div>

      {/* steps de progresso */}
      <div
        style={{
          width:         "100%",
          display:       "flex",
          flexDirection: "column",
          gap:           8,
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        10,
              fontSize:   12,
              color:      s.done ? t.text : t.textMuted,
            }}
          >
            <span style={{ fontSize: 14 }}>{s.done ? "✓" : "○"}</span>
            {s.label}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── STEP 3: RESULTADO ────────────────────────────────────────────────────────
function StepResult({ preview, form, theme: t }) {
  const seats      = preview.filter((o) => o.kind === "seat");
  const structures = preview.filter((o) => o.kind !== "seat");

  const byType = seats.reduce((acc, o) => {
    const type = o.seatType || "standard";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* resumo */}
      <div
        style={{
          background:   t.bg,
          borderRadius: 10,
          padding:      14,
          border:       `1px solid ${t.border}`,
          display:      "flex",
          flexDirection: "column",
          gap:          10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
          ✅ Layout gerado com sucesso
        </div>

        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            gap:                 8,
          }}
        >
          {[
            { label: "Total de lugares", value: seats.length      },
            { label: "Estruturas",        value: structures.length },
            { label: "Setores",           value: form.sectors      },
            { label: "Corredores",        value: form.corridors    },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background:   t.surface,
                borderRadius: 8,
                padding:      "8px 10px",
                border:       `1px solid ${t.border}`,
              }}
            >
              <div style={{ fontSize: 10, color: t.textMuted }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.primary }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* breakdown por tipo */}
      <div>
        <div
          style={{
            fontSize:      11,
            fontWeight:    700,
            color:         t.textMuted,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom:  8,
          }}
        >
          Distribuição por Tipo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(byType).map(([type, count]) => {
            const cfg     = SEAT_TYPES[type];
            const percent = Math.round((count / seats.length) * 100);
            return (
              <div key={type}>
                <div
                  style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    fontSize:       11,
                    color:          t.textMuted,
                    marginBottom:   3,
                  }}
                >
                  <span>{cfg?.emoji} {cfg?.label}</span>
                  <span>{count} ({percent}%)</span>
                </div>
                <div
                  style={{
                    height:       4,
                    background:   t.border,
                    borderRadius: 2,
                    overflow:     "hidden",
                  }}
                >
                  <div
                    style={{
                      height:       "100%",
                      width:        `${percent}%`,
                      background:   cfg?.color || "#705EBD",
                      borderRadius: 2,
                      transition:   "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          fontSize:     12,
          color:        t.textMuted,
          background:   t.bg,
          borderRadius: 8,
          padding:      10,
          border:       `1px solid ${t.border}`,
          lineHeight:   1.6,
        }}
      >
        ℹ️ O layout será aplicado ao canvas substituindo os objetos atuais.
        Você poderá editar qualquer elemento após aplicar.
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function ModalFooter({ step, onClose, onGenerate, onBack, onApply, theme: t }) {
  return (
    <div
      style={{
        padding:        "14px 24px",
        borderTop:      `1px solid ${t.border}`,
        display:        "flex",
        gap:            10,
        justifyContent: "flex-end",
      }}
    >
      {step === 1 && (
        <>
          <button onClick={onClose} style={btnSecondary(t)}>
            Cancelar
          </button>
          <button onClick={onGenerate} style={btnPrimary}>
            ✨ Gerar Layout
          </button>
        </>
      )}

      {step === 2 && (
        <button disabled style={{ ...btnPrimary, opacity: 0.6, cursor: "default" }}>
          ⟳ Gerando...
        </button>
      )}

      {step === 3 && (
        <>
          <button onClick={onBack} style={btnSecondary(t)}>
            ← Voltar
          </button>
          <button onClick={onApply} style={btnPrimary}>
            ✅ Aplicar ao Canvas
          </button>
        </>
      )}
    </div>
  );
}

// ─── GERADOR DE LAYOUT ────────────────────────────────────────────────────────
function generateLayout(form) {
  const items   = [];
  let idCounter = Date.now();
  const nextId  = () => idCounter++;
  const vipQty  = Math.floor(form.capacity * (form.vipPercent  / 100));
  const pcdQty  = Math.floor(form.capacity * (form.pcdPercent  / 100));
  const stdQty  = form.capacity - vipQty - pcdQty;

  // palco
  if (form.hasStage) {
    items.push({
      id:            nextId(),
      kind:          "structure",
      structureType: "stage",
      x:             6, y: 1,
      w:             STRUCTURE_TYPES.stage.w,
      h:             STRUCTURE_TYPES.stage.h,
      label:         "PALCO",
    });
  }

  // tela
  if (form.hasScreen) {
    items.push({
      id:            nextId(),
      kind:          "structure",
      structureType: "screen",
      x:             7, y: 0,
      w:             STRUCTURE_TYPES.screen.w,
      h:             STRUCTURE_TYPES.screen.h,
      label:         "TELA",
    });
  }

  // calcular rows necessárias
  const cols        = Math.min(14, Math.ceil(Math.sqrt(form.capacity)));
  const startY      = form.hasStage ? 5 : 2;
  const ALPHABET    = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let   placed      = 0;
  let   rowIndex    = 0;

  // assentos VIP (primeiras fileiras)
  const vipRows = Math.ceil(vipQty / cols);
  for (let r = 0; r < vipRows && placed < vipQty; r++) {
    for (let c = 0; c < cols && placed < vipQty; c++) {
      items.push({
        id:       nextId(),
        kind:     "seat",
        seatType: "vip",
        x:        2 + c,
        y:        startY + r * 2,
        label:    `${ALPHABET[rowIndex]}${c + 1}`,
        sector:   "vip",
        status:   "available",
      });
      placed++;
    }
    rowIndex++;
  }

  // assentos padrão
  const stdRows = Math.ceil(stdQty / cols);
  for (let r = 0; r < stdRows && placed < vipQty + stdQty; r++) {
    for (let c = 0; c < cols && placed < vipQty + stdQty; c++) {
      items.push({
        id:       nextId(),
        kind:     "seat",
        seatType: "standard",
        x:        2 + c,
        y:        startY + (vipRows + r) * 2,
        label:    `${ALPHABET[rowIndex]}${c + 1}`,
        sector:   "plateia",
        status:   "available",
      });
      placed++;
    }
    rowIndex++;
  }

  // assentos PCD (lateral)
  if (form.accessibility) {
    for (let i = 0; i < pcdQty; i++) {
      items.push({
        id:       nextId(),
        kind:     "seat",
        seatType: "pcd",
        x:        0,
        y:        startY + i * 2,
        label:    `PCD${i + 1}`,
        sector:   "plateia",
        status:   "available",
      });
    }
  }

  // portas laterais
  items.push(
    {
      id: nextId(), kind: "structure", structureType: "door",
      x: 0, y: startY + 2, w: 1, h: 2, label: "SAÍDA",
    },
    {
      id: nextId(), kind: "structure", structureType: "door",
      x: cols + 3, y: startY + 2, w: 1, h: 2, label: "SAÍDA",
    }
  );

  return items;
}

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function FieldLabel({ label, theme: t }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, marginBottom: 2 }}>
      {label}
    </div>
  );
}

function Toggle({ value, primary, border }) {
  return (
    <div
      style={{
        width:        30,
        height:       17,
        borderRadius: 9,
        background:   value ? primary : border,
        position:     "relative",
        flexShrink:   0,
        transition:   "background 0.2s",
      }}
    >
      <div
        style={{
          position:     "absolute",
          top:          2,
          left:         value ? 15 : 2,
          width:        13,
          height:       13,
          borderRadius: "50%",
          background:   "#fff",
          transition:   "left 0.2s",
        }}
      />
    </div>
  );
}

function selectStyle(t) {
  return {
    width:        "100%",
    padding:      "8px 10px",
    borderRadius: 8,
    border:       `1px solid ${t.border}`,
    background:   t.bg,
    color:        t.text,
    fontSize:     13,
    fontFamily:   "inherit",
    marginTop:    6,
    outline:      "none",
    cursor:       "pointer",
  };
}

const btnPrimary = {
  padding:      "9px 20px",
  borderRadius: 8,
  border:       "none",
  cursor:       "pointer",
  background:   "linear-gradient(135deg, #705EBD, #A78BFA)",
  color:        "#fff",
  fontWeight:   700,
  fontSize:     13,
  fontFamily:   "inherit",
};

function btnSecondary(t) {
  return {
    padding:      "9px 20px",
    borderRadius: 8,
    border:       `1px solid ${t.border}`,
    background:   "transparent",
    color:        t.text,
    fontWeight:   600,
    fontSize:     13,
    cursor:       "pointer",
    fontFamily:   "inherit",
  };
}