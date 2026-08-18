import { Facebook, Globe, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface RedSocialEnlace {
	nombre: string;
	label: string;
	url: string;
	Icon: LucideIcon;
}

interface RedSocialPayload {
	nombre?: string;
	url?: string;
}

export interface ContactoRedesPayload {
	ubicacion?: string;
	telefono?: string | number;
	email?: string;
	url_instagram?: string;
	redes_sociales?: RedSocialPayload[] | null;
	attributes?: {
		ubicacion?: string;
		telefono?: string | number;
		email?: string;
		url_instagram?: string;
		redes_sociales?: RedSocialPayload[] | null;
	};
}

const SOCIAL_NETWORKS: Record<string, { label: string; Icon: LucideIcon }> = {
	instagram: { label: "Instagram", Icon: Instagram },
	facebook: { label: "Facebook", Icon: Facebook },
	linkedin: { label: "LinkedIn", Icon: Linkedin },
	x: { label: "X (Twitter)", Icon: Twitter },
	twitter: { label: "X (Twitter)", Icon: Twitter },
	x_twitter: { label: "X (Twitter)", Icon: Twitter },
	youtube: { label: "YouTube", Icon: Youtube },
};

const GENERIC_ICON: LucideIcon = Globe;

function prettifyNombre(nombre: string): string {
	return nombre
		.replace(/[_-]+/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase())
		.trim();
}

export function normalizeSocialUrl(value: string): string {
	if (!value) return "";
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

export function normalizeRedesSociales(payload: ContactoRedesPayload | null): RedSocialEnlace[] {
	if (!payload) return [];
	const source = payload.attributes ?? payload;

	const redes: RedSocialEnlace[] = [];
	const seen = new Set<string>();

	const push = (nombre?: string, url?: string) => {
		const cleanUrl = normalizeSocialUrl(url ?? "");
		const raw = nombre?.trim() ?? "";
		if (!raw || !cleanUrl) return;
		const key = raw.toLowerCase();
		if (seen.has(key)) return;
		seen.add(key);
		const known = SOCIAL_NETWORKS[key];
		redes.push({
			nombre: raw,
			label: known?.label ?? prettifyNombre(raw),
			url: cleanUrl,
			Icon: known?.Icon ?? GENERIC_ICON,
		});
	};

	(source.redes_sociales ?? []).forEach((item) => push(item.nombre, item.url));

	if (source.url_instagram) {
		push("instagram", source.url_instagram);
	}

	return redes;
}