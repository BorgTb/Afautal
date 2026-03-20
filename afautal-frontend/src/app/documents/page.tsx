import Link from "next/link";

const documentCategories = [
	{
		title: "Estatutos",
		description: "Normas y reglamentos institucionales para consulta de socios.",
		action: "Ver documentos",
	},
	{
		title: "Actas",
		description: "Registro de asambleas, acuerdos y comunicaciones oficiales.",
		action: "Explorar actas",
	},
	{
		title: "Formatos",
		description: "Formularios y plantillas para trámites internos.",
		action: "Descargar formatos",
	},
];

export default function DocumentsPage() {
	return (
		<main className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
			<section className="mx-auto w-full max-w-6xl">
				<header className="mb-10">
					<h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
						Documentos
					</h1>
					<p className="mt-4 max-w-3xl text-base text-gray-600 sm:text-lg">
						Accede a la biblioteca de documentos de AFAUTAL por tipo de contenido.
					</p>
				</header>

				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{documentCategories.map((category) => (
						<article
							key={category.title}
							className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
						>
							<h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
							<p className="mt-3 text-sm leading-6 text-gray-600">
								{category.description}
							</p>
							<button
								type="button"
								className="mt-6 inline-flex items-center rounded-md border border-[#BF0F0F] px-4 py-2 text-sm font-semibold text-[#BF0F0F] transition-colors hover:bg-[#BF0F0F] hover:text-white"
							>
								{category.action}
							</button>
						</article>
					))}
				</div>

				<div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
					<p className="text-sm text-gray-600">
						¿No encuentras un documento? Contáctanos para solicitar acceso.
					</p>
					<Link
						href="/news"
						className="mt-4 inline-flex rounded-md bg-[#BF0F0F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#A61B26]"
					>
						Ir a noticias
					</Link>
				</div>
			</section>
		</main>
	);
}
