"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { validateConnection } from "@/lib/services";

interface AuthContextType {
  token: string | null;
  gistId: string | null;
  loading: boolean;
  login: (t: string, g: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [gistId, setGistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing credentials when the app loads
    const savedToken = localStorage.getItem("fintrack_gh_token");
    const savedGist = localStorage.getItem("fintrack_gist_id");
    
    if (savedToken && savedGist) {
      setToken(savedToken);
      setGistId(savedGist);
    }
    setLoading(false);
  }, []);

  const login = async (newToken: string, newGist: string) => {
    try {
      // Test the connection before saving it locally
      await validateConnection(newToken, newGist);
      
      localStorage.setItem("fintrack_gh_token", newToken);
      localStorage.setItem("fintrack_gist_id", newGist);
      setToken(newToken);
      setGistId(newGist);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("fintrack_gh_token");
    localStorage.removeItem("fintrack_gist_id");
    setToken(null);
    setGistId(null);
  };

  return (
    <AuthContext.Provider value={{ token, gistId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
