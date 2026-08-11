"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { fetchRegistroOptions, submitSolicitudRegistro, fetchExternalClientData } from "@/lib/auth";
import { fetchRegiones, fetchCiudadesByRegion, fetchComunasByRegion, fetchCiudadByNombre, type Region, type Ciudad, type Comuna } from "@/lib/geography";
import { isValidRut } from "@/lib/rut";
import { StepIndicator, Step1Personal, Step2Academico, Step3Acceso, NavigationButtons } from "@/components/auth/RegistroShared";

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
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFetchingClient, setIsFetchingClient] = useState(false);
  const [lockedFields, setLockedFields] = useState<string[]>([]);
  const [externalClientFound, setExternalClientFound] = useState(false);
  const isAutoPopulating = useRef(false);

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

    if (!isAutoPopulating.current) {
      setCiudad("");
      setComuna("");
    }
  }, [region, regiones]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isValidRut(rut)) {
        setIsFetchingClient(true);
        try {
          const data = await fetchExternalClientData(rut);
          if (data) {
            setExternalClientFound(true);
            isAutoPopulating.current = true;
            const newLocked: string[] = [];

            if (data.cli_nombre && data.cli_nombre.trim() !== "") {
              setNombreCompleto(data.cli_nombre.trim());
              newLocked.push("nombreCompleto");
            }
            if (data.cli_emp_mail && data.cli_emp_mail.trim() !== "") {
              setCorreo(data.cli_emp_mail.trim());
              newLocked.push("correo");
            }
            if (data.cli_emp_direccion && data.cli_emp_direccion.trim() !== "") {
              setDireccionParticular(data.cli_emp_direccion.trim());
              newLocked.push("direccionParticular");
            }
            if (data.cli_emp_descrip_giro && data.cli_emp_descrip_giro.trim() !== "") {
              setUnidadAcademica(data.cli_emp_descrip_giro.trim());
              newLocked.push("unidadAcademica");
            }

            const phone = data.cli_emp_fono_contacto || data.cli_emp_fono;
            if (phone && phone.trim() !== "") {
              const cleanPhone = phone.replace(/\D/g, "");
              if (cleanPhone.length > 0) {
                setTelefono(cleanPhone.slice(-8));
                newLocked.push("telefono");
              }
            }

            if (data.ciud_nombre && data.ciud_nombre.trim() !== "") {
              const ciudadData = await fetchCiudadByNombre(data.ciud_nombre.trim());
              if (ciudadData) {
                setRegion(ciudadData.region.documentId);
                setCiudad(ciudadData.documentId);
                newLocked.push("region", "ciudad");
              }
            }
            setLockedFields(newLocked);

            setTimeout(() => {
              isAutoPopulating.current = false;
            }, 500);
          } else {
            setExternalClientFound(false);
            setLockedFields([]);
          }
        } catch (err) {
          setExternalClientFound(false);
          console.error("Error fetching client data:", err);
        } finally {
          setIsFetchingClient(false);
        }
      } else {
        setExternalClientFound(false);
        setLockedFields([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [rut]);

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
      if (!isValidRut(rut)) {
        setError("Ingresa un RUT válido con su dígito verificador (ej: 12.345.678-9).");
        return;
      }
      if (!nombreCompleto || !ciudad || !comuna || !region || !fechaNacimiento) {
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
        es_nuevo_externo: !externalClientFound,
      });
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar la solicitud.");
    } finally { setSubmitting(false); }
  };

  if (step === 4) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 px-4 py-2">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900">Solicitud Enviada!</h2>
          <p className="text-gray-700 leading-relaxed font-medium">
            Tu solicitud ha sido recibida correctamente. Revisaremos tu informaci&oacute;n y te enviaremos tus accesos al correo una vez aprobada.
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
        <StepIndicator step={step} />

        <form onSubmit={handleSubmit}>
          <div ref={stepContainerRef}>
            {step === 1 && (
              <Step1Personal
                rut={rut} setRut={setRut}
                nombreCompleto={nombreCompleto} setNombreCompleto={setNombreCompleto}
                fechaNacimiento={fechaNacimiento} setFechaNacimiento={setFechaNacimiento}
                telefono={telefono} setTelefono={setTelefono}
                region={region} setRegion={setRegion}
                ciudad={ciudad} setCiudad={setCiudad}
                comuna={comuna} setComuna={setComuna}
                direccionParticular={direccionParticular} setDireccionParticular={setDireccionParticular}
                regiones={regiones} ciudades={ciudades} comunas={comunas}
                isFetchingClient={isFetchingClient} lockedFields={lockedFields}
              />
            )}
            {step === 2 && (
              <Step2Academico
                unidadAcademica={unidadAcademica} setUnidadAcademica={setUnidadAcademica}
                tipoContrato={tipoContrato} setTipoContrato={setTipoContrato}
                categoria={categoria} setCategoria={setCategoria}
                jerarquia={jerarquia} setJerarquia={setJerarquia}
                tipoContratoOptions={tipoContratoOptions} categoriaOptions={categoriaOptions} jerarquiaOptions={jerarquiaOptions}
                lockedFields={lockedFields}
              />
            )}
            {step === 3 && (
              <Step3Acceso
                banco={banco} setBanco={setBanco}
                tipoCuenta={tipoCuenta} setTipoCuenta={setTipoCuenta}
                correo={correo} setCorreo={setCorreo}
                aceptaTerminos={aceptaTerminos} setAceptaTerminos={setAceptaTerminos}
                bancoOptions={bancoOptions} tipoCuentaOptions={tipoCuentaOptions}
                lockedFields={lockedFields}
              />
            )}
          </div>

          <NavigationButtons
            step={step} totalSteps={3}
            onPrev={prevStep} onNext={nextStep}
            onSubmit={handleSubmit} submitting={submitting} error={error}
          />
        </form>

        <div className="text-center mt-6 border-t border-gray-200 pt-4">
          <p className="text-gray-700 font-bold text-sm">
            Ya eres socio?{" "}
            <Link href="/auth/inicio-sesion" className="text-[#BF0F0F] font-black hover:underline ml-1">
              Inicia sesi&oacute;n aqu&iacute;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
