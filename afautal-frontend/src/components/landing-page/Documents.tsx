"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface DocumentsPreviewCard {
	id: string;
	title: string;
	description: string;
	href: string;
	badge: string;
}

interface DocumentsProps {
	cards?: DocumentsPreviewCard[];
}

const defaultCards: DocumentsPreviewCard[] = [
	{
		id: "reglamentos",
		title: "Reglamentos",
		description: "Normas y lineamientos principales para asociados.",
		href: "/documentos",
		badge: "Actualizado",
	},
	{
		id: "formularios",
		title: "Formularios",
		description: "Solicitudes, afiliaciones y plantillas oficiales.",
		href: "/documentos",
		badge: "Nuevos",
	},
	{
		id: "comunicados",
		title: "Comunicados",
		description: "Circulares y avisos para la comunidad.",
		href: "/documentos",
		badge: "Destacados",
	},
];

export default function Documents({ cards }: DocumentsProps) {
	const sectionRef = useRef<HTMLElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const cardsRef = useRef<HTMLDivElement | null>(null);
	const previewCards = cards && cards.length > 0 ? cards : defaultCards;

	useEffect(() => {
		const section = sectionRef.current;
		const content = contentRef.current;
		const cardsContainer = cardsRef.current;

		if (!section || !content || !cardsContainer) return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (mediaQuery.matches) return;

		const textItems = content.querySelectorAll("[data-doc-text]");
		const cta = content.querySelector("[data-doc-cta]");
		const cards = cardsContainer.querySelectorAll("[data-doc-card]");

		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const timeline = gsap.timeline({
				defaults: { ease: "power3.out", duration: 0.75 },
				scrollTrigger: {
					trigger: section,
					start: "top 82%",
					end: "bottom 20%",
					toggleActions: "play none none none",
					once: true,
				},
			});

			timeline
				.fromTo(textItems, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1 })
				.fromTo(
					cta,
					{ y: 14, autoAlpha: 0, scale: 0.97 },
					{ y: 0, autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)" },
					"-=0.15"
				)
				.fromTo(
					cards,
					{ y: 18, autoAlpha: 0 },
					{ y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.45 },
					"-=0.25"
				);
		}, section);

		return () => {
			ctx.revert();
		};
	}, []);

	return (
		<section ref={sectionRef} className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10">
			<div className="overflow-hidden ">
				<div className="space-y-8 p-6 sm:p-8 lg:p-12">
					<div ref={contentRef} className="max-w-3xl">
						<p data-doc-text className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
							Biblioteca
						</p>
						<h2 data-doc-text className="section-title mt-3 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-[36px]">
							Accede a nuestros documentos
						</h2>
						<p data-doc-text className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
							Consulta accesos rápidos y entra a la sección completa para ver todos los
							documentos disponibles.
						</p>
						<a
							data-doc-cta
							href="/documentos"
							className="btn-animate mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.98]"
						>
							Ir a la vista de documentos
							<span aria-hidden="true">→</span>
						</a>
					</div>

					<div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{previewCards.map((card) => (
							<article
								data-doc-card
								key={card.id}
								className="group h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
										<p className="mt-2 text-sm leading-relaxed text-slate-600">
											{card.description}
										</p>
									</div>
									<span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-red-700">
										{card.badge}
									</span>
								</div>

								<div className="mt-4 border-t border-slate-100 pt-3">
									<a
										href={card.href}
										className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:text-red-700"
									>
										Ver documentos
										<span aria-hidden="true">→</span>
									</a>
								</div>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
