import api from "./api";

const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),

  getFinancial: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/dashboard/financial${query ? `?${query}` : ""}`);
  },

  getOccupancy: () => api.get("/dashboard/occupancy"),
};

export default dashboardService;