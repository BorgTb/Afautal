"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { fetchRegistroOptions, submitSolicitudRegistro } from "@/lib/auth";
import { fetchRegiones, fetchCiudadesByRegion, fetchComunasByRegion, type Region, type Ciudad, type Comuna } from "@/lib/geography";

export default function RegisterPage() {
	const [step, setStep] = useState(1);
	const [rut, setRut] = useState("");
	const [nombreCompleto, setNombreCompleto] = useState("");
	const [correo, setCorreo] = useState("");
	const [telefono, setTelefono] = useState("");
	const [unidadAcademica, setUnidadAcademica] = useState("");
	const [fechaNacimiento, setFechaNacimiento] = useState("");
	const [tipoContratoOptions, setTipoContratoOptions] = useState<{ documentId: string; nombre: string }[]>([]);
	const [categoriaOptions, setCategoriaOptions] = useState<{ documentId: string; nombre: string }[]>([]);
	const [jerarquiaOptions, setJerarquiaOptions] = useState<{ documentId: string; nombre: string }[]>([]);
	const [tipoCuentaOptions, setTipoCuentaOptions] = useState<{ documentId: string; nombre: string }[]>([]);
	const [bancoOptions, setBancoOptions] = useState<{ documentId: string; nombre: string }[]>([]);
	const [tipoContrato, setTipoContrato] = useState("");
	const [categoria, setCategoria] = useState("");
	const [jerarquia, setJerarquia] = useState("");
	const [tipoCuenta, setTipoCuenta] = useState("");
	const [banco, setBanco] = useState("");
	
	const [regiones, setRegiones] = useState<Region[]>([]);
	const [ciudades, setCiudades] = useState<Ciudad[]>([]);
	const [comunas, setComunas] = useState<Comuna[]>([]);
	
	const [region, setRegion] = useState("");
	const [comuna, setComuna] = useState("");
	const [ciudad, setCiudad] = useState("");
	const [direccionParticular, setDireccionParticular] = useState("");
	const [aceptaDescuento, setAceptaDescuento] = useState(false);
	const [aceptaTerminos, setAceptaTerminos] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const stepContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let active = true;
		const loadInitialData = async () => {
			try {
				const [options, regs] = await Promise.all([
					fetchRegistroOptions(),
					fetchRegiones()
				]);
				if (!active) return;
				
				if (options.tipo_contrato && options.tipo_contrato.length > 0) {
					setTipoContratoOptions(options.tipo_contrato);
					setTipoContrato(options.tipo_contrato[0].documentId);
				}
				if (options.categoria && options.categoria.length > 0) {
					setCategoriaOptions(options.categoria);
					setCategoria(options.categoria[0].documentId);
				}
				if (options.jerarquia && options.jerarquia.length > 0) {
					setJerarquiaOptions(options.jerarquia);
					setJerarquia(options.jerarquia[0].documentId);
				}
				if (options.tipo_cuenta && options.tipo_cuenta.length > 0) {
					setTipoCuentaOptions(options.tipo_cuenta);
					setTipoCuenta(options.tipo_cuenta[0].documentId);
				}
				setRegiones(regs);
			} catch { /* Fallback */ }
		};
		void loadInitialData();
		return () => { active = false; };
	}, []);

	useEffect(() => {
		if (region) {
			const reg = regiones.find(r => r.documentId === region);
			if (reg) {
				fetchCiudadesByRegion(reg.documentId).then(setCiudades).catch(console.error);
				fetchComunasByRegion(reg.documentId).then(setComunas).catch(console.error);
			}
		} else {
			setCiudades([]);
			setComunas([]);
		}
		setCiudad("");
		setComuna("");
	}, [region, regiones]);

	// Animación de entrada de cada paso con GSAP
	useEffect(() => {
		if (stepContainerRef.current) {
			gsap.fromTo(
				stepContainerRef.current,
				{ opacity: 0, x: 20 },
				{ opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
			);
		}
	}, [step]);

	const nextStep = () => {
		if (step === 1) {
			if (!rut || !nombreCompleto || !ciudad || !comuna || !region || !fechaNacimiento) {
				setError("Por favor completa los campos obligatorios.");
				return;
			}
		} else if (step === 2) {
			if (!tipoContrato || !jerarquia) {
				setError("Por favor completa los campos académicos.");
				return;
			}
		}
		setError(null);
		setStep(step + 1);
	};

	const prevStep = () => {
		setError(null);
		setStep(step - 1);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!aceptaTerminos) { setError("Debes aceptar los términos."); return; }
		if (!correo) { setError("El correo es obligatorio."); return; }
		setError(null);
		setSubmitting(true);
		try {
			await submitSolicitudRegistro({
				rut, nombre_completo: nombreCompleto, correo_electronico: correo, 
				telefono: `+569${telefono}`,
				unidad_academica: unidadAcademica, fecha_nacimiento: fechaNacimiento,
				tipo_contrato: tipoContrato, categoria, jerarquia, region, comuna, ciudad,
				direccion_particular: direccionParticular || "No especificada",
				banco: banco, tipo_cuenta: tipoCuenta,
			});
			setStep(4);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error al enviar la solicitud.");
		} finally { setSubmitting(false); }
	};

	const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-[#BF0F0F] focus:border-[#BF0F0F] text-black bg-white placeholder-gray-500 sm:text-sm font-medium transition-colors";
	const labelClasses = "block text-sm font-bold text-gray-800 mb-1";

	if (step === 4) {
		return (
			<div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 px-4 py-2">
				<div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 success-card">
					<div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
						<svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-3xl font-black text-gray-900">¡Solicitud Enviada!</h2>
					<p className="text-gray-700 leading-relaxed font-medium">
						Tu solicitud ha sido recibida correctamente. Revisaremos tu información y te enviaremos tus accesos al correo una vez aprobada.
					</p>
					<div className="pt-6">
						<Link href="/" className="inline-block py-3 px-8 bg-[#BF0F0F] text-white font-bold rounded-lg hover:bg-[#A61B26] transition-transform shadow-md">
							Volver al Inicio
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 px-4 py-2 sm:px-6 lg:px-8 overflow-hidden">
			<div className="max-w-2xl w-full bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
				<div className="mb-6">
					<h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">Registro de Socio</h2>
					<div className="mt-6 relative">
						<div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
						<div className="relative flex justify-between items-center px-2">
							{[1, 2, 3].map((s) => (
								<div key={s} className="flex flex-col items-center z-10">
									<div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 ${step >= s ? "bg-[#BF0F0F] text-white scale-110 shadow-lg" : "bg-gray-200 text-gray-500 shadow-inner"}`}>
										{s}
									</div>
									<span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${step >= s ? "text-[#BF0F0F]" : "text-gray-400"}`}>
										{s === 1 ? "Personal" : s === 2 ? "Académico" : "Acceso"}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit}>
					<div ref={stepContainerRef}>
						{step === 1 && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
								<div className="md:col-span-1">
									<label className={labelClasses}>RUT (Sin puntos ni guion)</label>
									<input 
										type="text" 
										required 
										value={rut} 
										onChange={(e) => {
											const val = e.target.value.replace(/[^0-9kK]/g, "").slice(0, 9);
											setRut(val);
										}} 
										className={inputClasses} 
										placeholder="Ej: 123456789" 
									/>
								</div>
								<div className="md:col-span-1">
									<label className={labelClasses}>Nombre Completo</label>
									<input type="text" required value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className={inputClasses} />
								</div>
								<div>
									<label className={labelClasses}>Fecha Nacimiento</label>
									<input type="date" required value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className={inputClasses} />
								</div>
								<div>
									<label className={labelClasses}>Teléfono</label>
									<div className="flex mt-1 rounded-md shadow-sm border border-gray-400 overflow-hidden group focus-within:border-[#BF0F0F] focus-within:ring-1 focus-within:ring-[#BF0F0F] transition-colors">
										<span className="inline-flex items-center justify-center whitespace-nowrap px-3.5 bg-gray-100 text-gray-800 font-black sm:text-sm border-r border-gray-300 group-focus-within:bg-red-50 group-focus-within:text-[#BF0F0F] group-focus-within:border-[#BF0F0F] transition-colors">
											+56 9
										</span>
										<input 
											type="tel" 
											value={telefono} 
											onChange={(e) => {
												const val = e.target.value.replace(/\D/g, "").slice(0, 8);
												setTelefono(val);
											}} 
											className="block w-full px-3 py-2 text-black bg-white placeholder-gray-500 sm:text-sm font-medium focus:ring-0 focus:outline-none border-none" 
											placeholder="12345678" 
										/>
									</div>
								</div>
								<div>
									<label className={labelClasses}>Región</label>
									<select required value={region} onChange={(e) => setRegion(e.target.value)} className={inputClasses}>
										<option value="">Seleccionar Región</option>
										{regiones.map(r => <option key={r.documentId} value={r.documentId}>{r.nombre}</option>)}
									</select>
								</div>
								<div>
									<label className={labelClasses}>Ciudad</label>
									<select required value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={inputClasses} disabled={!region}>
										<option value="">Seleccionar Ciudad</option>
										{ciudades.map(c => <option key={c.documentId} value={c.documentId}>{c.nombre}</option>)}
									</select>
								</div>
								<div>
									<label className={labelClasses}>Comuna</label>
									<select required value={comuna} onChange={(e) => setComuna(e.target.value)} className={inputClasses} disabled={!region}>
										<option value="">Seleccionar Comuna</option>
										{comunas.map(c => <option key={c.documentId} value={c.documentId}>{c.nombre}</option>)}
									</select>
								</div>
								<div className="md:col-span-2">
									<label className={labelClasses}>Dirección Particular</label>
									<input type="text" value={direccionParticular} onChange={(e) => setDireccionParticular(e.target.value)} className={inputClasses} />
								</div>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-4">
								<div>
									<label className={labelClasses}>Unidad Académica (Opcional)</label>
									<input type="text" value={unidadAcademica} onChange={(e) => setUnidadAcademica(e.target.value)} className={inputClasses} />
								</div>
								<div>
									<label className={labelClasses}>Tipo de Contrato</label>
									<select value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} className={inputClasses}>
										{tipoContratoOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
									</select>
								</div>
								<div>
									<label className={labelClasses}>Categoría</label>
									<select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClasses}>
										{categoriaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
									</select>
								</div>
								<div>
									<label className={labelClasses}>Jerarquía</label>
									<select value={jerarquia} onChange={(e) => setJerarquia(e.target.value)} className={inputClasses}>
										{jerarquiaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
									</select>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-5">
								<div>
									<label className={labelClasses}>Banco (Opcional)</label>
									<select value={banco} onChange={(e) => setBanco(e.target.value)} className={inputClasses}>
										<option value="">Seleccionar Banco</option>
										{bancoOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
									</select>
								</div>
								<div>
									<label className={labelClasses}>Tipo de Cuenta (Opcional)</label>
									<select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} className={inputClasses}>
										<option value="">Seleccionar Tipo de Cuenta</option>
										{tipoCuentaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
									</select>
								</div>
								<div>
									<label className={labelClasses}>Correo Electrónico</label>
									<input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={inputClasses} placeholder="ejemplo@correo.cl" />
								</div>
								<label htmlFor="aceptaTerminos" className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-300 transition-colors">
									<input id="aceptaTerminos" type="checkbox" required checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="h-5 w-5 text-[#BF0F0F] border-gray-400 rounded focus:ring-[#BF0F0F] mt-1" />
									<span className="ml-3 text-sm font-bold text-gray-800 leading-tight">He leído y acepto los estatutos y términos de privacidad de AFAUTAL.</span>
								</label>
							</div>
						)}
					</div>

					{error && (
						<div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm font-black rounded shadow-sm">
							{error}
						</div>
					)}

					<div className="flex justify-between items-center mt-8">
						{step > 1 ? (
							<button type="button" onClick={prevStep} className="py-2 px-5 border-2 border-gray-300 rounded-lg text-sm font-black text-gray-800 hover:bg-gray-100 transition-all flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
								Anterior
							</button>
						) : <div />}
						
						{step < 3 ? (
							<button type="button" onClick={nextStep} className="py-2.5 px-8 bg-[#BF0F0F] text-white rounded-lg shadow-xl hover:bg-[#A61B26] font-black transition-all active:scale-95 flex items-center gap-2">
								Siguiente
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
							</button>
						) : (
							<button type="submit" disabled={submitting} className="py-2.5 px-8 bg-[#BF0F0F] text-white rounded-lg shadow-xl hover:bg-[#A61B26] font-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
								{submitting ? "Procesando..." : "Finalizar Registro"}
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
							</button>
						)}
					</div>
				</form>
				
				<div className="text-center mt-6 border-t border-gray-200 pt-4">
					<p className="text-gray-700 font-bold text-sm">
						¿Ya eres socio?{" "}
						<Link href="/auth/inicio-sesion" className="text-[#BF0F0F] font-black hover:underline ml-1">
							Inicia sesión aquí
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
