import MisionAndValue from "@/components/landing-page/MisionAndValue";
import AboutSection from "@/components/nosotros/AboutSection";
import DirectivaSection, {
  type DirectivaCard,
} from "@/components/nosotros/DirectivaSection";
import {
	getCollectionType,
	getSingleType,
	getStrapiMediaURL,
} from "@/lib/strapi";

interface StrapiMediaAttributes {
	url?: string;
	alternativeText?: string | null;
}

interface StrapiMediaField {
	data?: {
		attributes?: StrapiMediaAttributes;
	} | null;
	url?: string;
	alternativeText?: string | null;
}

interface DirectivaPayload {
	id?: number;
	documentId?: string;
	nombre?: string;
	cargo?: string;
	foto?: StrapiMediaField;
	attributes?: {
		nombre?: string;
		cargo?: string;
		foto?: StrapiMediaField;
	};
}

interface DetalleQuienesSomosPayload {
	descripcion?: string;
	attributes?: {
		descripcion?: string;
	};
}

interface MisionVisionValoresPayload {
	mision?: string;
	vision?: string;
	valores?: string;
	attributes?: {
		mision?: string;
		vision?: string;
		valores?: string;
	};
}

function mapDirectivaToCard(item: DirectivaPayload, index: number): DirectivaCard {
	const source = item.attributes ?? item;
	const nombre = source.nombre?.trim() || `Miembro ${index + 1}`;
	const cargo = source.cargo?.trim() || "Directiva";

	const media = source.foto?.data?.attributes ?? source.foto;
	const photoUrl = media?.url ? getStrapiMediaURL(media.url) : "";
	const photoAlt = media?.alternativeText || `Foto de perfil de ${nombre}`;

	return {
		id: String(item.id ?? item.documentId ?? `directiva-${index}`),
		nombre,
		cargo,
		fotoUrl: photoUrl,
		fotoAlt: photoAlt,
	};
}

function normalizeDescripcion(data: DetalleQuienesSomosPayload | null): string {
	if (!data) return "";
	return (data.attributes?.descripcion ?? data.descripcion ?? "").trim();
}

function normalizeMisionVisionValores(
	data: MisionVisionValoresPayload | null
): { mision?: string; vision?: string; valores?: string } | null {
	if (!data) return null;
	return data.attributes ?? data;
}

export default async function NosotrosPage() {
	const [directivaResult, detalleResult, misionVisionResult] =
		await Promise.allSettled([
			getCollectionType<DirectivaPayload>(
				"directivas",
				"populate=foto&sort=createdAt:asc"
			),
			getSingleType<DetalleQuienesSomosPayload>("detalle-quienes-somos"),
			getSingleType<MisionVisionValoresPayload>("mision-vision-valor"),
		]);

	const directivaCards =
		directivaResult.status === "fulfilled"
			? directivaResult.value.data.map(mapDirectivaToCard)
			: [];

	const descripcionQuienesSomos =
		detalleResult.status === "fulfilled"
			? normalizeDescripcion(detalleResult.value.data)
			: "";

	const misionVisionValores =
		misionVisionResult.status === "fulfilled"
			? normalizeMisionVisionValores(misionVisionResult.value.data)
			: null;

	return (
		<>
			<DirectivaSection cards={directivaCards} />
			<AboutSection
				descripcion={
					descripcionQuienesSomos ||
					"AFAUTAL trabaja por el bienestar de sus asociados y su participacion activa en la comunidad."
				}
			/>

			{misionVisionValores && <MisionAndValue data={misionVisionValores} />}
		</>
	);
}
