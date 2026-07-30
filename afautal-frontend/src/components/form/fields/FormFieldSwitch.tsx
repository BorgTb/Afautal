"use client";

import type { CampoSell } from "@/lib/servicios";

type Props = {
  campo: CampoSell;
  value: boolean;
  onChange: (val: boolean) => void;
};

export default function FormFieldSwitch({ campo, value, onChange }: Props) {
  return (
    <div>
      <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-all">
        <span className="font-bold text-gray-700">{campo.etiqueta}</span>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#BF0F0F] focus:ring-offset-2 ${value ? 'bg-[#BF0F0F]' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </label>
    </div>
  );
}
