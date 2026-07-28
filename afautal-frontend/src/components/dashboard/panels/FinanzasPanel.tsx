export default function FinanzasPanel() {
  const ejecucionItems = [
    { label: "Gastos ejecutados", porcentaje: 0 },
    { label: "Beneficios ejecutados", porcentaje: 0 },
    { label: "Administración ejecutada", porcentaje: 0 },
  ];

  return (
    <div>
      <div className="portal-callout">
        El estado de situación financiera de la Asociación estará disponible cuando se complete la
        integración con el sistema contable. Los datos se mostrarán de forma agregada y segura.
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="portal-card">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Estado de ingresos y gastos</h3>
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
                <tr>
                  <td colSpan={2} className="px-2.5 py-10 text-center text-sm text-slate-500">
                    Sin datos disponibles por el momento.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="portal-card">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Ejecución presupuestaria</h3>
          {ejecucionItems.map((item) => (
            <div key={item.label} className="mb-5 last:mb-0">
              <p className="mb-2 text-sm text-slate-600">
                {item.label}: {item.porcentaje}%
              </p>
              <div className="portal-progress">
                <span style={{ width: `${item.porcentaje}%` }} />
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Próximamente"
            className="portal-btn-light mt-6"
          >
            Descargar rendición detallada
          </button>
        </div>
      </div>
    </div>
  );
}
