import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { clearStoredToken, getStoredToken, setStoredToken } from "../api/client";
import type { UserResponse } from "../types";

const CONSENT_KEY = "svechka_consent_accepted";

interface AuthContextValue {
  user: UserResponse | null;
  loading: boolean;
  hasConsented: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  acceptConsent: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasConsented, setHasConsented] = useState(() => localStorage.getItem(CONSENT_KEY) === "true");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearStoredToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token } = await authApi.login(email, password);
    setStoredToken(token);
    setUser(await authApi.me());
  }

  async function register(email: string, password: string) {
    const { token } = await authApi.register(email, password);
    setStoredToken(token);
    setUser(await authApi.me());
  }

  function logout() {
    clearStoredToken();
    setUser(null);
  }

  function acceptConsent() {
    localStorage.setItem(CONSENT_KEY, "true");
    setHasConsented(true);
  }

  async function refreshUser() {
    setUser(await authApi.me());
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, hasConsented, login, register, logout, acceptConsent, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
