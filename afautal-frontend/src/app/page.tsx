// src/app/page.tsx
import HeroNews from "@/components/landing-page/HeroNews";
import type { HeroNewsData } from "@/components/landing-page/HeroNews";
import AboutUs from "@/components/landing-page/AboutUs";
import MisionAndValue from "@/components/landing-page/MisionAndValue";
import Comentaries from "@/components/landing-page/Comentaries";
import type { CommentCardData } from "@/components/landing-page/Comentaries";
import Documents from "@/components/landing-page/Documents";
import { getCollectionType, getSingleType } from "@/lib/strapi";

interface StrapiImageAttributes {
  url?: string;
  alternativeText?: string | null;
}

interface AboutUsMediaField {
  data?: {
    attributes?: StrapiImageAttributes;
  } | null;
  url?: string;
  alternativeText?: string | null;
}

interface AboutUsPayload {
  titulo?: string;
  texto?: string;
  descripcion?: string;
  imagen?: AboutUsMediaField;
  foto?: AboutUsMediaField;
}

interface MisionVisionValoresPayload {
  mision?: string;
  vision?: string;
  valores?: string;
}

interface DocumentoPayload {
  id?: number;
  documentId?: string;
  nombre_doc?: string;
  categoria?: string;
  archivo?: unknown;
  fecha_de_carga?: string;
  descripcion?: string;
  attributes?: {
    nombre_doc?: string;
    categoria?: string;
    archivo?: unknown;
    fecha_de_carga?: string;
    descripcion?: string;
  };
}

interface CommentMediaAttributes {
  url?: string;
  alternativeText?: string | null;
}

interface CommentMediaField {
  data?: {
    attributes?: CommentMediaAttributes;
    url?: string;
  } | null;
  url?: string;
  alternativeText?: string | null;
}

interface ComentarioPayload {
  id?: number;
  documentId?: string;
  autor?: string;
  opinion?: string;
  foto_autor?: CommentMediaField;
  attributes?: {
    autor?: string;
    opinion?: string;
    foto_autor?: CommentMediaField;
  };
}

interface DocumentPreviewCard {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: string;
}

function removeMarkdown(input?: string): string {
  if (!input) return "";
  return input
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapDocumentToPreview(doc: DocumentoPayload, index: number): DocumentPreviewCard {
  const source = doc.attributes ?? doc;
  const title = source.nombre_doc ?? `Documento ${index + 1}`;
  const rawDescription = removeMarkdown(source.descripcion);

  return {
    id: String(doc.id ?? doc.documentId ?? `doc-${index}`),
    title,
    description:
      rawDescription || "Consulta este documento en la biblioteca completa.",
    href: "/documentos",
    badge: source.categoria ?? "Documento",
  };
}

function mapCommentToCard(comment: ComentarioPayload, index: number): CommentCardData {
  const source = comment.attributes ?? comment;

  return {
    id: String(comment.id ?? comment.documentId ?? `comentario-${index}`),
    autor: source.autor ?? "",
    opinion: source.opinion ?? "",
    foto_autor: source.foto_autor,
  };
}

export default async function Home() {
  const [heroResult, aboutUsResult, misionVisionResult, comentariosResult, documentosResult] = await Promise.allSettled([
    getSingleType<HeroNewsData>("hero-noticia", "populate=*"),
    getSingleType<AboutUsPayload>("nosotros", "populate=*"),
    getSingleType<MisionVisionValoresPayload>("mision-vision-valor"),
    getCollectionType<ComentarioPayload>("comentarios", "populate=foto_autor"),
    getCollectionType<DocumentoPayload>(
      "documentos",
      "populate=archivo&sort=fecha_de_carga:desc&pagination[limit]=3"
    ),
  ]);

  const heroData =
    heroResult.status === "fulfilled" ? heroResult.value.data : null;
  const aboutUsData =
    aboutUsResult.status === "fulfilled" ? aboutUsResult.value.data : null;
  const misionVisionData =
    misionVisionResult.status === "fulfilled" ? misionVisionResult.value.data : null;
  const commentsData =
    comentariosResult.status === "fulfilled"
      ? comentariosResult.value.data.map(mapCommentToCard).filter((item) => item.autor && item.opinion)
      : [];
  const documentsCards =
    documentosResult.status === "fulfilled"
      ? documentosResult.value.data.map(mapDocumentToPreview)
      : [];

  return (
    <>
      {heroData && <HeroNews data={heroData} />}
      {aboutUsData && <AboutUs data={aboutUsData} />}
      {misionVisionData && <MisionAndValue data={misionVisionData} />}
      {commentsData.length > 0 && <Comentaries comments={commentsData} />}
      <Documents cards={documentsCards} />
    </>
  );
}