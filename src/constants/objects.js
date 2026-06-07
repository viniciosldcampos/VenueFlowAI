export const GRID_SIZE = 28;

// ─── TIPOS DE ASSENTO ────────
export const SEAT_TYPES = {
  standard: {
    label: "Padrão",
    color: "#4A90D9",
    darkColor: "#3a7bc8",
    emoji: "💺",
    description: "Assento padrão",
  },
  vip: {
    label: "VIP",
    color: "#705EBD",
    darkColor: "#5a4aad",
    emoji: "👑",
    description: "Poltrona VIP com espaço extra",
  },
  premium: {
    label: "Premium",
    color: "#F59E0B",
    darkColor: "#d97706",
    emoji: "⭐",
    description: "Poltrona premium reclinável",
  },
  pcd: {
    label: "PCD",
    color: "#22C55E",
    darkColor: "#16a34a",
    emoji: "♿",
    description: "Espaço para cadeirante",
  },
  dbox: {
    label: "D-BOX",
    color: "#EF4444",
    darkColor: "#dc2626",
    emoji: "🎮",
    description: "Poltrona com movimento sincronizado",
  },
  guidedog: {
    label: "Cão-Guia",
    color: "#8B5CF6",
    darkColor: "#7c3aed",
    emoji: "🐕",
    description: "Espaço reservado para cão-guia",
  },
  puff: {
    label: "Puff",
    color: "#EC4899",
    darkColor: "#db2777",
    emoji: "🛋",
    description: "Assento tipo puff",
  },
  banqueta: {
    label: "Banqueta",
    color: "#06B6D4",
    darkColor: "#0891b2",
    emoji: "🪑",
    description: "Banqueta sem encosto",
  },
};

// ─── TIPOS DE ESTRUTURA ────────
export const STRUCTURE_TYPES = {
  screen: {
    label: "Tela Cinema",
    color: "#94A3B8",
    emoji: "🎬",
    w: 6,
    h: 1,
    description: "Tela de projeção",
  },
  stage: {
    label: "Palco",
    color: "#78716C",
    emoji: "🎭",
    w: 8,
    h: 3,
    description: "Palco principal",
  },
  tv: {
    label: "TV",
    color: "#64748B",
    emoji: "📺",
    w: 2,
    h: 1,
    description: "Televisão",
  },
  led: {
    label: "Telão LED",
    color: "#475569",
    emoji: "📡",
    w: 5,
    h: 1,
    description: "Painel LED de alta resolução",
  },
  door: {
    label: "Porta",
    color: "#A16207",
    emoji: "🚪",
    w: 1,
    h: 2,
    description: "Porta de acesso",
  },
  stairs: {
    label: "Escada",
    color: "#92400E",
    emoji: "🪜",
    w: 2,
    h: 3,
    description: "Escada de acesso",
  },
  wall: {
    label: "Parede",
    color: "#334155",
    emoji: "🧱",
    w: 4,
    h: 1,
    description: "Segmento de parede",
  },
  column: {
    label: "Pilar",
    color: "#44403C",
    emoji: "🏛",
    w: 1,
    h: 1,
    description: "Pilar estrutural",
  },
  corridor: {
    label: "Corredor",
    color: "#1E293B",
    emoji: "↔",
    w: 1,
    h: 4,
    description: "Corredor de passagem",
  },
  window: {
    label: "Janela",
    color: "#7DD3FC",
    emoji: "🪟",
    w: 2,
    h: 1,
    description: "Janela",
  },
};

// ─── TIPOS DE EVENTO / MOBILIÁRIO ────────
export const EVENT_TYPES = {
  camarote: {
    label: "Camarote",
    color: "#D97706",
    emoji: "🥂",
    w: 4,
    h: 3,
    description: "Área VIP com mesa e poltronas",
  },
  stand: {
    label: "Stand",
    color: "#059669",
    emoji: "🏪",
    w: 3,
    h: 2,
    description: "Estande de exposição",
  },
  checkin: {
    label: "Credenciamento",
    color: "#0EA5E9",
    emoji: "📋",
    w: 3,
    h: 1,
    description: "Mesa de credenciamento",
  },
  bar: {
    label: "Bar",
    color: "#7C3AED",
    emoji: "🍺",
    w: 3,
    h: 2,
    description: "Área de bar e bebidas",
  },
  lounge: {
    label: "Lounge",
    color: "#BE185D",
    emoji: "🛋",
    w: 4,
    h: 3,
    description: "Área lounge com sofás",
  },
  table_round: {
    label: "Mesa Redonda",
    color: "#0F766E",
    emoji: "⭕",
    w: 3,
    h: 3,
    description: "Mesa redonda com cadeiras ao redor",
    seats: 8,
  },
  backdrop: {
    label: "Backdrop",
    color: "#6D28D9",
    emoji: "🖼",
    w: 5,
    h: 1,
    description: "Painel de fundo para fotos",
  },
};

// ─── CORES DOS SETORES ────────
export const SECTOR_COLORS = {
  plateia: "#3B82F6",
  mezanino: "#8B5CF6",
  camarote: "#F59E0B",
  vip: "#705EBD",
  palco: "#78716C",
};

// ─── FORMATOS DE SALA ────────
export const ROOM_FORMATS = [
  { id: "cinema",       label: "Cinema",           emoji: "🎬" },
  { id: "theater",      label: "Teatro",            emoji: "🎭" },
  { id: "auditorium",   label: "Auditório",         emoji: "🏛" },
  { id: "classroom",    label: "Sala de Aula",      emoji: "📚" },
  { id: "arena",        label: "Arena 360°",        emoji: "🏟" },
  { id: "convention",   label: "Centro de Convenções", emoji: "🏢" },
  { id: "corporate",    label: "Evento Corporativo", emoji: "💼" },
  { id: "semicircular", label: "Semicircular",      emoji: "🌙" },
  { id: "u_shape",      label: "Formato U",         emoji: "⊓" },
  { id: "free",         label: "Formato Livre",     emoji: "✏" },
];

// ─── FERRAMENTAS DO EDITOR ────────
export const EDITOR_TOOLS = [
  { id: "select",    icon: "MousePointer", label: "Selecionar (V)" },
  { id: "pan",       icon: "Hand",         label: "Mover tela (H)" },
  { id: "seat",      icon: "Armchair",     label: "Assentos (S)" },
  { id: "structure", icon: "Building2",    label: "Estrutura (E)" },
  { id: "event",     icon: "CalendarDays", label: "Eventos (C)" },
  { id: "erase",     icon: "Eraser",       label: "Apagar (Del)" },
];

// ─── STATUS DOS ASSENTOS ────────
export const SEAT_STATUS = {
  available: { label: "Disponível",  color: "#22C55E", dot: "🟢" },
  occupied:  { label: "Ocupado",     color: "#EF4444", dot: "🔴" },
  selected:  { label: "Selecionado", color: "#705EBD", dot: "🟣" },
  blocked:   { label: "Bloqueado",   color: "#6B7280", dot: "⚫" },
  reserved:  { label: "Reservado",   color: "#F59E0B", dot: "🟡" },
};

// ─── TEMA: CORES DO SISTEMA ────────
export const THEME = {
  dark: {
    bg:        "#0F172A",
    surface:   "#1E293B",
    surface2:  "#243447",
    border:    "#334155",
    text:      "#F1F5F9",
    textMuted: "#94A3B8",
    primary:   "#705EBD",
    accent:    "#8B74CC",
    canvas:    "#141E2E",
    grid:      "#1E2D40",
    success:   "#22C55E",
    warning:   "#F59E0B",
    danger:    "#EF4444",
  },
  light: {
    bg:        "#F1F5F9",
    surface:   "#FFFFFF",
    surface2:  "#F8FAFC",
    border:    "#E2E8F0",
    text:      "#0F172A",
    textMuted: "#64748B",
    primary:   "#705EBD",
    accent:    "#8B74CC",
    canvas:    "#E8EEF7",
    grid:      "#D1D9E6",
    success:   "#16A34A",
    warning:   "#D97706",
    danger:    "#DC2626",
  },
};