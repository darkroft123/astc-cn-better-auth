import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "auth_token";

export const tokenService = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },

  isValid(token: string | null): boolean {
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);

      const now = Date.now() / 1000;

      return decoded.exp > now; // 🔥 valida expiración real
    } catch {
      return false;
    }
  },
};