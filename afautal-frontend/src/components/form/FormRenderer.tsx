"use client";

import type { CampoFormulario, FormValues, FormFiles, CampoTexto, CampoTextarea, CampoFecha, CampoSelect } from "@/lib/servicios";
import FormFieldText from "./fields/FormFieldText";
import FormFieldTextarea from "./fields/FormFieldTextarea";
import FormFieldNumber from "./fields/FormFieldNumber";
import FormFieldSelect from "./fields/FormFieldSelect";
import FormFieldRadio from "./fields/FormFieldRadio";
import FormFieldCheckbox from "./fields/FormFieldCheckbox";
import FormFieldSwitch from "./fields/FormFieldSwitch";
import FormFieldDate from "./fields/FormFieldDate";
import FormFieldUpload from "./fields/FormFieldUpload";
import FormFieldMessage from "./fields/FormFieldMessage";

type OldCampo = {
  id: number;
  nombre_variable: string;
  etiqueta: string;
  tipo: "texto" | "textarea" | "numero" | "fecha" | "seleccion" | "radio" | "checkbox" | "switch" | "upload" | "mensaje";
  opciones?: string;
  requerido: boolean;
  placeholder?: string | null;
  valor_defecto?: string | null;
  min?: number | null;
  max?: number | null;
  filas?: number;
  multiple?: boolean;
  contenido?: string | null;
};

function isOldFormat(campos: any[]): campos is OldCampo[] {
  return campos.length > 0 && !("__component" in campos[0]);
}

function splitOps(raw: string | undefined | null): { id: number; label: string; valor: string }[] {
  return (raw || "").split(",").filter(Boolean).map((o, i) => ({
    id: i, label: o.trim(), valor: o.trim(),
  }));
}

function normalizeCampo(old: OldCampo): CampoFormulario {
  const base = { id: old.id, nombre_variable: old.nombre_variable, etiqueta: old.etiqueta, requerido: old.requerido ?? true };
  switch (old.tipo) {
    case "texto":
      return { ...base, __component: "formulario.campo-texto" as const, placeholder: old.placeholder ?? null, valor_defecto: old.valor_defecto ?? null };
    case "textarea":
      return { ...base, __component: "formulario.campo-textarea" as const, placeholder: old.placeholder ?? null, filas: old.filas ?? 4, valor_defecto: old.valor_defecto ?? null };
    case "numero":
      return { ...base, __component: "formulario.campo-numero" as const, placeholder: old.placeholder ?? null, min: old.min ?? null, max: old.max ?? null, valor_defecto: old.valor_defecto ? Number(old.valor_defecto) : null };
    case "fecha":
      return { ...base, __component: "formulario.campo-fecha" as const };
    case "seleccion":
      return { ...base, __component: "formulario.campo-select" as const, opciones: splitOps(old.opciones), valor_defecto: old.valor_defecto ?? null };
    case "radio":
      return { ...base, __component: "formulario.campo-radio" as const, opciones: splitOps(old.opciones), valor_defecto: old.valor_defecto ?? null };
    case "checkbox":
      return { ...base, __component: "formulario.campo-checkbox" as const, valor_defecto: old.valor_defecto === "true" };
    case "switch":
      return { ...base, __component: "formulario.campo-switch" as const, valor_defecto: old.valor_defecto === "true" };
    case "upload":
      return { ...base, __component: "formulario.campo-upload" as const, multiple: old.multiple ?? false };
    case "mensaje":
      return { __component: "formulario.campo-mensaje" as const, id: old.id, contenido: old.contenido ?? "" };
  }
}

export function normalizeCampos(campos: any[]): CampoFormulario[] {
  if (isOldFormat(campos)) {
    return campos.map(normalizeCampo);
  }
  return campos as CampoFormulario[];
}

type Props = {
  campos: CampoFormulario[];
  values: FormValues;
  files: FormFiles;
  onFieldChange: (nombreVariable: string, value: any) => void;
  onFilesChange: (nombreVariable: string, files: File[]) => void;
  errors: Record<string, string>;
};

export function getDefaultValues(campos: CampoFormulario[]): FormValues {
  const vals: FormValues = {};
  for (const c of campos) {
    switch (c.__component) {
      case "formulario.campo-texto":
      case "formulario.campo-textarea":
      case "formulario.campo-fecha":
        vals[c.nombre_variable] = c.valor_defecto ?? "";
        break;
      case "formulario.campo-numero":
        vals[c.nombre_variable] = c.valor_defecto ?? "";
        break;
      case "formulario.campo-select":
      case "formulario.campo-radio":
        vals[c.nombre_variable] = c.valor_defecto ?? "";
        break;
      case "formulario.campo-checkbox":
        vals[c.nombre_variable] = c.valor_defecto ?? false;
        break;
      case "formulario.campo-switch":
        vals[c.nombre_variable] = c.valor_defecto ?? false;
        break;
    }
  }
  return vals;
}

export function validate(campos: CampoFormulario[], values: FormValues): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const c of campos) {
    if (!("requerido" in c) || !c.requerido) continue;
    const val = values[c.nombre_variable];
    if (val === undefined || val === null || val === "" || val === false) {
      errs[c.nombre_variable] = "Este campo es obligatorio";
    }
  }
  return errs;
}

export default function FormRenderer({ campos, values, files, onFieldChange, onFilesChange, errors }: Props) {
  return (
    <div className="space-y-6">
      {campos.map((campo) => {
        switch (campo.__component) {
          case "formulario.campo-texto":
            return (
              <FormFieldText
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? ""}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-textarea":
            return (
              <FormFieldTextarea
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? ""}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-numero":
            return (
              <FormFieldNumber
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? ""}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-select":
            return (
              <FormFieldSelect
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? ""}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-radio":
            return (
              <FormFieldRadio
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? ""}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-checkbox":
            return (
              <FormFieldCheckbox
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? false}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-switch":
            return (
              <FormFieldSwitch
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? false}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
              />
            );
          case "formulario.campo-fecha":
            return (
              <FormFieldDate
                key={campo.id || campo.nombre_variable}
                campo={campo}
                value={values[campo.nombre_variable] ?? ""}
                onChange={v => onFieldChange(campo.nombre_variable, v)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-upload":
            return (
              <FormFieldUpload
                key={campo.id || campo.nombre_variable}
                campo={campo}
                files={files[campo.nombre_variable] || []}
                onFilesChange={f => onFilesChange(campo.nombre_variable, f)}
                error={errors[campo.nombre_variable]}
              />
            );
          case "formulario.campo-mensaje":
            return <FormFieldMessage key={campo.id || "msg"} campo={campo} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
