"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface DirectivaCard {
  id: string;
  nombre: string;
  cargo: string;
  fotoUrl: string;
  fotoAlt: string;
}

interface DirectivaSectionProps {
  cards: DirectivaCard[];
}

function getTextInitials(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DirectivaSection({ cards }: DirectivaSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const headingItems = section.querySelectorAll("[data-directiva-heading]");
    const cardItems = section.querySelectorAll("[data-directiva-card]");

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.7 },
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      timeline
        .fromTo(headingItems, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1 })
        .fromTo(
          cardItems,
          { y: 24, autoAlpha: 0, scale: 0.98 },
          { y: 0, autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.55 },
          "-=0.2"
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-[1280px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16"
    >
      <div className="mb-8 max-w-3xl">
        <p
          data-directiva-heading
          className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700"
        >
          Nuestra Directiva
        </p>
        <h1
          data-directiva-heading
          className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl"
        >
          Personas que lideran AFAUTAL
        </h1>
        <p
          data-directiva-heading
          className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          Tal como lo consigna el acta de las elecciones realizadas entre el 12 y 13 de julio de 2021, en la cual sufragaron 96 de los 180 socios de AFAUTAL, la directiva quedó compuesta por los siguientes representantes.
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((member) => (
            <article
              data-directiva-card
              key={member.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                {member.fotoUrl ? (
                  <img
                    src={member.fotoUrl}
                    alt={member.fotoAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-slate-500">
                    {getTextInitials(member.nombre)}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-center text-lg font-semibold text-slate-900">
                {member.nombre}
              </h2>
              <p className="mt-1 text-center text-sm font-medium text-red-700">
                {member.cargo}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Aun no hay integrantes de la directiva publicados.
        </p>
      )}
    </section>
  );
}
