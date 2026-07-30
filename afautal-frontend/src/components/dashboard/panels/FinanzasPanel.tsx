const FICTICIO_INGRESOS = [
  { cuenta: "Ingresos por cuotas sociales", monto: "$ 18.500.000" },
  { cuenta: "Aportes extraordinarios", monto: "$ 3.200.000" },
  { cuenta: "Convenios y servicios", monto: "$ 2.100.000" },
  { cuenta: "Otros ingresos", monto: "$ 650.000" },
];

const FICTICIO_GASTOS = [
  { cuenta: "Beneficios a asociados", monto: "$ 12.800.000" },
  { cuenta: "Gastos administrativos", monto: "$ 5.400.000" },
  { cuenta: "Gastos operacionales", monto: "$ 2.100.000" },
  { cuenta: "Otros gastos", monto: "$ 950.000" },
];

export default function FinanzasPanel() {
  const ejecucionItems = [
    { label: "Gastos ejecutados", porcentaje: 72 },
    { label: "Beneficios ejecutados", porcentaje: 68 },
    { label: "Administración ejecutada", porcentaje: 54 },
  ];

  return (
    <div>
      <div className="portal-callout">
        Estos valores son ilustrativos y no representan la situación financiera real de la Asociación. Se actualizarán cuando se complete la integración con el sistema contable.
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="portal-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Estado de ingresos y gastos</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-300">
              Datos ficticios
            </span>
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
                {FICTICIO_INGRESOS.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-2.5 py-3 text-sm font-medium text-slate-900">{item.cuenta}</td>
                    <td className="px-2.5 py-3 text-sm text-right font-bold text-green-700">{item.monto}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-bold text-slate-900">Total ingresos</td>
                  <td className="px-2.5 py-3 text-sm text-right font-bold text-green-700">$ 24.450.000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">
                    Gasto
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-3 text-right text-xs font-bold uppercase text-slate-500">
                    Acumulado
                  </th>
                </tr>
              </thead>
              <tbody>
                {FICTICIO_GASTOS.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-2.5 py-3 text-sm font-medium text-slate-900">{item.cuenta}</td>
                    <td className="px-2.5 py-3 text-sm text-right font-bold text-red-700">{item.monto}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="px-2.5 py-3 text-sm font-bold text-slate-900">Total gastos</td>
                  <td className="px-2.5 py-3 text-sm text-right font-bold text-red-700">$ 21.250.000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm font-bold text-blue-800">
              Saldo neto: <span className="text-green-700">$ 3.200.000</span>
            </p>
          </div>
        </div>

        <div className="portal-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Ejecución presupuestaria</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-300">
              Datos ficticios
            </span>
          </div>
          {ejecucionItems.map((item) => (
            <div key={item.label} className="mb-5 last:mb-0">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-slate-600">{item.label}</p>
                <p className="text-sm font-bold text-slate-800">{item.porcentaje}%</p>
              </div>
              <div className="portal-progress">
                <span style={{ width: `${item.porcentaje}%` }} />
              </div>
            </div>
          ))}
          <p className="mt-4 text-xs text-slate-400 italic">Porcentajes ficticios con fines demostrativos.</p>
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
