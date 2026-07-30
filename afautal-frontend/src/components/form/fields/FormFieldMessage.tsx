import type { CampoMensaje } from "@/lib/servicios";
import { Info } from "lucide-react";

type Props = {
  campo: CampoMensaje;
};

export default function FormFieldMessage({ campo }: Props) {
  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex items-start gap-3">
      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      <div className="text-sm font-medium text-blue-900 whitespace-pre-wrap">
        {campo.contenido}
      </div>
    </div>
  );
}
