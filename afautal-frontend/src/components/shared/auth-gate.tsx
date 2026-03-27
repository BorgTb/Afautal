"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isTemporaryPassword, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthArea = pathname.startsWith("/auth");
    const inDashboard = pathname.startsWith("/dashboard");

    if (isAuthenticated && isTemporaryPassword && pathname !== "/auth/cambio-contrasena-inicial") {
      router.replace("/auth/cambio-contrasena-inicial");
      return;
    }

    if (!isAuthenticated && inDashboard) {
      router.replace("/auth/inicio-sesion");
      return;
    }

    if (isAuthenticated && !isTemporaryPassword && inAuthArea && pathname !== "/auth/inicio-sesion") {
      router.replace("/dashboard/perfil");
    }
  }, [isAuthenticated, isTemporaryPassword, loading, pathname, router]);

  return <>{children}</>;
}
