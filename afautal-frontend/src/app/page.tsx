// src/app/page.tsx
import HeroNews from "@/components/landing-page/HeroNews";
import type { HeroNewsData } from "@/components/landing-page/HeroNews";
import AboutUs from "@/components/landing-page/AboutUs";
import { getSingleType } from "@/lib/strapi";

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

export default async function Home() {
  const [heroResult, aboutUsResult] = await Promise.allSettled([
    getSingleType<HeroNewsData>("hero-noticia", "populate=*"),
    getSingleType<AboutUsPayload>("nosotros", "populate=*"),
  ]);

  const heroData =
    heroResult.status === "fulfilled" ? heroResult.value.data : null;
  const aboutUsData =
    aboutUsResult.status === "fulfilled" ? aboutUsResult.value.data : null;

  return (
    <>
      {heroData && <HeroNews data={heroData} />}
      {aboutUsData && <AboutUs data={aboutUsData} />}
    </>
  );
}