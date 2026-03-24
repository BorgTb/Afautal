import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionType, getStrapiMediaURL } from "@/lib/strapi";

interface NewsMediaAttributes {
  url?: string;
  alternativeText?: string | null;
}

interface NewsMediaField {
  data?:
    | {
        attributes?: NewsMediaAttributes;
        url?: string;
      }
    | Array<{
        attributes?: NewsMediaAttributes;
        url?: string;
      }>
    | null;
  url?: string;
  alternativeText?: string | null;
}

type NewsMediaValue = NewsMediaField | NewsMediaField[] | null | undefined;

interface NoticiaPayload {
  id?: number;
  documentId?: string;
  titulo_noticia?: string;
  cuerpo_noticia?: string;
  foto_noticia?: NewsMediaValue;
  autor_noticia?: string;
  fecha_publicacion?: string;
  noticia_principal?: boolean;
  attributes?: {
    titulo_noticia?: string;
    cuerpo_noticia?: string;
    foto_noticia?: NewsMediaValue;
    autor_noticia?: string;
    fecha_publicacion?: string;
    noticia_principal?: boolean;
  };
}

interface MediaNode {
  url?: string;
  alternativeText?: string | null;
  attributes?: {
    url?: string;
    alternativeText?: string | null;
  };
}

function stripMarkdown(text?: string): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/[`*_>#]/g, "");
}

function extractFirstMedia(field?: NewsMediaValue): MediaNode | undefined {
  if (!field) return undefined;

  if (Array.isArray(field)) {
    return extractFirstMedia(field[0]);
  }

  if (field.url || field.alternativeText) {
    return { url: field.url, alternativeText: field.alternativeText };
  }

  const rawData = field.data as unknown;

  if (Array.isArray(rawData)) {
    return (rawData[0] as MediaNode | undefined) ?? undefined;
  }

  if (rawData && typeof rawData === "object") {
    const dataObj = rawData as { attributes?: MediaNode; url?: string; alternativeText?: string | null };

    if (dataObj.attributes || dataObj.url || dataObj.alternativeText) {
      return {
        url: dataObj.url ?? dataObj.attributes?.url,
        alternativeText: dataObj.alternativeText ?? dataObj.attributes?.alternativeText,
        attributes: dataObj.attributes,
      };
    }

    if ("data" in dataObj) {
      const nested = (dataObj as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested[0] as MediaNode | undefined;
      if (nested && typeof nested === "object") return nested as MediaNode;
    }
  }

  return undefined;
}

function getNewsImage(field: NewsMediaValue): string {
  const media = extractFirstMedia(field);
  const url = media?.url ?? media?.attributes?.url;
  return getStrapiMediaURL(url) || "/hero-noticia.jpg";
}

function getNewsAlt(field: NewsMediaValue, fallback: string): string {
  const media = extractFirstMedia(field);
  return media?.alternativeText ?? media?.attributes?.alternativeText ?? fallback;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ newsId: string }>;
}) {
  const { newsId } = await params;

  const result = await getCollectionType<NoticiaPayload>(
    "noticias",
    "populate=foto_noticia&sort=noticia_principal:desc&sort=fecha_publicacion:desc&pagination[limit]=200"
  ).catch(() => ({ data: [] as NoticiaPayload[] }));

  const noticia = result.data.find((item) => String(item.documentId ?? item.id) === newsId);

  if (!noticia) {
    notFound();
  }

  const source = noticia.attributes ?? noticia;
  const titulo = source.titulo_noticia?.trim() || "Noticia";
  const cuerpo = stripMarkdown(source.cuerpo_noticia);
  const autor = source.autor_noticia?.trim();
  const fecha = formatDate(source.fecha_publicacion);
  const meta = [autor, fecha].filter(Boolean).join(" • ");

  return (
    <div className="w-full py-10 sm:py-12">
      <div className="news-reveal mx-auto w-full max-w-7xl px-6">
        <Link href="/news" className="text-sm font-semibold uppercase tracking-[0.14em] text-[#BF0F0F] hover:underline">
          Volver a noticias
        </Link>
      </div>

      <section className="news-reveal news-delay-1 mt-5 px-6">
        <div className="mx-auto w-full max-w-5xl bg-slate-50 p-2 sm:p-3">
          <img
            src={getNewsImage(source.foto_noticia)}
            alt={getNewsAlt(source.foto_noticia, titulo)}
            className="mx-auto block h-auto max-h-[80vh] w-auto max-w-full object-contain"
          />
        </div>
      </section>

      <section className="news-reveal news-delay-2 mx-auto w-full max-w-7xl px-6 py-8 sm:py-10">
        {source.noticia_principal && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#BF0F0F]">Noticia principal</p>
        )}

        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{titulo}</h1>
        {meta && <p className="mt-3 text-sm text-slate-500">{meta}</p>}
        {cuerpo && <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-700">{cuerpo}</p>}
      </section>
    </div>
  );
}
