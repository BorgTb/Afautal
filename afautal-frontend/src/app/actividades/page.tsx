import { getCollectionType, getStrapiMediaURL } from "@/lib/strapi";
import { getYear, getMonth, parseISO } from "date-fns";
import ActividadesView from "@/components/actividades/ActividadesView";
import type { CalendarActivityData } from "@/components/landing-page/CalendarActivities";

interface ActividadPayload {
  id?: number;
  documentId?: string;
  titulo?: string;
  descripcion?: string;
  fecha?: string;
  hora?: string;
  ubicacion?: string;
  tipo?: string;
  imagen?: { url?: string; alternativeText?: string } | null;
  attributes?: {
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    hora?: string;
    ubicacion?: string;
    tipo?: string;
    imagen?: { url?: string; alternativeText?: string } | null;
  };
}

function getImageData(img: unknown): { url?: string; alternativeText?: string } | null {
  if (!img) return null;
  const field = img as Record<string, unknown>;
  if (field.url) return { url: getStrapiMediaURL(field.url as string), alternativeText: field.alternativeText as string };
  const data = field.data as Record<string, unknown> | undefined;
  if (data) {
    const attrs = data.attributes as Record<string, unknown> | undefined;
    const url = (attrs?.url ?? data.url) as string | undefined;
    const alt = (attrs?.alternativeText ?? data.alternativeText) as string | undefined;
    if (url) return { url: getStrapiMediaURL(url), alternativeText: alt };
  }
  return null;
}

function mapActividadToCalendar(act: ActividadPayload): CalendarActivityData {
  const source = act.attributes ?? act;
  return {
    id: String(act.documentId ?? act.id ?? ""),
    titulo: source.titulo ?? "",
    descripcion: source.descripcion ?? "",
    fecha: source.fecha ?? "",
    hora: source.hora ?? "",
    ubicacion: source.ubicacion ?? "",
    tipo: source.tipo ?? "",
    imagen: getImageData(source.imagen),
  };
}

function countByMonth(data: CalendarActivityData[]): { month: number; year: number; count: number }[] {
  const map = new Map<string, number>();
  data.forEach((a) => {
    const d = parseISO(a.fecha);
    const key = `${getYear(d)}-${getMonth(d)}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([k, count]) => {
      const [year, month] = k.split("-").map(Number);
      return { year, month, count };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

function countByType(data: CalendarActivityData[]): { tipo: string; count: number }[] {
  const map = new Map<string, number>();
  data.forEach((a) => {
    if (a.tipo) map.set(a.tipo, (map.get(a.tipo) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);
}

export const metadata = {
  title: "Actividades — AFAUTAL",
  description: "Calendario de actividades y eventos de AFAUTAL",
};

export default async function ActividadesPage() {
  const result = await getCollectionType<ActividadPayload>(
    "actividads",
    "populate=*&sort=fecha:asc"
  );

  const data = result.data
    .map(mapActividadToCalendar)
    .filter((item) => item.id && item.titulo && item.fecha);

  const monthStats = countByMonth(data);
  const typeStats = countByType(data);
  const totalCount = data.length;

  return (
    <ActividadesView
      data={data}
      monthStats={monthStats}
      typeStats={typeStats}
      totalCount={totalCount}
    />
  );
}
