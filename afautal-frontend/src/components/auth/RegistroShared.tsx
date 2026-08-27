"use client";

import type { Region, Ciudad, Comuna } from "@/lib/geography";
import { normalizeRut, formatRut, isValidRut } from "@/lib/rut";

export const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-[#BF0F0F] focus:border-[#BF0F0F] text-black bg-white placeholder-gray-500 sm:text-sm font-medium transition-colors";
export const labelClasses = "block text-sm font-bold text-gray-800 mb-1";

export interface StepProps {
  step: number;
  stepContainerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export function StepWrapper({ step, stepContainerRef, children }: StepProps) {
  return (
    <div ref={stepContainerRef}>
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {children}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          {children}
        </div>
      )}
      {step === 3 && (
        <div className="space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

export function StepIndicator({ step, total = 3, labels: customLabels }: { step: number; total?: number; labels?: string[] }) {
  const labels = customLabels ?? ["Personal", "Academico", "Acceso"];
  return (
    <div className="mb-6">
      <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
        Registro de Socio
      </h2>
      <div className="mt-6 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
        <div className="relative flex justify-between items-center px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center z-10">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 ${step >= s ? "bg-[#BF0F0F] text-white scale-110 shadow-lg" : "bg-gray-200 text-gray-500 shadow-inner"}`}>
                {s}
              </div>
              <span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${step >= s ? "text-[#BF0F0F]" : "text-gray-400"}`}>
                {labels[s - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepIndicatorSimple({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="mt-4 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
      <div className="relative flex justify-between items-center px-2">
        {labels.map((label, idx) => {
          const s = idx + 1;
          return (
            <div key={s} className="flex flex-col items-center z-10">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${step >= s ? "bg-[#BF0F0F] text-white scale-110 shadow-lg" : "bg-gray-200 text-gray-500 shadow-inner"}`}>
                {s}
              </div>
              <span className={`text-[9px] mt-1.5 font-black uppercase tracking-widest ${step >= s ? "text-[#BF0F0F]" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NavigationButtons({
  step,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  submitting,
  error,
}: {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting?: boolean;
  error: string | null;
}) {
  return (
    <>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm font-black rounded shadow-sm">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mt-8">
        {step > 1 ? (
          <button type="button" onClick={onPrev} className="py-2 px-5 border-2 border-gray-300 rounded-lg text-sm font-black text-gray-800 hover:bg-gray-100 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
            Anterior
          </button>
        ) : <div />}
        {step < totalSteps ? (
          <button type="button" onClick={onNext} className="py-2.5 px-8 bg-[#BF0F0F] text-white rounded-lg shadow-xl hover:bg-[#A61B26] font-black transition-all active:scale-95 flex items-center gap-2">
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
    </>
  );
}

export interface Step1PersonalProps {
  rut: string;
  setRut: (v: string) => void;
  nombreCompleto: string;
  setNombreCompleto: (v: string) => void;
  fechaNacimiento: string;
  setFechaNacimiento: (v: string) => void;
  telefono: string;
  setTelefono: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  ciudad: string;
  setCiudad: (v: string) => void;
  comuna: string;
  setComuna: (v: string) => void;
  direccionParticular: string;
  setDireccionParticular: (v: string) => void;
  regiones: Region[];
  ciudades: Ciudad[];
  comunas: Comuna[];
  isFetchingClient?: boolean;
  lockedFields?: string[];
  inputClasses?: string;
  labelClasses?: string;
  readOnlyRut?: boolean;
  readOnlyNombre?: boolean;
}

export function Step1Personal({
  rut, setRut, nombreCompleto, setNombreCompleto,
  fechaNacimiento, setFechaNacimiento,
  telefono, setTelefono,
  region, setRegion, ciudad, setCiudad, comuna, setComuna,
  direccionParticular, setDireccionParticular,
  regiones, ciudades, comunas,
  isFetchingClient, lockedFields = [],
  readOnlyRut, readOnlyNombre,
}: Step1PersonalProps) {
  const ic = inputClasses;
  const lc = labelClasses;
  const showRutError = normalizeRut(rut).length >= 8 && !isValidRut(rut);

  return (
    <>
      <div className="md:col-span-1">
        <label className={lc}>RUT (con dígito verificador)</label>
        <div className="relative">
          <input type="text" required value={formatRut(rut)} readOnly={readOnlyRut}
            onChange={(e) => setRut(formatRut(e.target.value))}
            className={`${ic} ${showRutError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
            placeholder="Ej: 12.345.678-9"
          />
          {isFetchingClient && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#BF0F0F] border-t-transparent"></div>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-500">Debes ingresar tu RUT con su dígito verificador (ej: 12.345.678-9).</p>
        {showRutError && (
          <p className="mt-1 text-xs font-bold text-red-600">RUT inválido: revisa el dígito verificador.</p>
        )}
      </div>
      <div className="md:col-span-1">
        <label className={lc}>Nombre Completo</label>
        <input type="text" required value={nombreCompleto} readOnly={readOnlyNombre}
          onChange={(e) => setNombreCompleto(e.target.value)}
          className={ic} disabled={lockedFields.includes("nombreCompleto")} />
      </div>
      <div>
        <label className={lc}>Fecha Nacimiento</label>
        <input type="date" required value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)} className={ic} />
      </div>
      <div>
        <label className={lc}>Teléfono</label>
        <div className={`flex mt-1 rounded-md shadow-sm border border-gray-400 overflow-hidden group focus-within:border-[#BF0F0F] focus-within:ring-1 focus-within:ring-[#BF0F0F] transition-colors ${lockedFields.includes("telefono") ? "bg-gray-100" : ""}`}>
          <span className="inline-flex items-center justify-center whitespace-nowrap px-3.5 bg-gray-100 text-gray-800 font-black sm:text-sm border-r border-gray-300 group-focus-within:bg-red-50 group-focus-within:text-[#BF0F0F] group-focus-within:border-[#BF0F0F] transition-colors">
            +56 9
          </span>
          <input type="tel" value={telefono} disabled={lockedFields.includes("telefono")}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 8);
              setTelefono(val);
            }}
            className="block w-full px-3 py-2 text-black bg-white placeholder-gray-500 sm:text-sm font-medium focus:ring-0 focus:outline-none border-none disabled:bg-gray-100"
            placeholder="12345678" />
        </div>
      </div>
      <div>
        <label className={lc}>Región</label>
        <select required value={region} onChange={(e) => setRegion(e.target.value)}
          className={ic} disabled={lockedFields.includes("region")}>
          <option value="">Seleccionar Región</option>
          {regiones.map(r => <option key={r.documentId} value={r.documentId}>{r.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className={lc}>Ciudad</label>
        <select required value={ciudad} onChange={(e) => setCiudad(e.target.value)}
          className={ic} disabled={!region || lockedFields.includes("ciudad")}>
          <option value="">Seleccionar Ciudad</option>
          {ciudades.map(c => <option key={c.documentId} value={c.documentId}>{c.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className={lc}>Comuna</label>
        <select required value={comuna} onChange={(e) => setComuna(e.target.value)}
          className={ic} disabled={!region || lockedFields.includes("comuna")}>
          <option value="">Seleccionar Comuna</option>
          {comunas.map(c => <option key={c.documentId} value={c.documentId}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={lc}>Dirección Particular</label>
        <input type="text" value={direccionParticular}
          onChange={(e) => setDireccionParticular(e.target.value)}
          className={ic} disabled={lockedFields.includes("direccionParticular")} />
      </div>
    </>
  );
}

export interface Step2AcademicoProps {
  unidadAcademica: string;
  setUnidadAcademica: (v: string) => void;
  tipoContrato: string;
  setTipoContrato: (v: string) => void;
  categoria: string;
  setCategoria: (v: string) => void;
  jerarquia: string;
  setJerarquia: (v: string) => void;
  tipoContratoOptions: { documentId: string; nombre: string }[];
  categoriaOptions: { documentId: string; nombre: string }[];
  jerarquiaOptions: { documentId: string; nombre: string }[];
  lockedFields?: string[];
  banco?: string;
  setBanco?: (v: string) => void;
  tipoCuenta?: string;
  setTipoCuenta?: (v: string) => void;
  bancoOptions?: { documentId: string; nombre: string }[];
  tipoCuentaOptions?: { documentId: string; nombre: string }[];
}

export function Step2Academico({
  unidadAcademica, setUnidadAcademica,
  tipoContrato, setTipoContrato,
  categoria, setCategoria,
  jerarquia, setJerarquia,
  tipoContratoOptions, categoriaOptions, jerarquiaOptions,
  lockedFields = [],
  banco, setBanco,
  tipoCuenta, setTipoCuenta,
  bancoOptions, tipoCuentaOptions,
}: Step2AcademicoProps) {
  const ic = inputClasses;
  const lc = labelClasses;
  return (
    <>
      <div>
        <label className={lc}>Unidad Académica (Opcional)</label>
        <input type="text" value={unidadAcademica} onChange={(e) => setUnidadAcademica(e.target.value)}
          className={ic} disabled={lockedFields.includes("unidadAcademica")} />
      </div>
      <div>
        <label className={lc}>Tipo de Contrato</label>
        <select value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} className={ic}>
          {tipoContratoOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className={lc}>Categoría</label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={ic}>
          {categoriaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className={lc}>Jerarquía</label>
        <select value={jerarquia} onChange={(e) => setJerarquia(e.target.value)} className={ic}>
          {jerarquiaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
        </select>
      </div>
      {bancoOptions && bancoOptions.length > 0 && (
        <div>
          <label className={lc}>Banco (Opcional)</label>
          <select value={banco || ''} onChange={(e) => setBanco?.(e.target.value)} className={ic}>
            <option value="">Seleccionar Banco</option>
            {bancoOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
          </select>
        </div>
      )}
      {tipoCuentaOptions && tipoCuentaOptions.length > 0 && (
        <div>
          <label className={lc}>Tipo de Cuenta (Opcional)</label>
          <select value={tipoCuenta || ''} onChange={(e) => setTipoCuenta?.(e.target.value)} className={ic}>
            <option value="">Seleccionar Tipo de Cuenta</option>
            {tipoCuentaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
          </select>
        </div>
      )}
    </>
  );
}

export interface Step3PasswordProps {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  aceptaTerminos: boolean;
  setAceptaTerminos: (v: boolean) => void;
  correo: string;
  setCorreo: (v: string) => void;
}

export function Step3Password({
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  aceptaTerminos, setAceptaTerminos,
  correo, setCorreo,
}: Step3PasswordProps) {
  const ic = inputClasses;
  const lc = labelClasses;
  return (
    <>
      <div>
        <label className={lc}>Correo Electrónico</label>
        <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)}
          className={ic} placeholder="ejemplo@correo.cl" />
      </div>
      <div>
        <label className={lc}>Nueva Contraseña</label>
        <input type="password" required value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={ic} placeholder="Mínimo 6 caracteres" minLength={6} />
      </div>
      <div>
        <label className={lc}>Confirmar Contraseña</label>
        <input type="password" required value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={ic} placeholder="Repetí tu nueva contraseña" minLength={6} />
      </div>
      <label htmlFor="aceptaTerminosPw" className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-300 transition-colors">
        <input id="aceptaTerminosPw" type="checkbox" required checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="h-5 w-5 text-[#BF0F0F] border-gray-400 rounded focus:ring-[#BF0F0F] mt-1" />
        <span className="ml-3 text-sm font-bold text-gray-800 leading-tight">Acepto que el Departamento de Remuneraciones de la Universidad descuente el valor de la cuota social de mis remuneraciones mensuales para entregar dicha cuota a la Asociación de Funcionarios Académicos de la Universidad de Talca.</span>
      </label>
    </>
  );
}

export interface Step3AccesoProps {
  banco: string;
  setBanco: (v: string) => void;
  tipoCuenta: string;
  setTipoCuenta: (v: string) => void;
  correo: string;
  setCorreo: (v: string) => void;
  aceptaTerminos: boolean;
  setAceptaTerminos: (v: boolean) => void;
  bancoOptions: { documentId: string; nombre: string }[];
  tipoCuentaOptions: { documentId: string; nombre: string }[];
  lockedFields?: string[];
}

export function Step3Acceso({
  banco, setBanco,
  tipoCuenta, setTipoCuenta,
  correo, setCorreo,
  aceptaTerminos, setAceptaTerminos,
  bancoOptions, tipoCuentaOptions,
  lockedFields = [],
}: Step3AccesoProps) {
  const ic = inputClasses;
  const lc = labelClasses;
  return (
    <>
      <div>
        <label className={lc}>Banco (Opcional)</label>
        <select value={banco} onChange={(e) => setBanco(e.target.value)} className={ic}>
          <option value="">Seleccionar Banco</option>
          {bancoOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className={lc}>Tipo de Cuenta (Opcional)</label>
        <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} className={ic}>
          <option value="">Seleccionar Tipo de Cuenta</option>
          {tipoCuentaOptions.map(opt => <option key={opt.documentId} value={opt.documentId} className="text-black font-medium">{opt.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className={lc}>Correo Electrónico</label>
        <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)}
          className={ic} placeholder="ejemplo@correo.cl" disabled={lockedFields.includes("correo")} />
      </div>
      <label htmlFor="aceptaTerminos" className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-300 transition-colors">
        <input id="aceptaTerminos" type="checkbox" required checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="h-5 w-5 text-[#BF0F0F] border-gray-400 rounded focus:ring-[#BF0F0F] mt-1" />
        <span className="ml-3 text-sm font-bold text-gray-800 leading-tight">Acepto que el Departamento de Remuneraciones de la Universidad descuente el valor de la cuota social de mis remuneraciones mensuales para entregar dicha cuota a la Asociación de Funcionarios Académicos de la Universidad de Talca.</span>
      </label>
    </>
  );
}
