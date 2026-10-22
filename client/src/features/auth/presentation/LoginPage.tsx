import { FormEvent, useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { useLogin } from "@/features/auth/application/useLogin";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    console.log("🚀 LOGIN CLICKED");

    await login({
      email,
      password,
    });
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#050816] via-[#0b1026] to-[#050816]">

      {/* 🌌 BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-purple-600/30 blur-[140px] rounded-full top-[-200px] left-[-200px] animate-pulse max-md:w-[300px] max-md:h-[300px] max-md:top-[-100px] max-md:left-[-100px]" />

        <div className="absolute w-[500px] h-[500px] bg-blue-600/30 blur-[140px] rounded-full bottom-[-150px] right-[-150px] animate-pulse max-md:w-[250px] max-md:h-[250px] max-md:bottom-[-75px] max-md:right-[-75px]" />

        <div className="absolute w-[400px] h-[400px] bg-cyan-400/20 blur-[140px] rounded-full top-[40%] left-[40%] animate-ping max-md:hidden" />
      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md px-6">

        <div className="backdrop-blur-3xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-10">

          {/* HEADER */}
          <div className="text-center mb-8">

            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LogIn className="text-white w-7 h-7" />
            </div>

            <h1 className="mt-5 text-3xl font-semibold text-white tracking-wide">
              Asistencia Laboral
            </h1>

            <p className="text-white/50 text-sm mt-1">
              Inicia sesión para continuar
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <Input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="correo@empresa.com"
              className="h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
            />

            <Input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition"
            />

            {error && (
              <div className="text-red-300 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/20 transition"
            >
              {loading
                ? "Iniciando..."
                : "Entrar"}
            </Button>

          </form>

          {/* FOOTER */}
          <div className="text-center mt-6 text-white/30 text-xs">
            Sistema de control de asistencia
          </div>

        </div>
      </div>
    </main>
  );
}