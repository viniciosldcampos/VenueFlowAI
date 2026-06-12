import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import authService from "../services/auth.service";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = authService.getUser();
      const token     = authService.getToken();

      if (savedUser && token) {
        try {
          const data = await authService.me();
          setUser(data.user);
        } catch {
          authService.logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const data = await authService.register(name, email, password, phone);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    localStorage.setItem("venueflow_user", JSON.stringify(updated));
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin:         user?.role === "ADMIN",
    isOperator:      user?.role === "ADMIN" || user?.role === "OPERATOR",
    isClient:        user?.role === "CLIENT",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}