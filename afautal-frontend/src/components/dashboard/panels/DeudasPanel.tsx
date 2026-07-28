import PanelHeader from "../PanelHeader";

export default function DeudasPanel() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="portal-card">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Resumen personal</h3>
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
              <tr>
                <td colSpan={4} className="px-2.5 py-10 text-center text-sm text-slate-500">
                  La información de cuotas y deudas estará disponible próximamente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
