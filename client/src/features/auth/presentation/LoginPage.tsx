import { FormEvent, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/application/useLogin";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loading, error } = useLogin();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-200 bg-[#f5f6fa] text-[#11131c] dark:bg-[#080a12] dark:text-[#eef0f6]">
      {/* 🌓 BOTÓN CAMBIO DE TEMA FLOTANTE */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 border border-border bg-card/90 text-foreground hover:bg-accent shadow-xs backdrop-blur-md cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span>Tema oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* 🌌 FONDOS SUTILES DEL DESIGN SYSTEM */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#5b8cff]/10 to-[#a855f7]/10 dark:from-[#5b8cff]/15 dark:to-[#a855f7]/15 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#a855f7]/10 to-[#0e9fc0]/10 dark:from-[#a855f7]/15 dark:to-[#22c3e6]/15 blur-[120px] rounded-full bottom-[-100px] right-[-100px] animate-pulse" />
      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md z-10">
        <Card className="border border-border bg-card shadow-lg shadow-black/5 dark:shadow-2xl rounded-2xl transition-colors duration-200">
          {/* HEADER */}
          <CardHeader className="text-center pt-8 pb-4 space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/15 overflow-hidden transition-transform duration-200 hover:scale-105">
              <img
                src="/icon.svg"
                alt="ASTC Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Asistencia Laboral
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Inicia sesión para continuar en la plataforma
              </CardDescription>
            </div>
          </CardHeader>

          {/* FORM */}
          <CardContent className="pt-2 pb-6 px-6 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground/90 ml-0.5"
                >
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  required
                  autoComplete="email"
                  className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground/90 ml-0.5"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl border border-destructive/20 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5b8cff] to-[#a855f7] hover:opacity-95 text-white font-semibold shadow-md shadow-purple-500/20 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>

          {/* FOOTER */}
          <CardFooter className="justify-center pb-6 pt-0 text-xs text-muted-foreground">
            Sistema de control de asistencia · Joy IT ASTC
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
