"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { getStrapiMediaURL } from "@/lib/strapi";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  id?: string;
  titulo?: string;
  resumen?: string;
  imagen?: HeroImageValue;
  autor?: string;
  fechaPublicacion?: string;
}

interface HeroNewsProps {
  data: HeroNewsData[];
  autoplayInterval?: number;
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

export default function HeroNoticia({ data, autoplayInterval = 5000 }: HeroNewsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const newsItems = useMemo(
    () => data.filter((item) => item && (item.titulo || item.resumen || item.imagen)),
    [data]
  );

  const hasManyItems = newsItems.length > 1;

  useEffect(() => {
    if (!hasManyItems || isHovering) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, autoplayInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoplayInterval, hasManyItems, isHovering, newsItems.length]);

  useEffect(() => {
    setCurrentIndex((prev) => {
      if (!newsItems.length) return 0;
      return prev >= newsItems.length ? 0 : prev;
    });
  }, [newsItems.length]);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const image = imageRef.current;

    if (!section || !text || !image) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const textItems = text.querySelectorAll("[data-hero-text]");
    const ctaButton = text.querySelector("[data-hero-button]");

    const ctx = gsap.context(() => {
      if (mediaQuery.matches) {
        gsap.set([image, textItems, ctaButton], { clearProps: "all" });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.65 } });

      timeline
        .fromTo(image, { x: 36, autoAlpha: 0 }, { x: 0, autoAlpha: 1 })
        .fromTo(
          textItems,
          { x: -24, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, stagger: 0.08, duration: 0.45 },
          "-=0.35"
        )
        .fromTo(
          ctaButton,
          { y: 16, scale: 0.96, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.32, ease: "back.out(1.4)" },
          "-=0.1"
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, [currentIndex]);

  if (!newsItems.length) return null;

  const currentItem = newsItems[currentIndex] ?? newsItems[0];
  const title = truncateText(currentItem.titulo, 170);
  const summary = truncateText(currentItem.resumen, 420);
  const imageUrl = getMediaUrlFromField(currentItem.imagen) || "/hero-noticia.jpg";
  const publicationDate = formatDate(currentItem.fechaPublicacion);
  const metaInfo = [currentItem.autor?.trim(), publicationDate].filter(Boolean).join(" • ");
  const detailHref = currentItem.id ? `/news/${currentItem.id}` : "/news";

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (!hasManyItems) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (!hasManyItems) return;
    touchEndXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (!hasManyItems) return;

    const startX = touchStartXRef.current;
    const endX = touchEndXRef.current;

    if (startX === null || endX === null) return;

    const SWIPE_THRESHOLD = 42;
    const deltaX = startX - endX;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX > 0) {
      handleNext();
      return;
    }

    handlePrev();
  };

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="group relative mx-auto grid w-[calc(100%-1rem)] max-w-none grid-cols-1 gap-8 px-4 py-16 sm:w-[calc(100%-2rem)] sm:px-6 lg:w-[calc(100%-3rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)] lg:gap-12 lg:px-10 xl:w-[calc(100%-4rem)] xl:px-14 2xl:px-20"
    >
      {hasManyItems && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Ver noticia anterior"
            className="absolute left-2 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg transition-all duration-200 hover:border-slate-300 hover:text-[#BF0F0F] lg:left-4 lg:flex lg:opacity-0 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto lg:focus-visible:opacity-100 lg:focus-visible:pointer-events-auto xl:left-6"
          >
            <ChevronLeft className="h-8 w-8" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Ver siguiente noticia"
            className="absolute right-2 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg transition-all duration-200 hover:border-slate-300 hover:text-[#BF0F0F] lg:right-4 lg:flex lg:opacity-0 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto lg:focus-visible:opacity-100 lg:focus-visible:pointer-events-auto xl:right-6"
          >
            <ChevronRight className="h-8 w-8" aria-hidden="true" />
          </button>
        </>
      )}

      <div
        ref={textRef}
        className="flex h-auto flex-col justify-between gap-6 sm:h-[340px] sm:gap-0 lg:h-[420px]"
      >
        <div>
          <p
            data-hero-text
            className="mb-4 min-h-[20px] text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            {metaInfo || <span className="invisible">-</span>}
          </p>
          <h1
            data-hero-text
            className="max-w-[24ch] min-h-0 text-3xl font-bold leading-tight text-slate-900 sm:min-h-[94px] sm:text-4xl lg:min-h-[120px] lg:max-w-[30ch] lg:text-5xl"
          >
            {title}
          </h1>
          <p
            data-hero-text
            className="mt-6 max-w-[68ch] min-h-0 text-base leading-relaxed text-slate-600 sm:min-h-[128px] sm:text-lg lg:min-h-[136px] lg:max-w-[74ch]"
          >
            {summary}
          </p>
        </div>
        <Link
          data-hero-button
          href={detailHref}
          className="mt-8 inline-flex w-fit px-8 py-3 border-2 border-[#BF0F0F] text-[#BF0F0F] font-bold hover:bg-[#A61B26] hover:text-white transition-colors duration-300 uppercase tracking-widest text-sm"
        >
          Ver Más →
        </Link>
      </div>
      <div
        ref={imageRef}
        className="h-[260px] overflow-hidden rounded-2xl bg-transparent sm:h-[340px] lg:h-[420px]"
      >
        <img
          src={imageUrl}
          alt="Noticia principal"
          className="h-full w-full bg-transparent object-cover object-center sm:object-contain sm:mix-blend-multiply"
        />
      </div>

      {hasManyItems && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:bottom-5">
          {newsItems.map((item, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={item.id ?? `hero-dot-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir a la noticia ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-200 ${
                  isActive ? "w-7 bg-[#BF0F0F]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}