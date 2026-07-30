"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { completeExternalRegistration, fetchRegistroOptions } from "@/lib/auth";
import { fetchRegiones, fetchCiudadesByRegion, fetchComunasByRegion, type Region, type Ciudad, type Comuna } from "@/lib/geography";
import { useAuth } from "@/contexts/AuthContext";
import {
  StepIndicator, Step1Personal, Step2Academico, Step3Password, NavigationButtons,
} from "@/components/auth/RegistroShared";
import { AlertCircle } from "lucide-react";

export default function CompletarRegistroPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isTemporaryPassword, registroIncompleto, loading, completeFirstPasswordChange } = useAuth();
  const solicitud = (user as any)?.solicitud;

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !user) return;
    const s = (user as any)?.solicitud;

    let extData: { telefono?: string; direccion_particular?: string; ciud_nombre?: string } | null = null;
    try {
      const raw = localStorage.getItem("afautal-external-data");
      if (raw) extData = JSON.parse(raw);
    } catch { /* ignore */ }


    setRut(s?.rut || (user as any)?.rut || "");
    setNombreCompleto(s?.nombre_completo || (user as any)?.nombre_completo || "");
    setCorreo((user as any)?.email || s?.correo_electronico || "");
    setTelefono(s?.telefono?.replace(/[^0-9]/g, "").slice(-8) || extData?.telefono?.replace(/[^0-9]/g, "").slice(-8) || "");
    setUnidadAcademica(s?.unidad_academica || (user as any)?.unidad_academica || "");
    setFechaNacimiento(s?.fecha_nacimiento || "");
    setTipoContrato(prev => s?.tipo_contrato?.documentId || prev);
    setCategoria(prev => s?.categoria?.documentId || prev);
    setJerarquia(prev => s?.jerarquia?.documentId || prev);
    setRegion(s?.region?.documentId || "");
    setComuna(s?.comuna?.documentId || "");
    setCiudad(s?.ciudad?.documentId || "");
    setDireccionParticular(s?.direccion_particular || extData?.direccion_particular || "");

    if (s?.fecha_nacimiento && !registroIncompleto && isTemporaryPassword) {
      setStep(3);
    }
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/auth/inicio-sesion");
    } else if (!registroIncompleto && !isTemporaryPassword) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, registroIncompleto, isTemporaryPassword, router]);

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        const [options, regs] = await Promise.all([
          fetchRegistroOptions(),
          fetchRegiones()
        ]);
        if (!active) return;
        if (options.tipo_contrato?.length) {
          setTipoContratoOptions(options.tipo_contrato);
          if (!solicitud?.tipo_contrato) setTipoContrato(options.tipo_contrato[0].documentId);
        }
        if (options.categoria?.length) {
          setCategoriaOptions(options.categoria);
          if (!solicitud?.categoria) setCategoria(options.categoria[0].documentId);
        }
        if (options.jerarquia?.length) {
          setJerarquiaOptions(options.jerarquia);
          if (!solicitud?.jerarquia) setJerarquia(options.jerarquia[0].documentId);
        }
        if (options.tipo_cuenta?.length) setTipoCuentaOptions(options.tipo_cuenta);
        if (options.banco?.length) setBancoOptions(options.banco);
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
        fetchCiudadesByRegion(reg.documentId).then(setCiudades).catch(() => {});
        fetchComunasByRegion(reg.documentId).then(setComunas).catch(() => {});
      }
    } else {
      setCiudades([]);
      setComunas([]);
    }
  }, [region, regiones]);

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
    if (step === 3) return;
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => { setError(null); setStep(step - 1); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aceptaTerminos) { setError("Debes aceptar los términos."); return; }
    if (!correo) { setError("El correo es obligatorio."); return; }
    if (!newPassword || newPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    if (!token) { setError("Sesión no válida."); return; }
    setError(null);
    setSubmitting(true);
    try {
      if (registroIncompleto) {
        await completeExternalRegistration(token, {
          telefono: `+569${telefono}`,
          fecha_nacimiento: fechaNacimiento,
          tipo_contrato: tipoContrato,
          categoria,
          jerarquia,
          region,
          comuna,
          ciudad,
          direccion_particular: direccionParticular || "No especificada",
          banco,
          tipo_cuenta: tipoCuenta,
          correo_electronico: correo,
          unidad_academica: unidadAcademica,
        });
      }
      await completeFirstPasswordChange(newPassword);
      localStorage.removeItem("afautal-external-data");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al completar el registro.");
    } finally { setSubmitting(false); }
  };

  if (loading) return null;

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 px-4 py-2 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-2xl w-full bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900">Necesitamos algunos datos extras para terminar</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Completá los campos faltantes para finalizar tu registro en AFAUTAL.
            </p>
          </div>
        </div>

        <StepIndicator step={step} labels={["Personal", "Académico", "Contraseña"]} />

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
                lockedFields={["nombreCompleto"]}
                readOnlyRut readOnlyNombre
              />
            )}
            {step === 2 && (
              <Step2Academico
                unidadAcademica={unidadAcademica} setUnidadAcademica={setUnidadAcademica}
                tipoContrato={tipoContrato} setTipoContrato={setTipoContrato}
                categoria={categoria} setCategoria={setCategoria}
                jerarquia={jerarquia} setJerarquia={setJerarquia}
                tipoContratoOptions={tipoContratoOptions} categoriaOptions={categoriaOptions} jerarquiaOptions={jerarquiaOptions}
                banco={banco} setBanco={setBanco}
                tipoCuenta={tipoCuenta} setTipoCuenta={setTipoCuenta}
                bancoOptions={bancoOptions} tipoCuentaOptions={tipoCuentaOptions}
              />
            )}
            {step === 3 && (
              <Step3Password
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                aceptaTerminos={aceptaTerminos} setAceptaTerminos={setAceptaTerminos}
                correo={correo} setCorreo={setCorreo}
              />
            )}
          </div>

          <NavigationButtons
            step={step} totalSteps={3}
            onPrev={prevStep} onNext={nextStep}
            onSubmit={handleSubmit} submitting={submitting} error={error}
          />
        </form>
      </div>
    </div>
  );
}
