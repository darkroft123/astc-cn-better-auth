import { FormEvent, useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { useLogin } from "@/features/auth/application/useLogin";
import { useTheme } from "@/context/ThemeContext";
import { LogIn, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { login, loading, error } = useLogin();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isDark = theme === "dark";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("🚀 LOGIN CLICKED");
    await login({
      email,
      password,
    });
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-[#050816] dark:via-[#0b1026] dark:to-[#050816] dark:text-white">

      {/* 🌓 BOTÓN CAMBIO DE TEMA FLOTANTE */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm dark:bg-white/10 dark:border-white/15 dark:text-white dark:hover:bg-white/15 backdrop-blur-md cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Tema claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Tema oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* 🌌 BACKGROUND ORBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/15 dark:bg-purple-600/30 blur-[140px] rounded-full top-[-200px] left-[-200px] animate-pulse max-md:w-[300px] max-md:h-[300px] max-md:top-[-100px] max-md:left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-500/15 dark:bg-blue-600/30 blur-[140px] rounded-full bottom-[-150px] right-[-150px] animate-pulse max-md:w-[250px] max-md:h-[250px] max-md:bottom-[-75px] max-md:right-[-75px]" />
        <div className="absolute w-[400px] h-[400px] bg-cyan-400/10 dark:bg-cyan-400/20 blur-[140px] rounded-full top-[40%] left-[40%] animate-ping max-md:hidden" />
      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md px-6 z-10">
        <div className="backdrop-blur-3xl bg-white/85 border border-slate-200/80 shadow-2xl shadow-slate-200/50 dark:bg-white/5 dark:border-white/10 dark:shadow-2xl rounded-3xl p-8 sm:p-10 transition-colors duration-300">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <LogIn className="text-white w-7 h-7" />
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-wide text-slate-900 dark:text-white">
              Asistencia Laboral
            </h1>

            <p className="text-sm mt-1 text-slate-500 dark:text-white/60">
              Inicia sesión para continuar
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                Correo Electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                className="h-12 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30 dark:focus:border-purple-500 dark:focus:ring-purple-500/30 rounded-xl transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30 dark:focus:border-purple-500 dark:focus:ring-purple-500/30 rounded-xl transition"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-300 text-sm bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-200 dark:border-red-500/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-medium shadow-lg shadow-blue-500/25 transition cursor-pointer"
            >
              {loading ? "Iniciando sesión..." : "Entrar"}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-6 text-xs text-slate-400 dark:text-white/40">
            Sistema de control de asistencia · Joyit ASTC
          </div>

        </div>
      </div>
    </main>
  );
}
