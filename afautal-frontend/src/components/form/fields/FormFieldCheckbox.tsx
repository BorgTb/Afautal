"use client";

import type { CampoCheckbox } from "@/lib/servicios";

type Props = {
  campo: CampoCheckbox;
  value: boolean;
  onChange: (val: boolean) => void;
  error?: string;
};

export default function FormFieldCheckbox({ campo, value, onChange, error }: Props) {
  return (
    <div>
      <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${value ? 'border-[#BF0F0F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
        <input
          type="checkbox"
          required={campo.requerido}
          checked={value}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${value ? 'border-[#BF0F0F] bg-[#BF0F0F]' : 'border-gray-400'}`}>
          {value && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`font-bold ${value ? 'text-gray-900' : 'text-gray-600'}`}>
          {campo.etiqueta} {campo.requerido && <span className="text-red-500">*</span>}
        </span>
      </label>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
