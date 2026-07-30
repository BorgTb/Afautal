import PanelHeader from "../PanelHeader";

const FICTICIO_DEUDAS = [
  { concepto: "Cuota social", periodo: "Julio 2026", monto: "$ 15.000", estado: "Pagada" },
  { concepto: "Aporte extraordinario", periodo: "Junio 2026", monto: "$ 8.000", estado: "Pagada" },
  { concepto: "Cuota social", periodo: "Agosto 2026", monto: "$ 15.000", estado: "Pendiente" },
  { concepto: "Seguro colectivo", periodo: "Julio 2026", monto: "$ 3.500", estado: "Pagada" },
];

export default function DeudasPanel() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="portal-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Resumen personal</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-300">
            Datos ficticios
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                  Concepto
                </th>
                <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                  Periodo
                </th>
                <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                  Monto
                </th>
                <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {FICTICIO_DEUDAS.map((item, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-semibold text-slate-900">{item.concepto}</td>
                  <td className="px-2.5 py-3 text-sm text-slate-600">{item.periodo}</td>
                  <td className="px-2.5 py-3 text-sm text-right font-bold text-slate-900">{item.monto}</td>
                  <td className="px-2.5 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                      item.estado === "Pagada"
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-amber-50 text-amber-700 ring-amber-600/20"
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-400 italic">Los montos y estados mostrados son ficticios y no representan deudas reales.</p>
      </div>

      <div className="portal-card">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Certificados y pagos</h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          Descargue un certificado de situación o regularice obligaciones pendientes cuando el
          módulo esté habilitado.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Próximamente"
            className="portal-btn-secondary"
          >
            Descargar certificado PDF
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Próximamente"
            className="portal-btn-light"
          >
            Informar un pago
          </button>
        </div>
      </div>
    </div>
  );
}
