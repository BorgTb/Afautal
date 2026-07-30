"use client";

import { useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import type { CampoUpload } from "@/lib/servicios";

type Props = {
  campo: CampoUpload;
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
};

export default function FormFieldUpload({ campo, files, onFilesChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (campo.multiple) {
      onFilesChange([...files, ...selected]);
    } else {
      onFilesChange(selected.slice(0, 1));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-black text-gray-700 uppercase mb-2">
        {campo.etiqueta} {campo.requerido && <span className="text-red-500">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        multiple={campo.multiple}
        onChange={handleChange}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-slate-500 shrink-0" />
                <span className="text-sm font-bold text-gray-700 truncate">{file.name}</span>
              </div>
              <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 p-1 shrink-0">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSelect}
        className={`w-full p-4 border-2 border-dashed rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${error ? 'border-red-400 text-red-600' : 'border-gray-300 text-gray-600 hover:border-[#BF0F0F] hover:text-[#BF0F0F]'}`}
      >
        <Upload size={20} />
        {files.length > 0 ? "Agregar otro archivo" : "Seleccionar archivo"}
      </button>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
