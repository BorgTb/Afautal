"use client";

import type { CampoNumero } from "@/lib/servicios";

type Props = {
  campo: CampoNumero;
  value: number | "";
  onChange: (val: number | "") => void;
  error?: string;
};

export default function FormFieldNumber({ campo, value, onChange, error }: Props) {
  return (
    <div>
      <label className="block text-sm font-black text-gray-700 uppercase mb-2">
        {campo.etiqueta} {campo.requerido && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        required={campo.requerido}
        placeholder={campo.placeholder || ""}
        min={campo.min ?? undefined}
        max={campo.max ?? undefined}
        value={value}
        onChange={e => {
          const raw = e.target.value;
          onChange(raw === "" ? "" : Number(raw));
        }}
        className={`w-full p-3 border rounded-xl text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#BF0F0F] outline-none ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
