"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MESES, fetchEstadoFinanciero, type EstadoFinanciero } from "@/lib/descuentos";
import { CalendarDays, Inbox, Loader2, Wallet } from "lucide-react";

const formatoMonto = (monto: number): string => {
  return `$${monto.toLocaleString("es-CL")}`;
};

export default function FinanzasPanel() {
  const { token } = useAuth();
  const [estado, setEstado] = useState<EstadoFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!token) return;
    fetchEstadoFinanciero(token)
      .then((data) => {
        setEstado(data);
        const anios = data.totalesPorAnio.map((a) => a.anio);
        if (anios.length > 0 && !anios.includes(new Date().getFullYear())) {
          setAnioSeleccionado(Math.max(...anios));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const aniosDisponibles = useMemo(() => {
    if (!estado) return [];
    return estado.totalesPorAnio.map((a) => a.anio).sort((a, b) => b - a);
  }, [estado]);

  const anioActual = estado?.totalesPorAnio.find((a) => a.anio === anioSeleccionado);

  const mesesDelAnio = useMemo(() => {
    if (!estado) return [];
    return estado.meses.filter((m) => m.anio === anioSeleccionado);
  }, [estado, anioSeleccionado]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="animate-spin text-[#BF0F0F]" size={32} />
      </div>
    );
  }

  if (!estado || estado.totalesGlobales.monto <= 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
        <Inbox className="mx-auto mb-4 text-slate-300" size={48} />
        <p className="text-lg font-black text-slate-700">Aún no hay descuentos cargados</p>
        <p className="mt-1 text-sm font-medium text-slate-400">
          Cuando la administración cargue los descuentos mensuales, aquí se mostrarán los ingresos y egresos de la
          Asociación.
        </p>
      </div>
    );
  }

  const totales = estado.totalesGlobales;
  const egresosAnio = 0;
  const egresosGlobales = 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Estado de ingresos y egresos</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Información real generada desde los descuentos cargados por mes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <Wallet size={16} />
          Datos reales
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Estado del año seleccionado */}
        <div className="portal-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CalendarDays size={18} className="text-[#BF0F0F]" />
              Ingresos {anioSeleccionado}
            </h3>
            {aniosDisponibles.length > 1 && (
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-black text-gray-800 outline-none focus:border-[#BF0F0F]"
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                    Cuenta
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                    Acumulado
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-medium text-slate-900">Cuotas sociales</td>
                  <td className="px-2.5 py-3 text-right text-sm font-bold text-green-700">
                    {formatoMonto(anioActual?.cuota ?? 0)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-medium text-slate-900">Seguro de salud</td>
                  <td className="px-2.5 py-3 text-right text-sm font-bold text-green-700">
                    {formatoMonto(anioActual?.seguro ?? 0)}
                  </td>
                </tr>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-bold text-slate-900">Total ingresos</td>
                  <td className="px-2.5 py-3 text-right text-sm font-bold text-green-700">
                    {formatoMonto(anioActual?.monto ?? 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                    Egreso
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                    Acumulado
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-medium text-slate-500">Beneficios a asociados</td>
                  <td className="px-2.5 py-3 text-right text-sm font-bold text-slate-400">{formatoMonto(egresosAnio)}</td>
                </tr>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-bold text-slate-900">Total egresos</td>
                  <td className="px-2.5 py-3 text-right text-sm font-bold text-red-700">{formatoMonto(egresosAnio)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs font-medium italic text-slate-400">
              Aún no se registran egresos: se publicarán cuando exista información de beneficios.
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-blue-100 bg-blue-50">
            <p className="text-sm font-bold text-blue-800">
              Saldo neto {anioSeleccionado}:{" "}
              <span className="text-green-700">{formatoMonto((anioActual?.monto ?? 0) - egresosAnio)}</span>
            </p>
          </div>
        </div>

        {/* Resumen histórico + detalle mensual */}
        <div className="space-y-5">
          <div className="portal-card">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Ingresos acumulados (histórico)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total ingresos</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatoMonto(totales.monto)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Cuotas sociales</p>
                <p className="mt-1 text-lg font-black text-emerald-800">{formatoMonto(totales.cuota)}</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-4 ring-1 ring-sky-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Seguro de salud</p>
                <p className="mt-1 text-lg font-black text-sky-800">{formatoMonto(totales.seguro)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registros cargados</p>
                <p className="mt-1 text-lg font-black text-slate-900">{totales.registros.toLocaleString("es-CL")}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium italic text-slate-400">
              Saldo neto histórico: {formatoMonto(totales.monto - egresosGlobales)} (sin egresos registrados).
            </p>
          </div>

          <div className="portal-card">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <CalendarDays size={18} className="text-[#BF0F0F]" />
              Desglose mensual {anioSeleccionado}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                      Mes
                    </th>
                    <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                      Cuota
                    </th>
                    <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                      Seguro
                    </th>
                    <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mesesDelAnio.map((m) => (
                    <tr key={m.mes} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-2.5 py-3 font-bold text-slate-700 capitalize">{MESES[m.mes - 1]}</td>
                      <td className="px-2.5 py-3 text-right font-semibold text-slate-600">{formatoMonto(m.cuota)}</td>
                      <td className="px-2.5 py-3 text-right font-semibold text-slate-600">{formatoMonto(m.seguro)}</td>
                      <td className="px-2.5 py-3 text-right font-black text-slate-900">{formatoMonto(m.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}