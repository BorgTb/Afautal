"use client";

import Link from "next/link";

export default function WelcomeHero() {
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

        <div className="bg-white/15 border border-white/25 rounded-[16px] p-6 backdrop-blur-md">
          <h3 className="text-white text-lg font-bold mt-0 mb-3">Acceso seguro</h3>
          <p className="text-[#dce9f4] text-sm mb-3">
            Ingreso mediante tus credenciales AFAUTAL.
          </p>
          <input
            readOnly
            placeholder="Rut"
            className="w-full px-3 py-3 rounded-[9px] border border-white/30 bg-white/25 text-white placeholder-white/70 mb-2 text-sm outline-none focus:ring-2 focus:ring-white/50"
          />
          <input
            readOnly
            type="password"
            placeholder="Contraseña"
            className="w-full px-3 py-3 rounded-[9px] border border-white/30 bg-white/25 text-white placeholder-white/70 mb-[14px] text-sm outline-none focus:ring-2 focus:ring-white/50"
          />
          <Link
            href="/auth/inicio-sesion"
            className="block w-full text-center rounded-[10px] px-4 py-[11px] font-bold bg-white text-[#BF0F0F] hover:bg-red-50 transition-all"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </section>
  );
}
