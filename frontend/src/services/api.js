const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// ─── HELPER: obter token do localStorage ─────────────────────────────────────
const getToken = () => localStorage.getItem("venueflow_token");

// ─── HELPER: headers padrão ───────────────────────────────────────────────────
const getHeaders = (isFormData = false) => {
  const headers = {};
  const token   = getToken();

  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token)       headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

// ─── HELPER: tratar resposta ──────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro desconhecido");
  }

  return data;
};

// ─── MÉTODOS HTTP ─────────────────────────────────────────────────────────────
const api = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  "POST",
      headers: getHeaders(),
      body:    JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  "PUT",
      headers: getHeaders(),
      body:    JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export default api;
