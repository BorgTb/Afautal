"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isTemporaryPassword, registroIncompleto, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthArea = pathname.startsWith("/auth");
    const inDashboard = pathname.startsWith("/dashboard");
    const inDocumentos = pathname.startsWith("/documentos");

    // 1. Registro incompleto → redirigir a completar registro (antes que password_temporal)
    if (isAuthenticated && registroIncompleto && pathname !== "/auth/completar-registro") {
      router.replace("/auth/completar-registro");
      return;
    }

    // 2. Password temporal → redirigir a completar-registro (paso 3)
    if (isAuthenticated && isTemporaryPassword && !registroIncompleto && pathname !== "/auth/completar-registro") {
      router.replace("/auth/completar-registro");
      return;
    }

    // 3. No autenticado en área protegida → login
    if (!isAuthenticated && (inDashboard || inDocumentos)) {
      router.replace("/auth/inicio-sesion");
      return;
    }

    // 4. Autenticado (no temp, completo) en área de auth → dashboard
    if (isAuthenticated && !isTemporaryPassword && !registroIncompleto && inAuthArea && pathname !== "/auth/inicio-sesion") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isTemporaryPassword, registroIncompleto, loading, pathname, router]);

  return <>{children}</>;
}
