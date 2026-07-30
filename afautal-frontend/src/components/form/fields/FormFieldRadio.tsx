"use client";

import type { CampoRadio } from "@/lib/servicios";

type Props = {
  campo: CampoRadio;
  value: string;
  onChange: (val: string) => void;
  error?: string;
};

export default function FormFieldRadio({ campo, value, onChange, error }: Props) {
  return (
    <div>
      <label className="block text-sm font-black text-gray-700 uppercase mb-2">
        {campo.etiqueta} {campo.requerido && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {campo.opciones.map((opt, i) => (
          <label key={i} className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${value === opt.valor ? 'border-[#BF0F0F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="radio"
              name={campo.nombre_variable}
              value={opt.valor}
              checked={value === opt.valor}
              onChange={() => onChange(opt.valor)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === opt.valor ? 'border-[#BF0F0F]' : 'border-gray-400'}`}>
              {value === opt.valor && <div className="w-2.5 h-2.5 rounded-full bg-[#BF0F0F]" />}
            </div>
            <span className={`ml-3 font-bold ${value === opt.valor ? 'text-gray-900' : 'text-gray-600'}`}>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
