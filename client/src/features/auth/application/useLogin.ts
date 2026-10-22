import { useState, useCallback } from "react";
import { loginApi } from "@/features/auth/infrastructure/auth.api";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { ROLE_ROUTES } from "@/utils/roleRoutes";

type JwtPayload = {
  role?: string;
  exp?: number;
};
export function useLogin() {
  const { setToken } = useAuth();

  const [state, setState] = useState({
    loading: false,
    error: null as string | null,
  });

  const login = useCallback(async (input: { email: string; password: string }) => {
    const startTime = Date.now();
    console.log("[AUTH PERF] Login request started");

    setState({ loading: true, error: null });

    try {
      const { token, user } = await loginApi(input);

      if (!token) throw new Error("No se recibió token");

      console.log("[AUTH PERF] Credentials validated");
      console.log("[AUTH PERF] JWT generated");

      localStorage.setItem("auth_token", token);
      setToken(token);
      console.log("[AUTH PERF] Session created");

      const decoded = jwtDecode<{ role?: string }>(token);
      console.log("[AUTH PERF] User profile loaded");

      const role = decoded.role ?? user?.role?.code;
      if (!role) throw new Error("Rol no encontrado");

      const redirectUrl = ROLE_ROUTES[role];
      if (!redirectUrl) throw new Error(`Sin ruta para el rol: ${role}`);

      console.log("[AUTH PERF] Redirect started");
      const redirectStartTime = Date.now();
      const totalLoginTime = redirectStartTime - startTime;
      console.log(`[AUTH PERF] Total login time (before redirect) = ${totalLoginTime} ms`);

      // IMPORTANTE: set loading OFF ANTES de salir
      setState({ loading: false, error: null });

      // pequeño delay para que React pinte UI antes del redirect
      setTimeout(() => {
        window.location.assign(
          `${redirectUrl}/?token=${encodeURIComponent(token)}&loginStart=${startTime}&redirectStart=${redirectStartTime}`
        );
      }, 0);

      return true;
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "Error de inicio de sesión",
      });

      return false;
    }
  }, [setToken]);

  return { login, ...state };
}