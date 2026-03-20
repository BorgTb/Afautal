const stats = [
	{ label: "Cupos disponibles", value: "12" },
	{ label: "Solicitudes activas", value: "3" },
	{ label: "Última actualización", value: "Hoy" },
];

export default function GasInterfacePage() {
	return (
		<main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
			<section className="mx-auto w-full max-w-6xl space-y-6">
				<header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<p className="text-sm font-semibold uppercase tracking-wide text-[#BF0F0F]">
						Panel de gas
					</p>
					<h1 className="mt-2 text-3xl font-extrabold text-gray-900">
						Interfaz de Vales de Gas
					</h1>
					<p className="mt-3 text-sm text-gray-600 sm:text-base">
						Gestiona solicitudes, estado de cupos y próximas entregas en un solo lugar.
					</p>
				</header>

				<div className="grid gap-4 sm:grid-cols-3">
					{stats.map((item) => (
						<article
							key={item.label}
							className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
						>
							<p className="text-xs uppercase tracking-wide text-gray-500">
								{item.label}
							</p>
							<p className="mt-2 text-3xl font-bold text-gray-900">{item.value}</p>
						</article>
					))}
				</div>

				<section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-bold text-gray-900">Nueva solicitud</h2>
					<p className="mt-2 text-sm text-gray-600">
						Completa este formulario para registrar una solicitud de vale de gas.
					</p>

					<form className="mt-6 grid gap-4 md:grid-cols-2" action="#" method="POST">
						<div className="md:col-span-1">
							<label htmlFor="beneficiary" className="mb-1 block text-sm font-medium text-gray-700">
								Beneficiario
							</label>
							<input
								id="beneficiary"
								name="beneficiary"
								type="text"
								className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#BF0F0F] focus:outline-none focus:ring-1 focus:ring-[#BF0F0F]"
								placeholder="Nombre del beneficiario"
								required
							/>
						</div>

						<div className="md:col-span-1">
							<label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
								Teléfono
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#BF0F0F] focus:outline-none focus:ring-1 focus:ring-[#BF0F0F]"
								placeholder="Número de contacto"
								required
							/>
						</div>

						<div className="md:col-span-2">
							<label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
								Observaciones
							</label>
							<textarea
								id="notes"
								name="notes"
								rows={4}
								className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#BF0F0F] focus:outline-none focus:ring-1 focus:ring-[#BF0F0F]"
								placeholder="Detalles adicionales"
							/>
						</div>

						<div className="md:col-span-2">
							<button
								type="submit"
								className="inline-flex rounded-md bg-[#BF0F0F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#A61B26]"
							>
								Registrar solicitud
							</button>
						</div>
					</form>
				</section>
			</section>
		</main>
	);
}
