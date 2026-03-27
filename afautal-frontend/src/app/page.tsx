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

interface NoticiaMediaAttributes {
  url?: string;
  alternativeText?: string | null;
}

interface NoticiaMediaField {
  data?:
    | {
        attributes?: NoticiaMediaAttributes;
        url?: string;
      }
    | Array<{
        attributes?: NoticiaMediaAttributes;
        url?: string;
      }>
    | null;
  url?: string;
  alternativeText?: string | null;
}

interface NoticiaPayload {
  id?: number;
  documentId?: string;
  titulo_noticia?: string;
  cuerpo_noticia?: string;
  foto_noticia?: NoticiaMediaField;
  autor_noticia?: string;
  fecha_publicacion?: string;
  noticia_principal?: boolean;
  attributes?: {
    titulo_noticia?: string;
    cuerpo_noticia?: string;
    foto_noticia?: NoticiaMediaField;
    autor_noticia?: string;
    fecha_publicacion?: string;
    noticia_principal?: boolean;
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

function mapNoticiaToHero(noticia: NoticiaPayload): HeroNewsData {
  const source = noticia.attributes ?? noticia;

  return {
    id: String(noticia.documentId ?? noticia.id ?? ""),
    titulo: source.titulo_noticia ?? "",
    resumen: source.cuerpo_noticia ?? "",
    imagen: source.foto_noticia,
    autor: source.autor_noticia,
    fechaPublicacion: source.fecha_publicacion,
  };
}

export default async function Home() {
  const [noticiasResult, aboutUsResult, misionVisionResult, comentariosResult, documentosResult] = await Promise.allSettled([
    getCollectionType<NoticiaPayload>(
      "noticias",
      "populate=foto_noticia&sort=noticia_principal:desc&sort=fecha_publicacion:desc&pagination[limit]=20"
    ),
    getSingleType<AboutUsPayload>("nosotros", "populate=*"),
    getSingleType<MisionVisionValoresPayload>("mision-vision-valor"),
    getCollectionType<ComentarioPayload>("comentarios", "populate=foto_autor"),
    getCollectionType<DocumentoPayload>(
      "documentos",
      "populate=archivo&sort=fecha_de_carga:desc&pagination[limit]=3"
    ),
  ]);

  const heroData =
    noticiasResult.status === "fulfilled"
      ? noticiasResult.value.data.map(mapNoticiaToHero).filter((item) => item.id || item.titulo || item.resumen)
      : [];
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
      {heroData.length > 0 && <HeroNews data={heroData} autoplayInterval={5000} />}
      {aboutUsData && <AboutUs data={aboutUsData} />}
      {misionVisionData && <MisionAndValue data={misionVisionData} />}
      {commentsData.length > 0 && <Comentaries comments={commentsData} />}
      <Documents cards={documentsCards} />
    </>
  );
}