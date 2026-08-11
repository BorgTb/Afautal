"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthGate from "@/components/shared/auth-gate";
import { MESES, fetchMisDescuentos, type Descuento } from "@/lib/descuentos";
import { Receipt, CalendarDays, Wallet, Loader2, Inbox } from "lucide-react";

const formatoMonto = (monto: number): string => {
  return `$${monto.toLocaleString("es-CL")}`;
};

export default function MisDescuentosPage() {
  const { token } = useAuth();
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchMisDescuentos(token)
      .then(setDescuentos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const gruposPorAnio = useMemo(() => {
    const anios = new Map<number, number[]>();
    for (const d of descuentos) {
      const lista = anios.get(d.anio) ?? [];
      if (!lista.includes(d.mes)) lista.push(d.mes);
      anios.set(d.anio, lista);
    }
    return Array.from(anios.entries())
      .map(([anio, meses]) => ({ anio, meses: meses.sort((a, b) => a - b) }))
      .sort((a, b) => b.anio - a.anio);
  }, [descuentos]);

  const totalGeneral = useMemo(
    () => descuentos.reduce((acc, d) => acc + d.monto, 0),
    [descuentos]
  );

  const montoDelMes = (anio: number, mes: number) => {
    const encontrado = descuentos.find((d) => d.anio === anio && d.mes === mes);
    return encontrado?.monto ?? 0;
  };

  return (
    <AuthGate>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 border-b-4 border-[#BF0F0F]">
          <div className="h-24 bg-gradient-to-r from-red-900 via-red-700 to-red-600 sm:h-28"></div>
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-8 border-white bg-white shadow-2xl">
                  <Receipt className="text-[#BF0F0F]" size={36} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">Mis descuentos</h1>
                  <p className="text-sm font-bold text-red-700">Detalle informativo de tus descuentos mensuales</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-black text-[#BF0F0F] ring-1 ring-inset ring-red-600/20">
                <Wallet size={16} />
                Total: {formatoMonto(totalGeneral)}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="animate-spin text-[#BF0F0F]" size={32} />
          </div>
        ) : descuentos.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl ring-1 ring-slate-200">
            <Inbox className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-lg font-black text-slate-700">Aún no tienes descuentos registrados</p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Cuando la administración cargue los descuentos de tu RUT, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {gruposPorAnio.map(({ anio, meses }) => {
              const totalAnio = descuentos
                .filter((d) => d.anio === anio)
                .reduce((acc, d) => acc + d.monto, 0);

              return (
                <div key={anio} className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-gray-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-black text-gray-900">
                      <CalendarDays size={18} className="text-[#BF0F0F]" />
                      Año {anio}
                    </h2>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                      {formatoMonto(totalAnio)}
                    </span>
                  </div>
                  <table className="w-full border-collapse text-left">
                    <tbody className="divide-y divide-slate-100">
                      {meses.map((mes) => (
                        <tr key={mes} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-bold text-slate-700 capitalize">{MESES[mes - 1]}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">
                            {formatoMonto(montoDelMes(anio, mes))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            <p className="text-center text-xs font-medium italic text-slate-400">
              Esta información es meramente informativa. Ante dudas, contacta a administración.
            </p>
          </div>
        )}
      </div>
    </AuthGate>
  );
}