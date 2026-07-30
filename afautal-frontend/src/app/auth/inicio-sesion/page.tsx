"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { loginRut } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isTemporaryPassword, loading } = useAuth();

  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = isTemporaryPassword ? "/auth/completar-registro" : "/dashboard";
    }
  }, [isAuthenticated, isTemporaryPassword, loading]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanRut = rut.replace(/[^0-9kK]/g, "");
    if (cleanRut.length < 5) {
      setError("Ingresa un RUT válido.");
      return;
    }

    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginRut(cleanRut, password);
      localStorage.setItem("afautal-auth", JSON.stringify({
        token: result.jwt,
        user: result.user,
      }));

      if ((result.user as any).telefono || (result.user as any).direccion_particular || (result.user as any).ciud_nombre) {
        localStorage.setItem("afautal-external-data", JSON.stringify({
          telefono: (result.user as any).telefono || "",
          direccion_particular: (result.user as any).direccion_particular || "",
          ciud_nombre: (result.user as any).ciud_nombre || "",
        }));
      }

      window.location.href = "/auth/completar-registro";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-3 border border-gray-400 rounded-lg shadow-sm focus:ring-[#BF0F0F] focus:border-[#BF0F0F] text-black bg-white placeholder-gray-500 font-medium transition-all outline-none";
  const labelClasses = "block text-sm font-black text-gray-800 mb-1";

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div
        ref={cardRef}
        className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Bienvenido</h2>
          <p className="mt-3 text-gray-600 font-medium">
            Ingresá tu RUT para acceder
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm font-bold rounded shadow-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="rut" className={labelClasses}>RUT (Sin puntos ni guión)</label>
              <input
                id="rut"
                type="text"
                required
                value={rut}
                onChange={(e) => setRut(e.target.value.replace(/[^0-9kK]/g, "").slice(0, 9))}
                className={inputClasses}
                placeholder="Ej: 123456789"
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClasses}>Contraseña</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="Ingresa tu contraseña"
              />
              <p className="mt-1.5 text-xs text-gray-500">Si es tu primer ingreso, tu contraseña son los últimos 4 dígitos de tu RUT.</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-3.5 px-4 bg-[#BF0F0F] text-white rounded-lg shadow-xl hover:bg-[#A61B26] font-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 border-t border-gray-100 pt-5">
          <p className="text-gray-600 font-bold text-sm">
            ¿Aún no eres socio?{" "}
            <Link href="/auth/registro" className="text-[#BF0F0F] font-black hover:underline ml-1">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
