"use client";

import { useEffect, useRef } from "react";
import "@/lib/gsap-setup";
import { gsap } from "gsap";

interface AboutSectionProps {
  descripcion: string;
}

export default function AboutSection({ descripcion }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const heading = section.querySelector("[data-about-title]");
    const text = section.querySelector("[data-about-description]");

    if (!heading || !text) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "power3.out", duration: 0.75 },
          scrollTrigger: {
            trigger: section,
            start: "top 84%",
            end: "bottom 25%",
            toggleActions: "play none none none",
            once: true,
          },
        })
        .fromTo(heading, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1 })
        .fromTo(text, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, "-=0.35");
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16" ref={sectionRef}>
      <div className="mb-8 ">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Quienes Somos
        </p>
        <h2
          data-about-title
          className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl"
        >
          Conoce Quienes Somos
        </h2>
        <p
          data-about-description
          className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-700 sm:text-lg"
        >
          {descripcion}
        </p>
      </div>
    </section>
  );
}
