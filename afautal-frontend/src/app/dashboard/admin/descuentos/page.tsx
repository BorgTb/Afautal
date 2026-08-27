"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminGate } from "@/components/shared/admin-gate";
import {
  MESES,
  parseDescuentosExcel,
  importarDescuentos,
  fetchPeriodosCargados,
  DescuentosConflictError,
  type ExcelParseResult,
  type PeriodoCargado,
  type DescuentoRow,
} from "@/lib/descuentos";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Loader2,
  Save,
  Download,
  ShieldCheck,
} from "lucide-react";

const formatearRutCuerpo = (rut: string): string => {
  return rut.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatoMonto = (monto: number): string => {
  return `$${monto.toLocaleString("es-CL")}`;
};

const nombrePeriodo = (anio: number, mes: number): string =>
  `${MESES[mes - 1] ?? mes} ${anio}`;

export default function AdminDescuentosPage() {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const fechaActual = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(fechaActual.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(fechaActual.getFullYear());

  const [parsed, setParsed] = useState<ExcelParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [periodosCargados, setPeriodosCargados] = useState<PeriodoCargado[]>([]);
  const [conflictPeriodos, setConflictPeriodos] = useState<PeriodoCargado[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPeriodos = useCallback(async () => {
    if (!token) return;
    try {
      setPeriodosCargados(await fetchPeriodosCargados(token));
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => {
    loadPeriodos();
  }, [loadPeriodos]);

  const handleFile = async (file: File) => {
    setParsing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setConflictPeriodos([]);

    try {
      const result = await parseDescuentosExcel(file);
      setParsed(result);
    } catch (e) {
      setParsed(null);
      setErrorMsg(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    } finally {
      setParsing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const registrosConPeriodo = (): DescuentoRow[] | null => {
    if (!parsed) return null;
    if (mesSeleccionado < 1 || mesSeleccionado > 12 || anioSeleccionado < 2000 || anioSeleccionado > 2100) {
      return null;
    }
    return parsed.registros.map((r) => ({
      ...r,
      anio: anioSeleccionado,
      mes: mesSeleccionado,
    }));
  };

  const handleSubmit = async (sobrescribir: boolean) => {
    if (!token || !parsed) return;

    const registros = registrosConPeriodo();
    if (!registros) {
      setErrorMsg("Indica el mes y año del archivo antes de subirlo.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await importarDescuentos(token, registros, sobrescribir);
      setSuccessMsg(
        `Se importaron ${res.insertados} registros para ${nombrePeriodo(anioSeleccionado, mesSeleccionado)}${
          res.reemplazados ? " (sobrescribiendo datos existentes)." : "."
        }`
      );
      setParsed(null);
      setConflictPeriodos([]);
      loadPeriodos();
    } catch (e) {
      if (e instanceof DescuentosConflictError) {
        setConflictPeriodos(e.periodosExistentes);
        setErrorMsg(e.message);
      } else {
        setErrorMsg(e instanceof Error ? e.message : "Hubo un error al importar los descuentos.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminGate>
      <div className="mx-auto max-w-6xl space-y-10 pb-20 text-black">
        <header className="flex items-end justify-between border-b pb-6">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-black text-gray-900">
              <FileSpreadsheet className="text-[#BF0F0F]" size={40} />
              Administración de Descuentos
            </h1>
            <p className="mt-1 font-medium text-gray-500">
              Sube el archivo de solicitud de descuentos del mes, previsualiza los datos y publícalos a los trabajadores.
            </p>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#BF0F0F] ring-1 ring-inset ring-red-600/20 sm:inline-flex">
            <ShieldCheck size={16} />
            Sólo admin
          </span>
        </header>

        {/* Mensajes */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={22} />
            <div>
              <p className="font-black text-red-800">{errorMsg}</p>
              {conflictPeriodos.length > 0 && (
                <p className="mt-1 text-sm font-medium text-red-700">
                  Periodos con datos: {conflictPeriodos.map((p) => nombrePeriodo(p.anio, p.mes)).join(", ")}.
                  Si continúas, estos datos serán reemplazados.
                </p>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
            <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={22} />
            <p className="font-black text-green-800">{successMsg}</p>
          </div>
        )}

        {/* Período del archivo */}
        <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-gray-800">
              <CalendarDays size={20} className="text-[#BF0F0F]" />
              Período del archivo
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Indica el mes y año al que corresponden los descuentos del archivo.
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-black text-gray-800 outline-none focus:border-[#BF0F0F]"
            >
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-black text-gray-800 outline-none focus:border-[#BF0F0F]"
            >
              {Array.from({ length: 21 }, (_, i) => fechaActual.getFullYear() - 10 + i).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Área de subida */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            dragging
              ? "border-[#BF0F0F] bg-red-50"
              : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleInputChange}
          />
          {parsing ? (
            <Loader2 className="mx-auto mb-3 animate-spin text-[#BF0F0F]" size={40} />
          ) : (
            <UploadCloud className={`mx-auto mb-3 ${dragging ? "text-[#BF0F0F]" : "text-gray-300"}`} size={40} />
          )}
          <p className="text-lg font-black text-gray-700">
            {parsing ? "Leyendo archivo..." : "Arrastra tu Excel aquí o haz clic para seleccionarlo"}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-400">
            Formato esperado: hoja con las columnas &quot;NRO. PERSONAL&quot; (RUT), &quot;APELLIDO NOMBRE&quot;,
            &quot;Cuota Asociación&quot; y &quot;Seguro Salud&quot; de la solicitud de descuentos del mes. La fila de
            totales se descarta automáticamente.
          </p>
        </section>

        {/* Previsualización */}
        {parsed && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-xl">
              <div className="flex flex-col gap-3 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-black text-gray-800">
                    <CheckCircle2 size={20} className="text-green-600" />
                    {parsed.filename}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {parsed.totalRegistros.toLocaleString("es-CL")} registros para{" "}
                    <span className="font-black text-gray-700">
                      {nombrePeriodo(anioSeleccionado, mesSeleccionado)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || !registrosConPeriodo()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#BF0F0F] px-6 py-3 font-black text-white shadow-lg transition-all hover:bg-red-800 active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  {submitting
                    ? "Subiendo..."
                    : `Subir ${parsed.totalRegistros.toLocaleString("es-CL")} registros`}
                </button>
              </div>

              {/* Resumen del archivo */}
              <div className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                  <CalendarDays size={16} />
                  Resumen del archivo
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Registros</th>
                        <th className="px-4 py-3 text-right">Suma cuota asociación</th>
                        <th className="px-4 py-3 text-right">Suma seguro de salud</th>
                        <th className="px-4 py-3 text-right">Total descuentos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-bold text-gray-800">
                          {parsed.totalRegistros.toLocaleString("es-CL")}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-gray-900">
                          {formatoMonto(parsed.sumas.cuota)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-gray-900">
                          {formatoMonto(parsed.sumas.seguro)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-gray-900">
                          {formatoMonto(parsed.sumas.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detalle */}
              <div className="border-t p-6">
                <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-gray-400">
                  Detalle de registros
                </h3>
                <div className="max-h-[480px] overflow-auto rounded-xl border border-gray-100">
                  <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-4 py-3">RUT</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Unidad</th>
                        <th className="px-4 py-3 text-right">Cuota asociación</th>
                        <th className="px-4 py-3 text-right">Seguro de salud</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsed.registros.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50/60">
                          <td className="whitespace-nowrap px-4 py-2.5 font-mono font-bold text-gray-700">
                            {formatearRutCuerpo(r.rut)}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-gray-700">{r.nombre_completo}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">{r.unidad}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-gray-700">
                            {formatoMonto(r.cuota_asociacion)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-gray-700">
                            {formatoMonto(r.seguro_salud)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-right font-black text-gray-900">
                            {formatoMonto(r.monto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmación de sobrescritura */}
              {conflictPeriodos.length > 0 && (
                <div className="flex flex-col gap-4 border-t-4 border-amber-400 bg-amber-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={22} />
                    <div>
                      <p className="font-black text-amber-900">Ya existen datos para estos periodos</p>
                      <p className="mt-1 text-sm font-medium text-amber-800">
                        {conflictPeriodos.map((p) => `${nombrePeriodo(p.anio, p.mes)} (${p.total.toLocaleString("es-CL")} registros)`).join(", ")}. Se reemplazarán los datos anteriores de esos meses.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      onClick={() => {
                        setConflictPeriodos([]);
                        setErrorMsg(null);
                      }}
                      className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-black text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-black text-white shadow-lg transition-all hover:bg-amber-700 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {submitting ? "Subiendo..." : "Sobrescribir"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Periodos cargados */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-800">
            <CalendarDays size={20} className="text-gray-400" />
            Periodos cargados
          </h2>
          {periodosCargados.length === 0 ? (
            <p className="mt-4 text-sm font-medium italic text-gray-400">Aún no se han cargado descuentos.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              {periodosCargados.map((p) => (
                <div
                  key={`${p.anio}-${p.mes}`}
                  className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3"
                >
                  <CheckCircle2 size={18} className="text-green-600" />
                  <div>
                    <p className="text-sm font-black text-gray-800">{nombrePeriodo(p.anio, p.mes)}</p>
                    <p className="text-xs font-bold text-gray-500">{p.total.toLocaleString("es-CL")} registros</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="flex items-center gap-2 text-sm font-medium text-gray-400">
          <Download size={16} />
          Los datos son informativos para los trabajadores: cada uno verá sus montos en &quot;Mis descuentos&quot; del área privada.
        </p>
      </div>
    </AdminGate>
  );
}