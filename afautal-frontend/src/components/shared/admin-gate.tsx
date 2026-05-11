"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AdminGate protects client-side components and pages.
 * It checks if the user is authenticated and has the 'admin' role.
 */
export function AdminGate({ children, fallback }: AdminGateProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role?.type === "admin";

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      // If not authenticated or not admin, redirect to dashboard
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BF0F0F] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return fallback || null;
  }

  return <>{children}</>;
}
