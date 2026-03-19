import { getStrapiMediaURL } from "@/lib/strapi";

interface HeroImageAttributes {
  url?: string;
  alternativeText?: string | null;
}

interface HeroImageField {
  url?: string;
  alternativeText?: string | null;
  data?:
    | {
        url?: string;
        attributes?: HeroImageAttributes;
      }
    | Array<{
        url?: string;
        attributes?: HeroImageAttributes;
      }>
    | null;
}

type HeroImageValue = HeroImageField | HeroImageField[] | null | undefined;

export interface HeroNewsData {
  titulo?: string;
  resumen?: string;
  imagen?: HeroImageValue;
}

function getMediaUrlFromSingleField(field?: HeroImageField | null): string {
  if (!field) return "";

  if (field.url) return getStrapiMediaURL(field.url);

  if (Array.isArray(field.data)) {
    const first = field.data[0];
    return getStrapiMediaURL(first?.attributes?.url ?? first?.url);
  }

  return getStrapiMediaURL(field.data?.attributes?.url ?? field.data?.url);
}

function getMediaUrlFromField(field: HeroImageValue): string {
  if (!field) return "";
  if (Array.isArray(field)) return getMediaUrlFromSingleField(field[0]);
  return getMediaUrlFromSingleField(field);
}

export default function HeroNoticia({ data }: { data: HeroNewsData }) {
  const titulo = data.titulo ?? "";
  const resumen = data.resumen ?? "";
  const imagenUrl = getMediaUrlFromField(data.imagen) || "/hero-noticia.jpg";

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          {titulo}
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          {resumen}
        </p>
        <button className="mt-8 px-8 py-3 border-2 border-[#BF0F0F] text-[#BF0F0F] font-bold hover:bg-[#A61B26] hover:text-white transition-all uppercase tracking-widest text-sm">
          Ver Más →
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-2xl">
        <img src={imagenUrl} alt="Estudio" className="w-full h-auto object-cover" />
      </div>
    </section>
  );
}