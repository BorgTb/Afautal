"use client";

import type { CampoTextarea } from "@/lib/servicios";

type Props = {
  campo: CampoTextarea;
  value: string;
  onChange: (val: string) => void;
  error?: string;
};

export default function FormFieldTextarea({ campo, value, onChange, error }: Props) {
  return (
    <div>
      <label className="block text-sm font-black text-gray-700 uppercase mb-2">
        {campo.etiqueta} {campo.requerido && <span className="text-red-500">*</span>}
      </label>
      <textarea
        required={campo.requerido}
        placeholder={campo.placeholder || ""}
        rows={campo.filas || 4}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full p-3 border rounded-xl text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#BF0F0F] outline-none resize-none ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
