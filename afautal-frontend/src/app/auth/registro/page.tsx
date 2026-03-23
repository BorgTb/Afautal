import Link from "next/link";

export default function RegisterPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Crear Cuenta
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						¿Ya tienes una cuenta?{" "}
						<Link
							href="/auth/login"
							className="font-medium text-[#BF0F0F] hover:text-[#A61B26]"
						>
							Inicia sesión aquí
						</Link>
					</p>
				</div>

				<form className="mt-8 space-y-6" action="#" method="POST">
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="full-name" className="sr-only">
								Nombre completo
							</label>
							<input
								id="full-name"
								name="fullName"
								type="text"
								autoComplete="name"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Nombre completo"
							/>
						</div>

						<div>
							<label htmlFor="email-address" className="sr-only">
								Correo Electrónico
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Correo Electrónico"
							/>
						</div>

						<div>
							<label htmlFor="password" className="sr-only">
								Contraseña
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Contraseña"
							/>
						</div>

						<div>
							<label htmlFor="confirm-password" className="sr-only">
								Confirmar contraseña
							</label>
							<input
								id="confirm-password"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Confirmar contraseña"
							/>
						</div>
					</div>

					<div className="flex items-center">
						<input
							id="terms"
							name="terms"
							type="checkbox"
							required
							className="h-4 w-4 text-[#BF0F0F] focus:ring-[#BF0F0F] border-gray-300 rounded"
						/>
						<label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
							Acepto los términos y condiciones
						</label>
					</div>

					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BF0F0F] hover:bg-[#A61B26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0F0F]"
						>
							Crear cuenta
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
