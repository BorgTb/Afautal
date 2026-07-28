export type MetricSummary = {
  cuotasEstado: string | null;
  cuotasNota: string | null;
  conveniosActivos: number | null;
  conveniosNota: string | null;
  ingresosAcumulados: string | null;
  ingresosNota: string | null;
  saldoDisponible: string | null;
  saldoNota: string | null;
};

export type DeudaRow = {
  concepto: string;
  periodo: string;
  monto: string;
  estado: "pagada" | "pendiente" | "sin_cargo";
};

export type FinanzaRow = {
  cuenta: string;
  acumulado: string;
  esTotal?: boolean;
};

export type EjecucionPresupuestaria = {
  label: string;
  porcentaje: number;
};

export async function fetchMetricSummary(_token: string): Promise<MetricSummary | null> {
  return null;
}

export async function fetchDeudas(_token: string): Promise<DeudaRow[] | null> {
  return null;
}

export async function fetchFinanzas(_token: string): Promise<{
  ingresosGastos: FinanzaRow[];
  ejecucion: EjecucionPresupuestaria[];
} | null> {
  return null;
}
