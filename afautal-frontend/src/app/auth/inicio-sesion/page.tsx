import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Iniciar Sesion
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        No tienes una cuenta?{" "}
                        <Link
                            href="/auth/register"
                            className="font-medium text-[#BF0F0F] hover:text-[#A61B26]"
                        >
                            Registrate aqui
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" action="#" method="POST">
                    <input type="hidden" name="remember" defaultValue="true" />

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Correo Electronico
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
                                placeholder="Correo Electronico"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contrasena
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
                                placeholder="Contrasena"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#BF0F0F] focus:ring-[#BF0F0F] border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Recordarme
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-[#BF0F0F] hover:text-[#A61B26]">
                                Olvidaste tu contrasena?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BF0F0F] hover:bg-[#A61B26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0F0F]"
                        >
                            Iniciar sesion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}