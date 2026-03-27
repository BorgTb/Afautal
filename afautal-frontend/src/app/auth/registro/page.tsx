"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchRegistroOptions, submitSolicitudRegistro } from "@/lib/auth";

export default function RegisterPage() {
	const [rut, setRut] = useState("");
	const [nombreCompleto, setNombreCompleto] = useState("");
	const [correo, setCorreo] = useState("");
	const [unidadAcademica, setUnidadAcademica] = useState("");
	const [fechaNacimiento, setFechaNacimiento] = useState("");
	const [tipoContratoOptions, setTipoContratoOptions] = useState<string[]>(["Planta_regular"]);
	const [jerarquiaOptions, setJerarquiaOptions] = useState<string[]>(["Titular"]);
	const [tipoContrato, setTipoContrato] = useState("Planta_regular");
	const [jerarquia, setJerarquia] = useState("Titular");
	const [region, setRegion] = useState("");
	const [comuna, setComuna] = useState("");
	const [ciudad, setCiudad] = useState("");
	const [direccionParticular, setDireccionParticular] = useState("");
	const [aceptaDescuento, setAceptaDescuento] = useState(false);
	const [aceptaTerminos, setAceptaTerminos] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadRegistroOptions = async () => {
			try {
				const options = await fetchRegistroOptions();

				if (!active) {
					return;
				}

				if (options.tipo_contrato.length > 0) {
					setTipoContratoOptions(options.tipo_contrato);
					setTipoContrato(options.tipo_contrato[0]);
				}

				if (options.jerarquia.length > 0) {
					setJerarquiaOptions(options.jerarquia);
					setJerarquia(options.jerarquia[0]);
				}
			} catch {
				// Keep fallback options when dynamic options cannot be loaded.
			}
		};

		void loadRegistroOptions();

		return () => {
			active = false;
		};
	}, []);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!aceptaTerminos) {
			setError("Debes aceptar los terminos y condiciones.");
			return;
		}

		setError(null);
		setSuccessMessage(null);
		setSubmitting(true);

		try {
			const result = await submitSolicitudRegistro({
				rut,
				nombre_completo: nombreCompleto,
				correo_electronico: correo,
				unidad_academica: unidadAcademica,
				fecha_nacimiento: fechaNacimiento || undefined,
				tipo_contrato: tipoContrato || undefined,
				jerarquia: jerarquia || undefined,
				region,
				comuna,
				ciudad,
				direccion_particular: direccionParticular,
				acepta_descuento: aceptaDescuento,
			});

			setSuccessMessage(
				result.message || "Solicitud creada correctamente. Revisa tu correo para obtener tu contraseña temporal."
			);
			setRut("");
			setNombreCompleto("");
			setCorreo("");
			setUnidadAcademica("");
			setFechaNacimiento("");
			setTipoContrato(tipoContratoOptions[0] || "");
			setJerarquia(jerarquiaOptions[0] || "");
			setRegion("");
			setComuna("");
			setCiudad("");
			setDireccionParticular("");
			setAceptaDescuento(false);
			setAceptaTerminos(false);
		} catch (submitError) {
			const message = submitError instanceof Error ? submitError.message : "No fue posible crear la solicitud.";
			setError(message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crear Solicitud de Registro</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Ya tienes una cuenta?{" "}
						<Link href="/auth/inicio-sesion" className="font-medium text-[#BF0F0F] hover:text-[#A61B26]">
							Inicia sesion aqui
						</Link>
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="rut" className="sr-only">
								RUT
							</label>
							<input
								id="rut"
								name="rut"
								type="text"
								required
								value={rut}
								onChange={(event) => setRut(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="RUT"
							/>
						</div>

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
								value={nombreCompleto}
								onChange={(event) => setNombreCompleto(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Nombre completo"
							/>
						</div>

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
								value={correo}
								onChange={(event) => setCorreo(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Correo Electronico"
							/>
						</div>

						<div>
							<label htmlFor="unidad-academica" className="sr-only">
								Unidad academica
							</label>
							<input
								id="unidad-academica"
								name="unidadAcademica"
								type="text"
								value={unidadAcademica}
								onChange={(event) => setUnidadAcademica(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Unidad academica (opcional)"
							/>
						</div>

						<div>
							<label htmlFor="fecha-nacimiento" className="sr-only">
								Fecha de nacimiento
							</label>
							<input
								id="fecha-nacimiento"
								name="fechaNacimiento"
								type="date"
								value={fechaNacimiento}
								onChange={(event) => setFechaNacimiento(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
							/>
						</div>

						<div>
							<label htmlFor="tipo-contrato" className="sr-only">
								Tipo de contrato
							</label>
							<select
								id="tipo-contrato"
								name="tipoContrato"
								value={tipoContrato}
								onChange={(event) => setTipoContrato(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
							>
								{tipoContratoOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="jerarquia" className="sr-only">
								Jerarquia
							</label>
							<select
								id="jerarquia"
								name="jerarquia"
								value={jerarquia}
								onChange={(event) => setJerarquia(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
							>
								{jerarquiaOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="region" className="sr-only">
								Region
							</label>
							<input
								id="region"
								name="region"
								type="text"
								value={region}
								onChange={(event) => setRegion(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Region"
							/>
						</div>

						<div>
							<label htmlFor="comuna" className="sr-only">
								Comuna
							</label>
							<input
								id="comuna"
								name="comuna"
								type="text"
								value={comuna}
								onChange={(event) => setComuna(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Comuna"
							/>
						</div>

						<div>
							<label htmlFor="ciudad" className="sr-only">
								Ciudad
							</label>
							<input
								id="ciudad"
								name="ciudad"
								type="text"
								value={ciudad}
								onChange={(event) => setCiudad(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Ciudad"
							/>
						</div>

						<div>
							<label htmlFor="direccion-particular" className="sr-only">
								Direccion particular
							</label>
							<input
								id="direccion-particular"
								name="direccionParticular"
								type="text"
								value={direccionParticular}
								onChange={(event) => setDireccionParticular(event.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#BF0F0F] focus:border-[#BF0F0F] focus:z-10 sm:text-sm"
								placeholder="Direccion particular"
							/>
						</div>
					</div>

					<div className="flex items-center">
						<input
							id="acepta-descuento"
							name="aceptaDescuento"
							type="checkbox"
							checked={aceptaDescuento}
							onChange={(event) => setAceptaDescuento(event.target.checked)}
							className="h-4 w-4 text-[#BF0F0F] focus:ring-[#BF0F0F] border-gray-300 rounded"
						/>
						<label htmlFor="acepta-descuento" className="ml-2 block text-sm text-gray-900">
							Acepto descuento por planilla
						</label>
					</div>

					<div className="flex items-center">
						<input
							id="terms"
							name="terms"
							type="checkbox"
							checked={aceptaTerminos}
							onChange={(event) => setAceptaTerminos(event.target.checked)}
							className="h-4 w-4 text-[#BF0F0F] focus:ring-[#BF0F0F] border-gray-300 rounded"
						/>
						<label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
							Acepto los terminos y condiciones
						</label>
					</div>

					{error && <p className="text-sm text-red-700">{error}</p>}
					{successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

					<div>
						<button
							type="submit"
							disabled={submitting}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#BF0F0F] hover:bg-[#A61B26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0F0F] disabled:cursor-not-allowed disabled:opacity-70"
						>
							{submitting ? "Enviando solicitud..." : "Enviar solicitud"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
