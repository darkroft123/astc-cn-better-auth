import { FormEvent, useState, useEffect } from "react";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // El login siempre es light por defecto
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await login({
      email,
      password,
    });
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#f5f6fa] text-[#11131c]">
      {/* Fondos sutiles del design system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#5b8cff]/10 to-[#a855f7]/10 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#a855f7]/10 to-[#0e9fc0]/10 blur-[120px] rounded-full bottom-[-100px] right-[-100px] animate-pulse" />
      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md z-10">
        <Card className="border border-slate-200/80 bg-white shadow-xl shadow-black/5 rounded-2xl">
          {/* HEADER */}
          <CardHeader className="text-center pt-8 pb-4 space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/15 overflow-hidden transition-transform duration-200 hover:scale-105">
              <img
                src="/icon.svg"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Asistencia Laboral
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
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
                  className="text-xs font-semibold text-slate-700 ml-0.5"
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
                  className="h-11 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:-webkit-text-fill-color-[#11131c]"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 ml-0.5"
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
                    className="h-11 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 pr-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:-webkit-text-fill-color-[#11131c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
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
          <CardFooter className="justify-center pb-6 pt-0 text-xs text-slate-500 font-medium">
            Sistema de control de asistencia
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
