"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

function truncateText(value: string | undefined, maxLength: number): string {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const image = imageRef.current;

    if (!section || !text || !image) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const textItems = text.querySelectorAll("[data-hero-text]");
    const ctaButton = text.querySelector("[data-hero-button]");

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.9 },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      timeline
        .fromTo(image, { x: 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1 })
        .fromTo(
          textItems,
          { x: -60, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, stagger: 0.12, duration: 0.75 },
          "-=0.5"
        )
        .fromTo(
          ctaButton,
          { y: 16, scale: 0.96, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.4)" },
          "-=0.2"
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  const titulo = truncateText(data.titulo, 140);
  const resumen = truncateText(data.resumen, 320);
  const imagenUrl = getMediaUrlFromField(data.imagen) || "/hero-noticia.jpg";

  return (
    <section
      ref={sectionRef}
      className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-10"
    >
      <div ref={textRef} className="flex flex-col justify-center">
        <h1 data-hero-text className="max-w-[20ch] text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {titulo}
        </h1>
        <p data-hero-text className="mt-6 max-w-[60ch] text-base leading-relaxed text-slate-600 sm:text-lg">
          {resumen}
        </p>
        <button data-hero-button className="mt-8 px-8 py-3 border-2 border-[#BF0F0F] text-[#BF0F0F] font-bold hover:bg-[#A61B26] hover:text-white transition-colors duration-300 uppercase tracking-widest text-sm">
          Ver Más →
        </button>
      </div>
      <div ref={imageRef} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl">
        <img
          src={imagenUrl}
          alt="Noticia principal"
          className="h-[260px] w-full object-cover sm:h-[340px] lg:h-full lg:min-h-[420px]"
        />
      </div>
    </section>
  );
}