import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/presentation/LoginPage";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/features/auth/presentation/ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}