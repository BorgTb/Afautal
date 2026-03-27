"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface MisionVisionValoresData {
	mision?: string;
	vision?: string;
	valores?: string;
}

interface MisionAndValueProps {
	data?: MisionVisionValoresData;
}

export default function MisionAndValue({ data }: MisionAndValueProps) {
	const sectionRef = useRef<HTMLElement | null>(null);
	const headerRef = useRef<HTMLDivElement | null>(null);
	const cardsRef = useRef<HTMLDivElement | null>(null);

	const mision = data?.mision ?? "";
	const vision = data?.vision ?? "";
	const valores = data?.valores ?? "";

	useEffect(() => {
		const section = sectionRef.current;
		const header = headerRef.current;
		const cards = cardsRef.current;

		if (!section || !header || !cards) return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (mediaQuery.matches) return;

		const headingItems = header.querySelectorAll("[data-mvv-heading]");
		const missionCard = cards.querySelector("[data-mvv-mision]");
		const visionCard = cards.querySelector("[data-mvv-vision]");
		const valuesCard = cards.querySelector("[data-mvv-valores]");

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
				.fromTo(headingItems, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1 })
				.fromTo(
					missionCard,
					{ x: -24, autoAlpha: 0 },
					{ x: 0, autoAlpha: 1, duration: 0.6 },
					"-=0.15"
				)
				.fromTo(
					visionCard,
					{ x: 24, autoAlpha: 0 },
					{ x: 0, autoAlpha: 1, duration: 0.6 },
					"-=0.4"
				)
				.fromTo(
					valuesCard,
					{ x: -24, autoAlpha: 0 },
					{ x: 0, autoAlpha: 1, duration: 0.6 },
					"-=0.2"
				);
		}, section);

		return () => {
			ctx.revert();
		};
	}, []);

	return (
		<section ref={sectionRef} className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10">
			<div className="rounded-2xl  bg-white p-6 sm:p-8 lg:p-10">
				<div ref={headerRef} className="max-w-3xl">
					<p data-mvv-heading className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
						Nuestra Identidad
					</p>
					<h2
						data-mvv-heading
						className="section-title mt-3 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-[36px]"
					>
						Mision, Vision y Valores
					</h2>
					<p data-mvv-heading className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
						Estos principios orientan nuestras decisiones y reflejan el compromiso de AFAUTAL
						con sus asociados.
					</p>
				</div>

				<div ref={cardsRef} className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
					<article
						data-mvv-mision
						className="rounded-xl border border-slate-200 border-t-4 border-t-red-600 bg-red-50/60 p-5 shadow-sm sm:p-6"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700 text-left">Mision</p>
						<p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base whitespace-pre-line">{mision}</p>
					</article>

					<article
						data-mvv-vision
						className="rounded-xl border border-slate-200 border-t-4 border-t-sky-600 bg-sky-50/60 p-5 shadow-sm sm:p-6"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 text-left">Vision</p>
						<p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base whitespace-pre-line">{vision}</p>
					</article>

					<article
						data-mvv-valores
						className="rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-amber-50/70 p-5 shadow-sm sm:p-6"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 text-left">Valores</p>
						<p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base whitespace-pre-line">{valores}</p>
					</article>
				</div>
			</div>
		</section>
	);
}
