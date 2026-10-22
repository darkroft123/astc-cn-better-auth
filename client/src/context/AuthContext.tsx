import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { jwtDecode } from "jwt-decode";

type JwtUser = {
  role?: string;
  email?: string;
  username?: string;
  userId?: string;
  exp?: number;
  iat?: number;
};

interface AuthContextValue {
  token: string | null;
  user: JwtUser | null;
  role: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log("🟢 [AUTH] Provider init");

  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    const t = localStorage.getItem(TOKEN_KEY);

    console.log("📦 [AUTH] Initial token from storage:", t);

    return t;
  });

  // 🔓 decode JWT
  const user = useMemo<JwtUser | null>(() => {
    if (!token) {
      console.log("⚠️ [AUTH] No token to decode");
      return null;
    }

    try {
      const decoded = jwtDecode<JwtUser>(token);

      console.log("🧠 [AUTH] Decoded JWT:", decoded);

      return decoded;
    } catch (err) {
      console.error("❌ [AUTH] Invalid JWT:", err);
      return null;
    }
  }, [token]);

  const role = user?.role ?? null;

  // 💾 sync storage
  useEffect(() => {
    if (!token) {
      console.log("🧹 [AUTH] Removing token from storage");
      localStorage.removeItem(TOKEN_KEY);
    } else {
      console.log("💾 [AUTH] Saving token to storage");
      localStorage.setItem(TOKEN_KEY, token);
    }
  }, [token]);

  // 🔁 sync between tabs / microfrontends
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        console.log("🔁 [AUTH] Storage event detected:", e.newValue);

        setTokenState(e.newValue);
      }
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 🔐 validation
  const isAuthenticated = useMemo(() => {
    if (!token) {
      console.log("❌ [AUTH] No token");
      return false;
    }

    if (!user?.exp) {
      console.log("❌ [AUTH] No exp in token");
      return false;
    }

    const now = Date.now() / 1000;

    const valid = user.exp > now;

    console.log("⏱ [AUTH] Exp:", user.exp, "Now:", now);
    console.log("✅ [AUTH] Is valid session:", valid);

    return valid;
  }, [token, user]);

  const logout = () => {
    console.log("🚪 [AUTH] Logout triggered");

    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      role,
      isAuthenticated,
      setToken: (t: string) => {
        console.log("🔐 [AUTH] setToken called");
        setTokenState(t);
      },
      logout,
    }),
    [token, user, role, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
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