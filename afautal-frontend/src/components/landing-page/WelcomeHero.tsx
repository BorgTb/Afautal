"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { loginRut, fetchExternalClientData } from "@/lib/auth";
import { AlertCircle, Loader2 } from "lucide-react";

export default function WelcomeHero() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
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
      const message = err instanceof Error ? err.message : "";
      if (message === "Contraseña incorrecta.") {
        setError(message);
      } else {
        const externalData = await fetchExternalClientData(cleanRut);
        if (externalData) {
          window.location.href = "/auth/registro";
        } else {
          setError(message || "Error al iniciar sesión.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="relative px-5 py-[68px] text-white"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(191,15,15,.22), transparent 28%), linear-gradient(135deg, #521818, #bf0f0f)",
      }}
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-10 items-center">
        <div>
          <span className="inline-flex px-[9px] py-[5px] rounded-full text-[12px] font-extrabold bg-[#BF0F0F]/30 text-red-200">
            Nuevo portal de servicios
          </span>
          <h1 className="text-[44px] leading-[1.08] font-bold mt-[18px] mb-[18px]">
            Información, beneficios y transparencia en un solo lugar.
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#dce9f4] max-w-[720px]">
            Portal institucional y privado para que las y los asociados de AFAUTAL
            puedan acceder a convenios, revisar cuotas y deudas, consultar documentos
            y conocer en línea la situación financiera de la Asociación.
          </p>
          <div className="flex gap-3 flex-wrap mt-[26px]">
            <Link
              href="/auth/inicio-sesion"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-[11px] font-bold bg-white text-[#BF0F0F] hover:bg-red-50 transition-all"
            >
              Ingresar al portal
            </Link>
             <Link
              href="/auth/registro"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-[11px] font-bold bg-white text-[#BF0F0F] hover:bg-red-50 transition-all"
            >
              Asóciate
            </Link>

            <Link
              href="/nosotros"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-[11px] font-bold bg-white/10 border border-white/25 text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              Conocer AFAUTAL
            </Link>
           
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white/15 border border-white/25 rounded-[16px] p-6 backdrop-blur-md">
            <h3 className="text-white text-lg font-bold mt-0 mb-3">Acceso seguro</h3>
            <p className="text-[#dce9f4] text-sm mb-3">
              Ingreso mediante tus credenciales AFAUTAL.
            </p>

            {error && (
              <div className="mb-3 p-2.5 bg-red-500/20 border border-red-400/40 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-200" />
                <span className="text-red-100 font-medium">{error}</span>
              </div>
            )}

            <input
              placeholder="Rut"
              value={rut}
              onChange={(e) => setRut(e.target.value.replace(/[^0-9kK]/g, "").slice(0, 9))}
              className="w-full px-3 py-3 rounded-[9px] border border-white/30 bg-white/25 text-white placeholder-white/70 mb-2 text-sm outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 rounded-[9px] border border-white/30 bg-white/25 text-white placeholder-white/70 mb-[14px] text-sm outline-none focus:ring-2 focus:ring-white/50"
            />
            <p className="text-[#dce9f4] text-xs mb-3 -mt-2">
              Si es tu primer ingreso, tu contraseña son los últimos 4 dígitos de tu RUT.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-center rounded-[10px] px-4 py-[11px] font-bold bg-white text-[#BF0F0F] hover:bg-red-50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
