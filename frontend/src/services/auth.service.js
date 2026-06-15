import api from "./api";

const TOKEN_KEY = "venueflow_token";
const USER_KEY  = "venueflow_user";

const authService = {
  // ── login ──
  login: async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
    return data;
  },

  // ── registro ──
  register: async (name, email, password, phone) => {
    const data = await api.post("/auth/register", { name, email, password, phone });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
    return data;
  },

  // ── logout ──
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/login";
  },

  // ── usuário logado ──
  me: async () => {
    return api.get("/auth/me");
  },

  // ── alterar senha ──
  changePassword: async (currentPassword, newPassword) => {
    return api.put("/auth/change-password", { currentPassword, newPassword });
  },

  // ── getters locais ──
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser:  () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
  isAdmin:    () => {
    const user = authService.getUser();
    return user?.role === "ADMIN";
  },
  isOperator: () => {
    const user = authService.getUser();
    return user?.role === "ADMIN" || user?.role === "OPERATOR";
  },
};

export default authService;