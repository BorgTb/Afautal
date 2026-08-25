import Link from "next/link";
import type { CSSProperties } from "react";
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

interface MediaNode {
    url?: string;
    alternativeText?: string | null;
    attributes?: {
        url?: string;
        alternativeText?: string | null;
    };
}

interface NoticiaPayload {
    id?: number;
    documentId?: string;
    titulo_noticia?: string;
    cuerpo_noticia?: string;
    foto_portada_noticia?: NewsMediaValue;
    foto_noticia?: NewsMediaValue;
    autor_noticia?: string;
    fecha_publicacion?: string;
    noticia_principal?: boolean;
    attributes?: {
        titulo_noticia?: string;
        cuerpo_noticia?: string;
        foto_portada_noticia?: NewsMediaValue;
        foto_noticia?: NewsMediaValue;
        autor_noticia?: string;
        fecha_publicacion?: string;
        noticia_principal?: boolean;
    };
}

function stripMarkdown(text?: string): string {
    if (!text) return "";
    return text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[`*_>#-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function truncateText(text?: string, max = 180): string {
    const clean = stripMarkdown(text);
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max).trimEnd()}...`;
}

function normalizeText(text?: string): string {
    return stripMarkdown(text);
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

function isVideoUrl(url: string): boolean {
    const videoExtensions = [".mp4", ".mov", ".avi", ".webm", ".mkv"];
    const videoDomains = ["youtube.com", "youtu.be", "vimeo.com", "dailymotion.com"];

    const lowerUrl = url.toLowerCase();

    // Check by extension
    for (const ext of videoExtensions) {
        if (lowerUrl.endsWith(ext)) return true;
    }

    // Check by domain
    for (const domain of videoDomains) {
        if (lowerUrl.includes(domain)) return true;
    }

    return false;
}

function getNewsMediaType(field: NewsMediaValue): "image" | "video" {
    const media = extractFirstMedia(field);
    if (!media) return "image";

    if (isVideoUrl(media.url ?? "")) return "video";
    if (media.attributes?.url && isVideoUrl(media.attributes.url)) return "video";

    return "image";
}

function getNewsImage(field: NewsMediaValue, coverField: NewsMediaValue): { url: string; type: "image" | "video"; alt: string } {
    const cover = extractFirstMedia(coverField);
    const media = extractFirstMedia(field);

    const url = (media?.url ?? media?.attributes?.url ?? (cover?.url ?? cover?.attributes?.url));
    const type = getNewsMediaType(field);
    const alt = getNewsAlt(field, "Imagen de la noticia");

    const displayUrl = url ? getStrapiMediaURL(url) : "/hero-noticia.jpg";

    return { url: displayUrl, type, alt };
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

export default async function NewsPage() {
    const result = await getCollectionType<NoticiaPayload>(
        "noticias",
        "populate[foto_portada_noticia]=true&populate[foto_noticia]=true&sort=noticia_principal:desc&sort=fecha_publicacion:desc"
    ).catch(() => ({ data: [] as NoticiaPayload[] }));

    const noticias = result.data;

    return (
        <div className="mx-auto max-w-7xl px-6 py-16">
            <h1 className="news-reveal text-4xl font-bold leading-tight text-slate-900 md:text-5xl">Noticias</h1>
            <p className="news-reveal news-delay-1 mt-6 text-lg leading-relaxed text-slate-600">
                Aquí encontrarás las últimas noticias y novedades sobre nuestra organización, eventos, actividades y temas de interés para nuestros asociados.
            </p>

            {noticias.length === 0 ? (
                <p className="mt-12 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700">
                    Aún no hay noticias publicadas.
                </p>
            ) : (
                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {noticias.map((item, index) => {
                        const source = item.attributes ?? item;
                        const mediaField = source.foto_noticia;
                        const mediaType = getNewsMediaType(mediaField);
                        const titulo = source.titulo_noticia ?? `Noticia ${index + 1}`;
                        const descripcionCompleta = normalizeText(source.cuerpo_noticia);
                        const descripcion = truncateText(descripcionCompleta, 180);
                        const autor = source.autor_noticia?.trim();
                        const fecha = formatDate(source.fecha_publicacion);
                        const meta = [autor, fecha].filter(Boolean).join(" • ");
                        const newsId = String(item.documentId ?? item.id ?? `noticia-${index}`);

                        const mediaInfo = mediaType === "video"
                            ? { type: "video", url: "", alt: getNewsAlt(mediaField, titulo) }
                            : getNewsImage(source.foto_noticia, source.foto_portada_noticia);

                        return (
                            <article
                                key={newsId}
                                className="news-card-reveal overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                                style={{ "--stagger": `${index * 90}ms` } as CSSProperties}
                            >
                                {mediaType === "video" ? (
                                    <video
                                        src={mediaInfo.url || "/hero-noticia.mp4"}
                                        className="h-48 w-full object-cover"
                                        controls
                                        autoPlay
                                        muted
                                    />
                                ) : (
                                    <img
                                        src={mediaInfo.url}
                                        alt={mediaInfo.alt}
                                        className="h-48 w-full object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    {source.noticia_principal && (
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#BF0F0F]">Noticia principal</p>
                                    )}
                                    <h2 className="text-2xl font-semibold text-slate-900">{titulo}</h2>
                                    {meta && <p className="mt-2 text-sm text-slate-500">{meta}</p>}
                                    {descripcion && <p className="mt-4 text-slate-600">{descripcion}</p>}
                                    <Link
                                        href={`/news/${newsId}`}
                                        className="mt-6 inline-flex px-4 py-2 border-2 border-[#BF0F0F] text-[#BF0F0F] font-bold hover:bg-[#A61B26] hover:text-white transition-all uppercase tracking-widest text-sm"
                                    >
                                        Ver mas
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}