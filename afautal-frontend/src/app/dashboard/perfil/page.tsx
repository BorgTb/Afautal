const quickActions = [
	"Actualizar datos personales",
	"Cambiar contraseña",
	"Gestionar métodos de contacto",
];

export default function ProfilePage() {
	return (
		<main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
			<section className="mx-auto w-full max-w-5xl">
				<header className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<p className="text-sm font-semibold uppercase tracking-wide text-[#BF0F0F]">
						Panel de socio
					</p>
					<h1 className="mt-2 text-3xl font-extrabold text-gray-900">
						Mi perfil
					</h1>
					<p className="mt-3 text-sm text-gray-600 sm:text-base">
						Revisa y administra tu información personal desde esta sección.
					</p>
				</header>

				<div className="grid gap-6 lg:grid-cols-3">
					<article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
						<h2 className="text-lg font-bold text-gray-900">Información básica</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							<div>
								<p className="text-xs uppercase tracking-wide text-gray-500">Nombre</p>
								<p className="mt-1 text-sm font-medium text-gray-800">Usuario de ejemplo</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wide text-gray-500">Correo</p>
								<p className="mt-1 text-sm font-medium text-gray-800">usuario@correo.com</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wide text-gray-500">Teléfono</p>
								<p className="mt-1 text-sm font-medium text-gray-800">+58 412 000 0000</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wide text-gray-500">Estado</p>
								<p className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
									Activo
								</p>
							</div>
						</div>
					</article>

					<aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-bold text-gray-900">Acciones rápidas</h2>
						<ul className="mt-4 space-y-3">
							{quickActions.map((action) => (
								<li key={action}>
									<button
										type="button"
										className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:border-[#BF0F0F] hover:text-[#BF0F0F]"
									>
										{action}
									</button>
								</li>
							))}
						</ul>
					</aside>
				</div>
			</section>
		</main>
	);
}
