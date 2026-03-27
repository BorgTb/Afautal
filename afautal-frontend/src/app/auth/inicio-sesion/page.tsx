"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { loginUser, isAuthenticated, isTemporaryPassword, loading } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            if (isTemporaryPassword) {
                router.replace("/auth/cambio-contrasena-inicial");
            } else {
                router.replace("/dashboard/perfil");
            }
        }
    }, [isAuthenticated, isTemporaryPassword, loading, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await loginUser(identifier, password);
        } catch (loginError) {
            const message = loginError instanceof Error ? loginError.message : "No fue posible iniciar sesion.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Iniciar Sesion</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        No tienes una cuenta?{" "}
                        <Link href="/auth/registro" className="font-medium text-[#BF0F0F] hover:text-[#A61B26]">
                            Registrate aqui
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="identifier" className="sr-only">
                                Correo Electronico
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="email"
                                autoComplete="email"
                                required
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
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
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
                                placeholder="Contrasena"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-700">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BF0F0F] hover:bg-[#A61B26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0F0F] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Iniciando..." : "Iniciar sesion"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}