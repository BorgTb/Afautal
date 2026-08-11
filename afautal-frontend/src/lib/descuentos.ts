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
  unidad: string;
  anio: number;
  mes: number;
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

export interface ExcelParseResult {
  filename: string;
  registros: DescuentoRow[];
  periodos: PeriodoInfo[];
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

function parsePeriodo(value: string | number): { anio: number; mes: number } | null {
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})(\d{2})$/);
  if (!match) return null;

  const anio = Number(match[1]);
  const mes = Number(match[2]);
  if (anio < 2000 || anio > 2100 || mes < 1 || mes > 12) return null;
  return { anio, mes };
}

/**
 * Parsea un Excel de descuentos en formato pivote (1 fila por trabajador,
 * columnas por periodo YYYYMM). Devuelve los registros normalizados
 * (rut, mes, año, monto) agrupables por periodo.
 */
export async function parseDescuentosExcel(file: File): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("El archivo no contiene hojas.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("El archivo está vacío.");
  }

  // Localizar la fila de encabezados ("Número de personal")
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const a = String(row[0] ?? "").trim();
    const b = String(row[1] ?? "").trim();
    if (a.toLowerCase().includes("texto expl") && b.toLowerCase().includes("número de personal")) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(
      "No se encontró la fila de encabezados. Verifica que el archivo tenga las columnas 'Texto expl.CC-nómina', 'Número de personal', 'Apellido Nombre' y una o más columnas de periodo (YYYYMM)."
    );
  }

  const headerRow = rows[headerIndex] ?? [];
  const periodos: { index: number; anio: number; mes: number }[] = [];

  for (let c = 3; c < headerRow.length; c++) {
    const p = parsePeriodo(headerRow[c]);
    if (p) {
      periodos.push({ index: c, ...p });
    }
  }

  if (periodos.length === 0) {
    throw new Error(
      "No se encontraron columnas de periodo (formato YYYYMM) en el encabezado. Se esperan columnas como 202601, 202602, etc."
    );
  }

  const registros: DescuentoRow[] = [];
  let unidadActual = "";

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];

    const a = String(row[0] ?? "").trim();
    const b = row[1] ?? "";
    const c = String(row[2] ?? "").trim();

    // Fila de totales ("Total general") o fin de los datos
    if (a.toLowerCase().startsWith("total")) break;
    if (b === "" && c === "") continue;

    const rut = normalizeRutBody(b);
    if (!rut) continue;

    if (a) unidadActual = a;

    for (const p of periodos) {
      const raw = row[p.index];
      if (raw === "" || raw === null || raw === undefined) continue;

      const monto = Number(raw);
      if (!Number.isFinite(monto) || monto <= 0) continue;

      registros.push({
        rut,
        nombre_completo: c,
        unidad: unidadActual,
        anio: p.anio,
        mes: p.mes,
        monto,
      });
    }
  }

  if (registros.length === 0) {
    throw new Error("No se pudo extraer ningún registro del archivo.");
  }

  // Resumen por periodo
  const resumen = new Map<string, PeriodoInfo>();
  for (const r of registros) {
    const key = `${r.anio}-${r.mes}`;
    const info = resumen.get(key) ?? {
      anio: r.anio,
      mes: r.mes,
      nombre: MESES[r.mes - 1] ?? String(r.mes),
      cant: 0,
      suma: 0,
    };
    info.cant += 1;
    info.suma += r.monto;
    resumen.set(key, info);
  }

  return {
    filename: file.name,
    registros,
    periodos: Array.from(resumen.values()).sort(
      (x, y) => x.anio - y.anio || x.mes - y.mes
    ),
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