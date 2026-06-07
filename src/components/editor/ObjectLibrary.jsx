import { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import {
  THEME,
  SEAT_TYPES,
  STRUCTURE_TYPES,
  EVENT_TYPES,
} from "../../constants/objects";

export default function ObjectLibrary() {
  const {
    darkMode,
    selectedSeatType,
    selectedStructureType,
    selectedEventType,
    setSelectedSeatType,
    setSelectedStructureType,
    setSelectedEventType,
  } = useEditorStore();

  const t = darkMode ? THEME.dark : THEME.light;
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState("Assentos");
  const [isOpen, setIsOpen] = useState(true);

  const SECTIONS = [
    {
      name: "Assentos",
      items: Object.entries(SEAT_TYPES).map(([key, val]) => ({
        key,
        label: val.label,
        emoji: val.emoji,
        color: val.color,
        description: val.description,
      })),
    },
    {
      name: "Estrutura",
      items: Object.entries(STRUCTURE_TYPES).map(([key, val]) => ({
        key,
        label: val.label,
        emoji: val.emoji,
        color: val.color,
        description: val.description,
      })),
    },
    {
      name: "Eventos",
      items: Object.entries(EVENT_TYPES).map(([key, val]) => ({
        key,
        label: val.label,
        emoji: val.emoji,
        color: val.color,
        description: val.description,
      })),
    },
  ];

  // filtra itens pelo search
  const filterItems = (items) => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  };

  const isItemSelected = (sectionName, key) => {
    if (sectionName === "Assentos")   return selectedSeatType      === key;
    if (sectionName === "Estrutura")  return selectedStructureType === key;
    if (sectionName === "Eventos")    return selectedEventType     === key;
    return false;
  };

  const handleItemClick = (sectionName, key) => {
    if (sectionName === "Assentos")  setSelectedSeatType(key);
    if (sectionName === "Estrutura") setSelectedStructureType(key);
    if (sectionName === "Eventos")   setSelectedEventType(key);
  };

  return (
    <div
      style={{
        width: isOpen ? 220 : 48,
        background: t.surface,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s ease",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* ── ÍCONES LATERAIS DE FERRAMENTAS ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: `1px solid ${t.border}`,
          gap: 2,
          flexShrink: 0,
        }}
      >
        {SIDE_TOOLS.map((tool) => (
          <SideToolButton key={tool.id} tool={tool} theme={t} />
        ))}

        <div
          style={{
            width: 28,
            height: 1,
            background: t.border,
            margin: "4px 0",
          }}
        />

        {/* botão abrir/fechar biblioteca */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Fechar biblioteca" : "Abrir biblioteca"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: isOpen ? `${t.primary}22` : "transparent",
            color: isOpen ? t.primary : t.textMuted,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📚
        </button>
      </div>

      {/* ── PAINEL DA BIBLIOTECA ── */}
      {isOpen && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* cabeçalho */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Biblioteca
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: t.textMuted,
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                padding: 2,
              }}
            >
              ✕
            </button>
          </div>

          {/* campo de busca */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: t.bg,
              borderRadius: 8,
              padding: "6px 10px",
              marginBottom: 10,
              border: `1px solid ${t.border}`,
            }}
          >
            <span style={{ color: t.textMuted, fontSize: 12 }}>🔍</span>
            <input
              placeholder="Buscar objetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "none",
                border: "none",
                color: t.text,
                fontSize: 12,
                outline: "none",
                flex: 1,
                fontFamily: "inherit",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: 12,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* seções */}
          {SECTIONS.map((section) => {
            const filtered = filterItems(section.items);
            if (filtered.length === 0) return null;

            const isExpanded =
              openSection === section.name || search.trim() !== "";

            return (
              <div key={section.name} style={{ marginBottom: 8 }}>
                {/* cabeçalho da seção */}
                <button
                  onClick={() =>
                    setOpenSection(
                      openSection === section.name ? "" : section.name
                    )
                  }
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: t.textMuted,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "6px 2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "inherit",
                  }}
                >
                  <span>{section.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {/* grid de itens */}
                {isExpanded && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    {filtered.map((item) => {
                      const selected = isItemSelected(section.name, item.key);
                      return (
                        <LibraryItem
                          key={item.key}
                          item={item}
                          selected={selected}
                          onClick={() =>
                            handleItemClick(section.name, item.key)
                          }
                          theme={t}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* mensagem sem resultado */}
          {search &&
            SECTIONS.every(
              (s) => filterItems(s.items).length === 0
            ) && (
              <div
                style={{
                  textAlign: "center",
                  color: t.textMuted,
                  fontSize: 12,
                  padding: "20px 0",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
                Nenhum objeto encontrado
                <br />
                <span style={{ fontSize: 11 }}>"{search}"</span>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ─── ITEM DA BIBLIOTECA ─────────────
function LibraryItem({ item, selected, onClick, theme: t }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={item.description || item.label}
      style={{
        background: selected
          ? `${item.color}22`
          : hovered
          ? `${item.color}11`
          : t.bg,
        border: `1px solid ${
          selected ? item.color : hovered ? `${item.color}66` : t.border
        }`,
        borderRadius: 8,
        padding: "8px 6px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>{item.emoji}</span>
      <span
        style={{
          fontSize: 10,
          color: selected ? item.color : t.text,
          fontWeight: selected ? 700 : 600,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {item.label}
      </span>
    </button>
  );
}

// ─── BOTÃO LATERAL DE FERRAMENTA ─────────────
function SideToolButton({ tool, theme: t }) {
  const { activeTool, setActiveTool } = useEditorStore();
  const active = activeTool === tool.id;

  return (
    <button
      title={tool.label}
      onClick={() => setActiveTool(tool.id)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: active ? `${t.primary}33` : "transparent",
        color: active ? t.primary : t.textMuted,
        fontSize: tool.icon.length > 1 ? 12 : 18,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      {tool.icon}
    </button>
  );
}

// ─── FERRAMENTAS LATERAIS ─────────────
const SIDE_TOOLS = [
  { id: "select",    icon: "↖", label: "Selecionar (V)" },
  { id: "pan",       icon: "✋", label: "Mover tela (H)" },
  { id: "seat",      icon: "💺", label: "Assentos (S)"   },
  { id: "structure", icon: "🏛", label: "Estrutura (E)"  },
  { id: "event",     icon: "🎭", label: "Eventos (C)"    },
  { id: "erase",     icon: "✕", label: "Apagar (Del)"   },
];