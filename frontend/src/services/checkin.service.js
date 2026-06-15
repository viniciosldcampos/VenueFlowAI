import api from "./api";

const checkinService = {
  doCheckin: (code, eventId, method = "QR_CODE") =>
    api.post("/checkins", { code, eventId, method }),

  getByCode: (code) => api.get(`/checkins/code/${code}`),

  getByEvent: (eventId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/checkins/event/${eventId}${query ? `?${query}` : ""}`);
  },

  myHistory: () => api.get("/checkins/my-history"),
};

export default checkinService;