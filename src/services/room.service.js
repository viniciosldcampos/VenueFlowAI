import api from "./api";

const roomService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/rooms${query ? `?${query}` : ""}`);
  },

  getById: (id) => api.get(`/rooms/${id}`),

  create: (data) => api.post("/rooms", data),

  update: (id, data) => api.put(`/rooms/${id}`, data),

  remove: (id) => api.delete(`/rooms/${id}`),

  saveLayout: (id, layout) => api.put(`/rooms/${id}/layout`, { layout }),

  getSectors: (id) => api.get(`/rooms/${id}/sectors`),

  createSector: (id, data) => api.post(`/rooms/${id}/sectors`, data),
};

export default roomService;