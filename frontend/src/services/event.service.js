import api from "./api";

const eventService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/events${query ? `?${query}` : ""}`);
  },

  getById: (id) => api.get(`/events/${id}`),

  create: (data) => api.post("/events", data),

  update: (id, data) => api.put(`/events/${id}`, data),

  remove: (id) => api.delete(`/events/${id}`),

  addTicket: (id, data) => api.post(`/events/${id}/tickets`, data),

  getSeatMap: (id) => api.get(`/events/${id}/seat-map`),
};

export default eventService;