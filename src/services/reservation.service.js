import api from "./api";

const reservationService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/reservations${query ? `?${query}` : ""}`);
  },

  getById: (id) => api.get(`/reservations/${id}`),

  create: (data) => api.post("/reservations", data),

  confirm: (id, payment) => api.put(`/reservations/${id}/confirm`, { payment }),

  cancel: (id) => api.put(`/reservations/${id}/cancel`),

  refund: (id) => api.put(`/reservations/${id}/refund`),
};

export default reservationService;