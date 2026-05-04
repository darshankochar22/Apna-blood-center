"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_EMAIL    = "admin@bloodcenter.in";
const ADMIN_PASSWORD = "blood@123";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("crm_auth");
    if (stored === "true") setIsLoggedIn(true);
  }, []);

  function login(email: string, password: string): boolean {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem("crm_auth", "true");
      return true;
    }
    return false;
  }

  function logout() {
    setIsLoggedIn(false);
    localStorage.removeItem("crm_auth");
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}