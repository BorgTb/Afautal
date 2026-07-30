"use client";

import type { CampoSelect } from "@/lib/servicios";

type Props = {
  campo: CampoSelect;
  value: string;
  onChange: (val: string) => void;
  error?: string;
};

export default function FormFieldSelect({ campo, value, onChange, error }: Props) {
  return (
    <div>
      <label className="block text-sm font-black text-gray-700 uppercase mb-2">
        {campo.etiqueta} {campo.requerido && <span className="text-red-500">*</span>}
      </label>
      <select
        required={campo.requerido}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full p-3 border rounded-xl text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#BF0F0F] outline-none ${error ? 'border-red-400' : 'border-gray-300'}`}
      >
        <option value="">Seleccione una opción</option>
        {campo.opciones.map((opt, i) => (
          <option key={i} value={opt.valor}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
