// src/app/page.tsx
import HeroNews from "@/components/landing-page/HeroNews";
import AboutUs from "@/components/landing-page/AboutUs";
import { getSingleType } from "@/lib/strapi";

interface AboutUsPayload {
  titulo?: string;
  texto?: string;
  descripcion?: string;
  imagen?: {
    data?: {
      attributes?: {
        url?: string;
        alternativeText?: string | null;
      };
    };
  };
  foto?: {
    data?: {
      attributes?: {
        url?: string;
        alternativeText?: string | null;
      };
    };
  };
}

export default async function Home() {
  const noticia = {
    titulo: "¡Bienvenidos a AFAUTAL!",
    resumen: "La Asociación de Fútbol Amateur de Talca (AFAUTAL) es una organización sin fines de lucro dedicada a promover y desarrollar el fútbol amateur en la ciudad de Talca. Fundada en 1995, AFAUTAL ha sido un pilar fundamental para la comunidad futbolística local, ofreciendo oportunidades para jugadores de todas las edades y niveles de habilidad.",
    imagenUrl: "/hero-noticia.jpg",
  };

  const aboutUsFallbackData = {
    titulo: "Quiénes Somos",
    texto:
      "AFAUTAL es una asociación comprometida con el desarrollo del fútbol amateur, impulsando espacios de participación, formación y comunidad para sus socios y familias.",
    imagen: {
      url: "/hero-noticia.jpg",
      alternativeText: "Equipo AFAUTAL",
    },
  };

  let aboutUsData: AboutUsPayload | null = null;

  try {
    const aboutUsResponse = await getSingleType<AboutUsPayload>(
      "quienes-somos",
      "populate=imagen,foto"
    );
    aboutUsData = aboutUsResponse.data;
  } catch {
    aboutUsData = null;
  }

  return (
    <>
      <HeroNews  noticia={noticia} />
      <AboutUs data={aboutUsData ?? aboutUsFallbackData} />
    </>
  );
}