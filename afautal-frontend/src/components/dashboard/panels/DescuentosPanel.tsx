"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MESES, fetchMisDescuentos, type Descuento } from "@/lib/descuentos";
import { CalendarDays, Inbox, Loader2, Wallet } from "lucide-react";
import PanelHeader from "../PanelHeader";

const formatoMonto = (monto: number): string => {
  return `$${monto.toLocaleString("es-CL")}`;
};

const cuotaDe = (d: Descuento): number => d.cuota_asociacion ?? 0;
const seguroDe = (d: Descuento): number => d.seguro_salud ?? 0;

export default function DescuentosPanel() {
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

  const mesDe = (anio: number, mes: number) => {
    return descuentos.find((d) => d.anio === anio && d.mes === mes);
  };

  return (
    <div className="portal-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelHeader
          title="Mis descuentos"
          subtitle="Detalle informativo de tus descuentos mensuales."
        />
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-black text-[#BF0F0F] ring-1 ring-inset ring-red-600/20">
          <Wallet size={16} />
          Total: {formatoMonto(totalGeneral)}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-[#BF0F0F]" size={32} />
        </div>
      ) : descuentos.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
          <Inbox className="mx-auto mb-4 text-slate-300" size={48} />
          <p className="text-lg font-black text-slate-700">Aún no tienes descuentos registrados</p>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Cuando la administración cargue los descuentos de tu RUT, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {gruposPorAnio.map(({ anio, meses }) => {
            const descuentosAnio = descuentos.filter((d) => d.anio === anio);
            const totalAnio = descuentosAnio.reduce((acc, d) => acc + d.monto, 0);
            const sumaCuotaAnio = descuentosAnio.reduce((acc, d) => acc + cuotaDe(d), 0);
            const sumaSeguroAnio = descuentosAnio.reduce((acc, d) => acc + seguroDe(d), 0);

            return (
              <div key={anio} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
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
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-3">Mes</th>
                      <th className="px-6 py-3 text-right">Cuota asociación</th>
                      <th className="px-6 py-3 text-right">Seguro de salud</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {meses.map((mes) => {
                      const d = mesDe(anio, mes);
                      return (
                        <tr key={mes} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-bold text-slate-700 capitalize">{MESES[mes - 1]}</td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-600">
                            {d ? formatoMonto(cuotaDe(d)) : "-"}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-600">
                            {d ? formatoMonto(seguroDe(d)) : "-"}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">
                            {d ? formatoMonto(d.monto) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/40">
                      <td className="px-6 py-3 font-black text-slate-800">Total {anio}</td>
                      <td className="px-6 py-3 text-right font-black text-slate-800">{formatoMonto(sumaCuotaAnio)}</td>
                      <td className="px-6 py-3 text-right font-black text-slate-800">{formatoMonto(sumaSeguroAnio)}</td>
                      <td className="px-6 py-3 text-right font-black text-[#BF0F0F]">{formatoMonto(totalAnio)}</td>
                    </tr>
                  </tfoot>
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
  );
}