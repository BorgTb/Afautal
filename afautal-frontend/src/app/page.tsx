// src/app/page.tsx
import WelcomeHero from "@/components/landing-page/WelcomeHero";
import HeroNews from "@/components/landing-page/HeroNews";
import type { HeroNewsData } from "@/components/landing-page/HeroNews";
import AboutUs from "@/components/landing-page/AboutUs";
import MisionAndValue from "@/components/landing-page/MisionAndValue";
import Comentaries from "@/components/landing-page/Comentaries";
import type { CommentCardData } from "@/components/landing-page/Comentaries";
import CalendarActivities from "@/components/landing-page/CalendarActivities";
import type { CalendarActivityData } from "@/components/landing-page/CalendarActivities";
import { getCollectionType, getSingleType, getStrapiMediaURL } from "@/lib/strapi";
import SectionReveal from "@/components/shared/SectionReveal";

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

export default async function Home() {
  const [noticiasResult, aboutUsResult, misionVisionResult, comentariosResult, actividadesResult] =
    await Promise.allSettled([
      getCollectionType<NoticiaPayload>(
        "noticias",
        "populate=foto_noticia&sort=noticia_principal:desc&sort=fecha_publicacion:desc&pagination[limit]=20"
      ),
      getSingleType<AboutUsPayload>("nosotros", "populate=*"),
      getSingleType<MisionVisionValoresPayload>("mision-vision-valor"),
      getCollectionType<ComentarioPayload>("comentarios", "populate=foto_autor"),
      getCollectionType<ActividadPayload>("actividads", "populate=*&sort=fecha:asc"),
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
  const actividadesData =
    actividadesResult.status === "fulfilled"
      ? actividadesResult.value.data.map(mapActividadToCalendar).filter((item) => item.id && item.titulo && item.fecha)
      : [];

  return (
    <>
      <WelcomeHero />
      {heroData.length > 0 && (
        <SectionReveal className="section-shell first-section">
          <HeroNews data={heroData} autoplayInterval={5000} />
        </SectionReveal>
      )}
      {actividadesData.length > 0 && (
        <SectionReveal className="section-shell">
          <CalendarActivities data={actividadesData} />
        </SectionReveal>
      )}
      {aboutUsData && (
        <SectionReveal className="section-shell">
          <AboutUs data={aboutUsData} />
        </SectionReveal>
      )}
      {misionVisionData && (
        <SectionReveal className="section-shell">
          <MisionAndValue data={misionVisionData} />
        </SectionReveal>
      )}
      {commentsData.length > 0 && (
        <SectionReveal className="section-shell">
          <Comentaries comments={commentsData} />
        </SectionReveal>
      )}
    </>
  );
}
