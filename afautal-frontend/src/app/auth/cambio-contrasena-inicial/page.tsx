"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function FirstPasswordChangePage() {
  const router = useRouter();
  const { isAuthenticated, isTemporaryPassword, loading, completeFirstPasswordChange, logout } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/inicio-sesion");
      return;
    }

    if (!isTemporaryPassword) {
      router.replace("/dashboard/perfil");
    }
  }, [isAuthenticated, isTemporaryPassword, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("La confirmacion de contraseña no coincide.");
      return;
    }

    setSubmitting(true);

    try {
      await completeFirstPasswordChange(newPassword);
      router.replace("/dashboard/perfil");
    } catch (changeError) {
      const message = changeError instanceof Error ? changeError.message : "No fue posible cambiar la contraseña.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Cambio inicial de contraseña</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Debes actualizar tu contraseña temporal para continuar.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
              placeholder="Nueva contraseña"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
              placeholder="Confirmar nueva contraseña"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BF0F0F] hover:bg-[#A61B26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0F0F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Actualizando..." : "Actualizar contraseña"}
            </button>
            <button
              type="button"
              onClick={logout}
              className="group relative w-full flex justify-center py-2 px-4 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              Cerrar sesion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
