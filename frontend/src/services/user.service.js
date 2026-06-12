import api from "./api";

const userService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/users${query ? `?${query}` : ""}`);
  },

  getById: (id) => api.get(`/users/${id}`),

  create: (data) => api.post("/users", data),

  update: (id, data) => api.put(`/users/${id}`, data),

  remove: (id) => api.delete(`/users/${id}`),

  updateProfile: (data) => api.put("/users/profile", data),
};

export default userService;