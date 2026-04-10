"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const PASSWORD_KEY = "edgeledger_auth";
const PASS_HASH_KEY = "edgeledger_passhash";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  hasPassword: boolean;
  login: (password: string) => boolean;
  setPassword: (password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Simple hash function (not cryptographic, but good enough for local protection)
const hashPassword = (pass: string): string => {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return String(hash);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    const authed = sessionStorage.getItem(PASSWORD_KEY) === "true";
    const stored = localStorage.getItem(PASS_HASH_KEY);
    setIsAuthenticated(authed);
    setHasPassword(!!stored);
    setLoading(false);
  }, []);

  const login = (password: string): boolean => {
    const stored = localStorage.getItem(PASS_HASH_KEY);
    if (!stored) return false;
    if (hashPassword(password) === stored) {
      sessionStorage.setItem(PASSWORD_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const setPassword = (password: string) => {
    localStorage.setItem(PASS_HASH_KEY, hashPassword(password));
    sessionStorage.setItem(PASSWORD_KEY, "true");
    setHasPassword(true);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(PASSWORD_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, hasPassword, login, setPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
