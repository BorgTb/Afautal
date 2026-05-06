import type { CSSProperties } from "react";
import { Instagram } from "lucide-react";
import { getSingleType } from "@/lib/strapi";

interface ContactoPayload {
	ubicacion?: string;
	telefono?: string | number;
	email?: string;
	url_instagram?: string;
	attributes?: {
		ubicacion?: string;
		telefono?: string | number;
		email?: string;
		url_instagram?: string;
	};
}

interface ContactoData {
	ubicacion: string;
	telefono: string;
	email: string;
	urlInstagram: string;
}

const defaultContacto: ContactoData = {
	ubicacion: "",
	telefono: "",
	email: "",
	urlInstagram: "",
};

function normalizeContacto(payload: ContactoPayload | null): ContactoData {
	if (!payload) return defaultContacto;
	const source = payload.attributes ?? payload;

	return {
		ubicacion: (source.ubicacion ?? "").trim(),
		telefono: source.telefono !== undefined && source.telefono !== null ? String(source.telefono).replace(/\D/g, "") : "",
		email: (source.email ?? "").trim(),
		urlInstagram: (source.url_instagram ?? "").trim(),
	};
}

function formatChilePhoneDisplay(value: string): string {
	const digits = value.replace(/\D/g, "");
	if (!digits) return "";

	const withoutCountry = digits.startsWith("56") ? digits.slice(2) : digits;

	if (withoutCountry.startsWith("9")) {
		const body = withoutCountry.slice(1);
		if (body.length >= 8) {
			return `+56 9 ${body.slice(0, 4)} ${body.slice(4, 8)}`;
		}
		return `+56 9 ${body}`.trim();
	}

	return `+56 ${withoutCountry}`.trim();
}

function getChilePhoneHref(value: string): string {
	const digits = value.replace(/\D/g, "");
	if (!digits) return "";
	return digits.startsWith("56") ? `+${digits}` : `+56${digits}`;
}

function mapEmbedUrl(address: string): string {
	if (!address) return "";
	return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function mapExternalUrl(address: string): string {
	if (!address) return "https://maps.google.com";
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function normalizeInstagramUrl(value: string): string {
	if (!value) return "";
	if (value.startsWith("http://") || value.startsWith("https://")) return value;
	return `https://${value}`;
}

export default async function ContactoPage() {
	const contactResult = await getSingleType<ContactoPayload>("contacto").catch(() => ({ data: null }));
	const contacto = normalizeContacto(contactResult.data);

	const embedUrl = mapEmbedUrl(contacto.ubicacion);
	const mapsUrl = mapExternalUrl(contacto.ubicacion);
	const instagramUrl = normalizeInstagramUrl(contacto.urlInstagram);
	const phoneDisplay = formatChilePhoneDisplay(contacto.telefono);
	const phoneHref = getChilePhoneHref(contacto.telefono);

	return (
		<main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
			<section className="mx-auto w-full max-w-6xl">
				<header className="mb-10">
					<h1 className="news-reveal text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Contacto</h1>
					<p className="news-reveal news-delay-1 mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
						Encuentra nuestros datos de contacto y ubicación.
					</p>
				</header>

				<div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
					  <article className="news-card-reveal overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" style={{ "--stagger": "80ms" } as CSSProperties}>
						<div className="border-b border-gray-100 px-5 py-4">
							<h2 className="text-lg font-bold text-gray-900">Ubicación</h2>
							{contacto.ubicacion && (
								<p className="mt-2 text-sm text-gray-600">{contacto.ubicacion}</p>
							)}
						</div>

						{embedUrl ? (
							<iframe
								title="Mapa de ubicación"
								src={embedUrl}
								className="h-[380px] w-full"
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
						) : (
							<div className="flex h-[380px] items-center justify-center bg-gray-100 px-6 text-center text-sm text-gray-500">
								Agrega una dirección en el campo "ubicacion" del single type "contacto" para visualizar el mapa.
							</div>
						)}

						{contacto.ubicacion && (
							<div className="border-t border-gray-100 px-5 py-4">
								<a
									href={mapsUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex rounded-md border border-[#BF0F0F] px-4 py-2 text-sm font-semibold text-[#BF0F0F] transition-colors hover:bg-[#BF0F0F] hover:text-white"
								>
									Abrir en Google Maps
								</a>
							</div>
						)}
					</article>

					  <article className="news-card-reveal rounded-xl border border-gray-200 bg-white p-6 shadow-sm" style={{ "--stagger": "180ms" } as CSSProperties}>
						<h2 className="text-lg font-bold text-gray-900">Datos de contacto</h2>

						<div className="mt-5 space-y-4 text-sm text-gray-700">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Teléfono</p>
								{phoneDisplay ? (
									<a href={`tel:${phoneHref}`} className="mt-1 inline-block font-medium text-gray-900 hover:text-[#BF0F0F]">
										{phoneDisplay}
									</a>
								) : (
									<p className="mt-1 text-gray-400">No disponible</p>
								)}
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Email</p>
								{contacto.email ? (
									<a href={`mailto:${contacto.email}`} className="mt-1 inline-block font-medium text-gray-900 hover:text-[#BF0F0F]">
										{contacto.email}
									</a>
								) : (
									<p className="mt-1 text-gray-400">No disponible</p>
								)}
							</div>

							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Redes sociales</p>
								{instagramUrl ? (
									<div className="mt-2 flex items-center gap-3">
										<a
											href={instagramUrl}
											target="_blank"
											rel="noopener noreferrer"
											aria-label="Instagram"
											className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:border-[#BF0F0F] hover:text-[#BF0F0F]"
										>
											<Instagram className="h-5 w-5" aria-hidden="true" />
										</a>
									</div>
								) : (
									<p className="mt-1 text-gray-400">No disponible</p>
								)}
							</div>
						</div>
					</article>
				</div>
			</section>
		</main>
	);
}
