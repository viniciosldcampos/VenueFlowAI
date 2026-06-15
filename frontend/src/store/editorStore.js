// src/store/editorStore.js
import { create } from "zustand";

export const useEditorStore = create((set, get) => ({

  // ─── ESTADO DO CANVAS ──────────
  objects:    [],       // todos os objetos no canvas
  selectedId: null,     // id do objeto selecionado
  zoom:       1,        // nível de zoom (0.2 a 5)
  pan:        { x: 60, y: 40 }, // posição do canvas

  // ─── ESTADO DO EDITOR ──────────
  activeTool:          "select",   // ferramenta ativa
  selectedSeatType:    "standard", // tipo de assento para adicionar
  selectedStructureType: "stage",  // tipo de estrutura para adicionar
  selectedEventType:   "camarote", // tipo de evento para adicionar
  objectConfig: {
  width:    2,
  height:   1,
  quantity: 1,
  }, // configurações de criação de objetos
  gridMode:    "dots",  // "dots" | "lines" | "none"
  snapEnabled: true,    // snap ao grid ativado
  darkMode:    true,    // dark mode ativado
  view3D:      false,   // visualização 3D ativada

  // ─── HISTÓRICO (CTRL+Z / CTRL+Y) ──────────
  history:   [],   // pilha de estados anteriores
  redoStack: [],   // pilha de estados para refazer

  // ─── INFORMAÇÕES DA SALA ──────────
  roomInfo: {
    name:        "Nova Sala",
    description: "",
    width:       "30,00 m",
    height:      "20,00 m",
    allowOverlap:      false,
    showNumbering:     true,
    enable3D:          false,
    accessibilityPCD:  true,
  },

  // ─── AÇÕES: TEMA ──────────
  toggleDarkMode: () =>
    set((s) => ({ darkMode: !s.darkMode })),

  toggleView3D: () =>
    set((s) => ({ view3D: !s.view3D })),

  // ─── AÇÕES: FERRAMENTAS ──────────
  setActiveTool: (tool) =>
    set({ activeTool: tool }),

  setSelectedSeatType: (type) =>
    set({ selectedSeatType: type, activeTool: "seat" }),

  setSelectedStructureType: (type) =>
    set({ selectedStructureType: type, activeTool: "structure" }),

  setSelectedEventType: (type) =>
    set({ selectedEventType: type, activeTool: "event" }),

  setObjectConfig: (changes) =>
  set((s) => ({ objectConfig: { ...s.objectConfig, ...changes } })),

  // ─── AÇÕES: CANVAS ──────────
  setZoom: (zoom) =>
    set({ zoom: Math.max(0.2, Math.min(5, zoom)) }),

  zoomIn: () => {
    const { zoom, setZoom } = get();
    setZoom(zoom + 0.1);
  },

  zoomOut: () => {
    const { zoom, setZoom } = get();
    setZoom(zoom - 0.1);
  },

  resetZoom: () => set({ zoom: 1 }),

  setPan: (pan) => set({ pan }),

  setGridMode: (mode) => set({ gridMode: mode }),

  toggleSnap: () =>
    set((s) => ({ snapEnabled: !s.snapEnabled })),

  setSelectedId: (id) => set({ selectedId: id }),

  clearSelection: () => set({ selectedId: null }),

  // ─── AÇÕES: HISTÓRICO ──────────
  saveHistory: () => {
    const { objects, history } = get();
    set({
      history:   [...history.slice(-30), [...objects]],
      redoStack: [],
    });
  },

  undo: () => {
    const { history, objects, redoStack } = get();
    if (history.length === 0) return;
    set({
      objects:   history[history.length - 1],
      history:   history.slice(0, -1),
      redoStack: [objects, ...redoStack.slice(0, 29)],
    });
  },

  redo: () => {
    const { redoStack, objects, history } = get();
    if (redoStack.length === 0) return;
    set({
      objects:   redoStack[0],
      history:   [...history, objects],
      redoStack: redoStack.slice(1),
    });
  },

  // ─── AÇÕES: OBJETOS ──────────
  addObject: (obj) => {
    const { objects, saveHistory } = get();
    saveHistory();
    set({ objects: [...objects, { ...obj, id: obj.id || Date.now() }] });
  },

  removeObject: (id) => {
    const { saveHistory } = get();
    saveHistory();
    set((s) => ({
      objects:    s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  updateObject: (id, changes) => {
    set((s) => ({
      objects: s.objects.map((o) =>
        o.id === id ? { ...o, ...changes } : o
      ),
    }));
  },

  duplicateObject: (id) => {
    const { objects, saveHistory } = get();
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    saveHistory();
    const copy = { ...obj, id: Date.now(), x: obj.x + 1, y: obj.y + 1 };
    set({ objects: [...objects, copy], selectedId: copy.id });
  },

  clearCanvas: () => {
    const { saveHistory } = get();
    saveHistory();
    set({ objects: [], selectedId: null });
  },

  setObjects: (objects) => set({ objects }),

  // ─── AÇÕES: INFORMAÇÕES DA SALA ──────────
  updateRoomInfo: (changes) =>
    set((s) => ({ roomInfo: { ...s.roomInfo, ...changes } }),
  ),

  // ─── GETTERS (valores derivados) ──────────
  getCapacity: () => {
    const { objects } = get();
    return objects
      .filter((o) => o.kind === "seat")
      .reduce((acc, o) => {
        const t = o.seatType || "standard";
        acc[t]   = (acc[t]   || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      }, {});
  },

  getSelectedObject: () => {
    const { objects, selectedId } = get();
    return objects.find((o) => o.id === selectedId) || null;
  },

  getSeatsByStatus: () => {
    const { objects } = get();
    return objects
      .filter((o) => o.kind === "seat")
      .reduce((acc, o) => {
        const s = o.status || "available";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
  },
}));