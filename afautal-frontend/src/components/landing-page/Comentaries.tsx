"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMediaURL } from "@/lib/strapi";

interface CommentAuthorPhoto {
	url?: string;
	alternativeText?: string | null;
}

interface CommentAuthorPhotoField {
	data?: {
		attributes?: CommentAuthorPhoto;
		url?: string;
	} | null;
	url?: string;
	alternativeText?: string | null;
}

export interface CommentCardData {
	id: string;
	autor: string;
	opinion: string;
	foto_autor?: CommentAuthorPhotoField;
}

interface ComentariesProps {
	comments: CommentCardData[];
}

function getAuthorPhotoUrl(photo?: CommentAuthorPhotoField): string {
	if (!photo) return "/avatar-placeholder.png";

	if (photo.url) return getStrapiMediaURL(photo.url);

	const nestedUrl = photo.data?.attributes?.url ?? photo.data?.url;
	return getStrapiMediaURL(nestedUrl) || "/avatar-placeholder.png";
}

function getAuthorPhotoAlt(photo: CommentAuthorPhotoField | undefined, autor: string): string {
	return photo?.alternativeText ?? photo?.data?.attributes?.alternativeText ?? `Foto de ${autor}`;
}

export default function Comentaries({ comments }: ComentariesProps) {
	const sectionRef = useRef<HTMLElement | null>(null);
	const headerRef = useRef<HTMLDivElement | null>(null);
	const listRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const section = sectionRef.current;
		const header = headerRef.current;
		const list = listRef.current;

		if (!section || !header || !list) return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (mediaQuery.matches) return;

		const headingItems = header.querySelectorAll("[data-comment-heading]");
		const cards = list.querySelectorAll("[data-comment-card]");

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
					cards,
					{ y: 24, autoAlpha: 0 },
					{ y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.55 },
					"-=0.2"
				);
		}, section);

		return () => {
			ctx.revert();
		};
	}, []);

	if (!comments || comments.length === 0) return null;

	return (
		<section ref={sectionRef} className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10">
			<div ref={headerRef} className="max-w-3xl">
				<p data-comment-heading className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Comunidad</p>
				<h2 data-comment-heading className="section-title mt-3 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-[36px]">Comentarios</h2>
			</div>

			<div ref={listRef} className="mt-8 space-y-5">
				{comments.map((comment) => (
					<article
						data-comment-card
						key={comment.id}
						className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md sm:p-6"
					>
						<div className="relative pl-8">
							<span
								aria-hidden="true"
								className="pointer-events-none absolute -left-1 -top-5 text-7xl font-bold leading-none text-[#BF0F0F]/20"
							>
								"
							</span>
							<p className="text-base italic leading-relaxed text-slate-700 sm:text-lg whitespace-pre-line">
								{comment.opinion}
							</p>
						</div>

						<div className="mt-5 flex items-center gap-3">
							<img
								src={getAuthorPhotoUrl(comment.foto_autor)}
								alt={getAuthorPhotoAlt(comment.foto_autor, comment.autor)}
								className="h-14 w-14 rounded-full border border-slate-200 object-cover sm:h-16 sm:w-16"
							/>
							<div>
								<p className="text-base font-semibold text-slate-900 sm:text-lg">{comment.autor}</p>
								<p className="text-sm font-medium text-slate-500">Asociado AFAUTAL</p>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
