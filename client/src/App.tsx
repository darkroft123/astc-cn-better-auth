import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "@/pages/AppRouter";
import { AuthProvider } from "@/context/AuthContext";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </TooltipProvider>
);

export default App;
