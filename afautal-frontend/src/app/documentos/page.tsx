import type { CSSProperties } from "react";
import { getCollectionType, getStrapiMediaURL } from "@/lib/strapi";

interface StrapiMediaItem {
	id?: number;
	url?: string;
	name?: string;
	mime?: string;
	size?: number;
	attributes?: {
		url?: string;
		name?: string;
		mime?: string;
		size?: number;
	};
}

interface DocumentoItem {
	id?: number;
	nombre_doc?: string;
	categoria?: string;
	fecha_de_carga?: string;
	descripcion?: string;
	archivo?:
		| StrapiMediaItem[]
		| {
				data?: StrapiMediaItem[] | null;
		  }
		| null;
	attributes?: {
		nombre_doc?: string;
		categoria?: string;
		fecha_de_carga?: string;
		descripcion?: string;
		archivo?:
			| StrapiMediaItem[]
			| {
					data?: StrapiMediaItem[] | null;
			  }
			| null;
	};
}

function getDocumentSource(item: DocumentoItem): Omit<DocumentoItem, "attributes"> {
	return item.attributes ? { ...item.attributes } : item;
}

function getMediaList(value: DocumentoItem["archivo"]): StrapiMediaItem[] {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	if (value.data && Array.isArray(value.data)) return value.data;
	return [];
}

function normalizeMedia(item: StrapiMediaItem): { url: string; name: string } | null {
	const rawUrl = item.url ?? item.attributes?.url;
	if (!rawUrl) return null;

	return {
		url: getStrapiMediaURL(rawUrl),
		name: item.name ?? item.attributes?.name ?? "Archivo",
	};
}

function formatDate(input?: string): string {
	if (!input) return "Sin fecha";
	const date = new Date(input);
	if (Number.isNaN(date.getTime())) return "Sin fecha";

	return new Intl.DateTimeFormat("es-AR", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(date);
}

function removeMarkdown(input?: string): string {
	if (!input) return "";
	return input
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[`*_>#-]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export default async function DocumentsPage() {
	const documentsResult = await getCollectionType<DocumentoItem>(
		"documentos",
		"populate=archivo&sort=fecha_de_carga:desc"
	).catch(() => ({ data: [] }));

	const documents = documentsResult.data;

	return (
		<main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
			<section className="mx-auto w-full max-w-6xl">
				<header className="mb-10">
					<h1 className="news-reveal text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
						Documentos
					</h1>
					<p className="news-reveal news-delay-1 mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
						Descarga los archivos publicados.
					</p>
				</header>

				{documents.length === 0 ? (
					<div className="news-reveal news-delay-2 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
						<p className="text-sm text-gray-600">
							No hay documentos cargados todavía en Strapi.
						</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{documents.map((item, index) => {
							const source = getDocumentSource(item);
							const title = source.nombre_doc ?? `Documento ${index + 1}`;
							const category = source.categoria ?? "Sin categoría";
							const description = removeMarkdown(source.descripcion);
							const uploadDate = formatDate(source.fecha_de_carga);
							const files = getMediaList(source.archivo)
								.map(normalizeMedia)
								.filter((file): file is { url: string; name: string } => Boolean(file));

							return (
								<article
									key={String(item.id ?? `doc-${index}`)}
									className="news-card-reveal rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
									style={{ "--stagger": `${index * 90}ms` } as CSSProperties}
								>
									<div className="flex items-center justify-between gap-3">
										<h2 className="text-xl font-bold text-gray-900">{title}</h2>
										<span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#BF0F0F]">
											{category}
										</span>
									</div>

									<p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
										Cargado: {uploadDate}
									</p>

									{description && (
										<p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
									)}

									<div className="mt-5 border-t border-gray-100 pt-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
											Archivos
										</p>
										{files.length === 0 ? (
											<p className="mt-2 text-sm text-gray-500">Sin archivos disponibles.</p>
										) : (
											<div className="mt-3 flex flex-wrap gap-2">
												{files.map((file) => (
													<a
														key={`${String(item.id ?? index)}-${file.url}`}
														href={file.url}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center rounded-md border border-[#BF0F0F] px-3 py-2 text-xs font-semibold text-[#BF0F0F] transition-colors hover:bg-[#BF0F0F] hover:text-white"
													>
														Descargar {file.name}
													</a>
												))}
											</div>
										)}
									</div>
								</article>
							);
						})}
					</div>
				)}

				
			</section>
		</main>
	);
}
