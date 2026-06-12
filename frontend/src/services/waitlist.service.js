import api from "./api";

const waitlistService = {
  join: (eventId, ticketType) =>
    api.post("/waitlist", { eventId, ticketType }),

  myPosition: (eventId) => api.get(`/waitlist/my-position/${eventId}`),

  leave: (id) => api.put(`/waitlist/${id}/leave`),

  getByEvent: (eventId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/waitlist/event/${eventId}${query ? `?${query}` : ""}`);
  },

  callNext: (eventId) => api.put(`/waitlist/event/${eventId}/call-next`),

  convert: (id) => api.put(`/waitlist/${id}/convert`),
};

export default waitlistService;