import { Button } from "@/components/atoms/Button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Panel</h1>
          <Button variant="secondary" onClick={handleLogout} className="hidden md:inline-flex">
            Cerrar sesión
          </Button>
        </div>
        <section className="rounded-lg border border-border bg-card p-4 md:p-6 text-card-foreground">
          <h2 className="text-lg font-medium">Bienvenido de vuelta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Has iniciado sesión correctamente.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
            {token}
          </pre>
        </section>
      </div>
    </main>
  );
}