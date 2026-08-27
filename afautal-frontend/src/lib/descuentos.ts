import * as XLSX from "xlsx";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export interface DescuentoRow {
  rut: string;
  nombre_completo: string;
  mail: string;
  division: string;
  unidad: string;
  anio: number;
  mes: number;
  cuota_asociacion: number;
  seguro_salud: number;
  monto: number;
}

export interface Descuento extends DescuentoRow {
  id: number;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeriodoInfo {
  anio: number;
  mes: number;
  nombre: string;
  cant: number;
  suma: number;
}

export interface PeriodoCargado {
  anio: number;
  mes: number;
  total: number;
}

export interface MesEstadoFinanciero {
  anio: number;
  mes: number;
  cuota: number;
  seguro: number;
  monto: number;
  registros: number;
}

export interface AnioEstadoFinanciero {
  anio: number;
  cuota: number;
  seguro: number;
  monto: number;
  registros: number;
}

export interface EstadoFinanciero {
  meses: MesEstadoFinanciero[];
  totalesPorAnio: AnioEstadoFinanciero[];
  totalesGlobales: AnioEstadoFinanciero;
}

export interface SumasDescuento {
  cuota: number;
  seguro: number;
  total: number;
}

export interface ExcelParseResult {
  filename: string;
  registros: DescuentoRow[];
  sumas: SumasDescuento;
  totalRegistros: number;
}

/**
 * Normaliza el cuerpo de un RUT (sin dígito verificador) a su forma canónica,
 * sin ceros a la izquierda. Soporta con o sin dígito verificador:
 * "9545383", "09193027", "10030300-8".
 * Ej: 10030300 -> "10030300", 09193027 -> "9193027", 10030300-8 -> "10030300".
 */
export function normalizeRutBody(value: string | number): string {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  const cuerpo = digits.length > 8 ? digits.slice(0, -1) : digits;
  return cuerpo.replace(/^0+/, "") || "";
}

const normalizarTexto = (value: unknown): string => {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const numeroDe = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

interface CabeceraEncontrada {
  sheetName: string;
  rows: string[][];
  headerIndex: number;
  cols: Record<string, number>;
}

const localizarCabecera = (rows: unknown[][]): CabeceraEncontrada | null => {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i] ?? [];
    const norm = row.map(normalizarTexto);

    const colNro = norm.findIndex((c) => c.includes("nro") && c.includes("personal"));
    const colApellido = norm.findIndex((c) => c.includes("apellido"));
    const colCuota = norm.findIndex((c) => c.includes("cuota"));

    if (colNro === -1 || colApellido === -1 || colCuota === -1) continue;

    const cols: Record<string, number> = {};
    norm.forEach((c, idx) => {
      if (!c) return;
      if (c.includes("nro") && c.includes("personal")) cols.nro = idx;
      else if (c.includes("apellido")) cols.apellido = idx;
      else if (c.includes("mail")) cols.mail = idx;
      else if (c.includes("division")) cols.division = idx;
      else if (c.includes("unidad")) cols.unidad = idx;
      else if (c.includes("cuota")) cols.cuota = idx;
      else if (c.includes("seguro")) cols.seguro = idx;
      else if (c.includes("total")) cols.total = idx;
    });

    return { sheetName: "", rows: rows as string[][], headerIndex: i, cols };
  }

  return null;
};

/**
 * Parsea un Excel de "Solicitud de descuentos" (un mes por archivo):
 * una fila por trabajador con columnas "NRO. PERSONAL" (RUT), "APELLIDO NOMBRE",
 * "MAIL", "DIVISION SUPERIOR", "UNIDAD PERTENCIA", "Cuota Asociación",
 * "Seguro Salud" y "Total descuentos". Se selecciona automáticamente la hoja
 * que contiene los montos y se descartan las filas de totales.
 */
export async function parseDescuentosExcel(file: File): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  if (workbook.SheetNames.length === 0) {
    throw new Error("El archivo no contiene hojas.");
  }

  const candidatas: CabeceraEncontrada[] = [];

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    const cabecera = localizarCabecera(rows);
    if (cabecera) {
      candidatas.push({ ...cabecera, sheetName: name });
    }
  }

  if (candidatas.length === 0) {
    throw new Error(
      "No se encontró la fila de encabezados. Verifica que el archivo tenga las columnas 'NRO. PERSONAL', 'APELLIDO NOMBRE' y 'Cuota Asociación'."
    );
  }

  // Priorizar la hoja que tenga montos (cuota o seguro mayor a 0), como Hoja2;
  // la hoja estructural sin montos (Hoja1) queda descartada.
  const conMontos = candidatas.find((c) =>
    c.rows.slice(c.headerIndex + 1).some((row) => {
      const cuota = numeroDe(row[c.cols.cuota]);
      const seguro = numeroDe(row[c.cols.seguro]);
      return cuota > 0 || seguro > 0;
    })
  );
  const elegida = conMontos ?? candidatas[0];

  const { rows, headerIndex, cols } = elegida;
  const registros: DescuentoRow[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];

    const rut = normalizeRutBody(row[cols.nro]);
    if (!rut) continue;

    const cuota = numeroDe(row[cols.cuota]);
    const seguro = numeroDe(row[cols.seguro]);
    const totalCol = numeroDe(row[cols.total]);
    const monto = totalCol > 0 ? totalCol : cuota + seguro;

    if (monto <= 0 && cuota <= 0 && seguro <= 0) continue;

    registros.push({
      rut,
      nombre_completo: String(row[cols.apellido] ?? "").trim(),
      mail: String(row[cols.mail] ?? "").trim(),
      division: String(row[cols.division] ?? "").trim(),
      unidad: String(row[cols.unidad] ?? "").trim(),
      anio: 0,
      mes: 0,
      cuota_asociacion: cuota,
      seguro_salud: seguro,
      monto,
    });
  }

  if (registros.length === 0) {
    throw new Error("No se pudo extraer ningún registro del archivo.");
  }

  const sumas: SumasDescuento = registros.reduce(
    (acc, r) => ({
      cuota: acc.cuota + r.cuota_asociacion,
      seguro: acc.seguro + r.seguro_salud,
      total: acc.total + r.monto,
    }),
    { cuota: 0, seguro: 0, total: 0 }
  );

  return {
    filename: file.name,
    registros,
    sumas,
    totalRegistros: registros.length,
  };
}

export interface ConflictErrorData {
  mensaje?: string;
  periodos_existentes: PeriodoCargado[];
}

export class DescuentosConflictError extends Error {
  periodosExistentes: PeriodoCargado[];

  constructor(message: string, periodosExistentes: PeriodoCargado[]) {
    super(message);
    this.name = "DescuentosConflictError";
    this.periodosExistentes = periodosExistentes;
  }
}

export async function importarDescuentos(
  token: string,
  registros: DescuentoRow[],
  sobrescribir: boolean
): Promise<{ insertados: number; periodos: PeriodoInfo[]; reemplazados: boolean }> {
  const res = await fetch(`${STRAPI_URL}/api/descuentos/importar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ registros, sobrescribir }),
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 409) {
    const data = body?.data ?? {};
    throw new DescuentosConflictError(
      data.mensaje || "Ya existen descuentos para los periodos del archivo.",
      data.periodos_existentes ?? []
    );
  }

  if (!res.ok) {
    throw new Error(body?.error?.message || body?.data?.mensaje || "No se pudieron importar los descuentos.");
  }

  return body.data;
}

export async function fetchMisDescuentos(token: string): Promise<Descuento[]> {
  const res = await fetch(`${STRAPI_URL}/api/descuentos/mios`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("No se pudieron obtener tus descuentos.");

  const body = await res.json();
  return body.data ?? [];
}

export async function fetchPeriodosCargados(token: string): Promise<PeriodoCargado[]> {
  const res = await fetch(`${STRAPI_URL}/api/descuentos/periodos`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("No se pudieron obtener los periodos cargados.");

  const body = await res.json();
  return body.data ?? [];
}

export async function fetchEstadoFinanciero(token: string): Promise<EstadoFinanciero> {
  const res = await fetch(`${STRAPI_URL}/api/descuentos/estado`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("No se pudo obtener el estado financiero.");

  const body = await res.json();
  return body.data ?? {
    meses: [],
    totalesPorAnio: [],
    totalesGlobales: { anio: 0, cuota: 0, seguro: 0, monto: 0, registros: 0 },
  };
}