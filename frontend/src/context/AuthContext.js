import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
  clearAuthStorage,
  getAuthToken,
  getStoredUser,
  persistAuth,
} from "../services/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    const bootstrapUser = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await api.get("/Auth/me");
        setUser(response.data.user);
        persistAuth(token, response.data.user);
      } catch (error) {
        clearAuthStorage();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapUser();
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/Auth/login", credentials);
    persistAuth(response.data.token, response.data.user);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
