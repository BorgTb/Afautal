"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StrapiMedia {
    url?: string;
    alternativeText?: string | null;
}

interface StrapiMediaField {
    data?: {
        attributes?: StrapiMedia;
    } | null;
    url?: string;
    alternativeText?: string | null;
}

interface AboutUsContent {
    titulo?: string;
    texto?: string;
    descripcion?: string;
    imagen?: StrapiMediaField;
    foto?: StrapiMediaField;
}

interface AboutUsProps {
    data?:
        | AboutUsContent
        | {
                data?:
                    | {
                            attributes?: AboutUsContent;
                        }
                    | AboutUsContent
                    | null;
            }
        | null;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

function normalizeContent(input: AboutUsProps["data"]): AboutUsContent | null {
    if (!input) return null;

    if ("data" in input) {
        const raw = input.data;
        if (!raw) return null;
        if ("attributes" in raw && raw.attributes) return raw.attributes;
        return raw as AboutUsContent;
    }

    if (
        "titulo" in input ||
        "texto" in input ||
        "descripcion" in input ||
        "imagen" in input ||
        "foto" in input
    ) {
        return input;
    }

    return null;
}

function normalizeImage(field?: StrapiMediaField): StrapiMedia | null {
    if (!field) return null;
    if (field.data?.attributes) return field.data.attributes;
    if (field.url) return { url: field.url, alternativeText: field.alternativeText ?? null };
    return null;
}

function buildMediaUrl(url?: string): string {
    if (!url) return "/placeholder-about-us.jpg";
    return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export default function AboutUs({ data }: AboutUsProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const imageRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const image = imageRef.current;
        const text = textRef.current;

        if (!section || !image || !text) return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) return;

        const textItems = text.querySelectorAll("[data-about-text]");

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
                .fromTo(image, { x: -70, autoAlpha: 0 }, { x: 0, autoAlpha: 1 })
                .fromTo(
                    textItems,
                    { x: 60, autoAlpha: 0 },
                    { x: 0, autoAlpha: 1, stagger: 0.12, duration: 0.75 },
                    "-=0.5"
                );
        }, section);

        return () => {
            ctx.revert();
        };
    }, []);

    const content = normalizeContent(data);

    const title = content?.titulo ?? "Quiénes Somos";
    const description =
        content?.texto ??
        content?.descripcion ??
        "Somos una organización enfocada en fortalecer la comunidad, promoviendo valores, participación y trabajo colaborativo para nuestros asociados.";

    const image = normalizeImage(content?.imagen ?? content?.foto);
    const imageUrl = buildMediaUrl(image?.url);
    const imageAlt = image?.alternativeText || "Equipo de la organización";

    return (
        <section
            ref={sectionRef}
            className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-10"
        >
            <div ref={imageRef} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px]"
                />
            </div>

            <div ref={textRef}>
                <p data-about-text className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">AFAUTAL</p>
                <h2 data-about-text className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{title}</h2>
                <p data-about-text className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
            </div>
        </section>
    );
}
        