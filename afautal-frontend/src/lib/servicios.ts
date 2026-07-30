import { getStrapiURL } from "./strapi";

export type BloqueContenido = {
  __component: "shared.contenido";
  id: number;
  contenido: string;
};

export type BloqueAlerta = {
  __component: "shared.alerta";
  id: number;
  tipo: "info" | "warning" | "success" | "error";
  titulo: string;
  mensaje: string;
};

type Opcion = {
  id: number;
  label: string;
  valor: string;
};

export type CampoTexto = {
  __component: "formulario.campo-texto";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  placeholder: string | null;
  requerido: boolean;
  valor_defecto: string | null;
};

export type CampoTextarea = {
  __component: "formulario.campo-textarea";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  placeholder: string | null;
  requerido: boolean;
  filas: number;
  valor_defecto: string | null;
};

export type CampoNumero = {
  __component: "formulario.campo-numero";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  placeholder: string | null;
  requerido: boolean;
  min: number | null;
  max: number | null;
  valor_defecto: number | null;
};

export type CampoSelect = {
  __component: "formulario.campo-select";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  requerido: boolean;
  opciones: Opcion[];
  valor_defecto: string | null;
};

export type CampoRadio = {
  __component: "formulario.campo-radio";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  requerido: boolean;
  opciones: Opcion[];
  valor_defecto: string | null;
};

export type CampoCheckbox = {
  __component: "formulario.campo-checkbox";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  requerido: boolean;
  valor_defecto: boolean;
};

export type CampoSell = {
  __component: "formulario.campo-switch";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  valor_defecto: boolean;
};

export type CampoFecha = {
  __component: "formulario.campo-fecha";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  requerido: boolean;
  valor_defecto?: string | null;
};

export type CampoUpload = {
  __component: "formulario.campo-upload";
  id: number;
  nombre_variable: string;
  etiqueta: string;
  requerido: boolean;
  multiple: boolean;
};

export type CampoMensaje = {
  __component: "formulario.campo-mensaje";
  id: number;
  contenido: string;
};

export type CampoFormulario =
  | CampoTexto
  | CampoTextarea
  | CampoNumero
  | CampoSelect
  | CampoRadio
  | CampoCheckbox
  | CampoSell
  | CampoFecha
  | CampoUpload
  | CampoMensaje;

export interface Servicio {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  habilitado: boolean;
  bloques?: (BloqueContenido | BloqueAlerta)[];
  campos_formulario?: CampoFormulario[];
}

export interface SolicitudServicio {
  id: number;
  mensaje?: string;
  datos_formulario?: Record<string, any>;
  estado: "pendiente" | "agendada" | "completada" | "rechazada" | "cancelada";
  fecha_solicitud: string;
  carga_familiar?: {
    id: number;
    nombre_completo: string;
    parentesco: string;
  } | null;
  servicio?: Servicio | null;
}

export type FormValues = Record<string, any>;
export type FormFiles = Record<string, File[]>;

export async function fetchServiciosHabilitados(token?: string): Promise<Servicio[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(
    getStrapiURL("/api/servicios?filters[habilitado][$eq]=true&sort=nombre:asc"),
    {
      headers,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.data || []).map((item: any) => ({
    id: item.id,
    ...(item.attributes || item),
  }));
}

export async function fetchServicioBySlug(slug: string, token?: string): Promise<Servicio | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(
    getStrapiURL(`/api/servicios?filters[slug][$eq]=${slug}&populate[bloques][populate]=*&populate[campos_formulario][populate]=*`),
    {
      headers,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Error al obtener el servicio");
  }

  const data = await res.json();
  if (data.data.length === 0) return null;

  return {
    id: data.data[0].id,
    ...(data.data[0].attributes || data.data[0]),
  };
}

export async function fetchMisSolicitudesServicio(servicioId: number, token: string): Promise<SolicitudServicio[]> {
  const res = await fetch(
    getStrapiURL(`/api/solicitudes-servicios?filters[servicio][id][$eq]=${servicioId}&populate=carga_familiar&sort=createdAt:desc`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error?.message || `Error fetching requests: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data.map((item: any) => {
    const attrs = item.attributes || item;
    return {
      id: item.id,
      mensaje: attrs.mensaje,
      datos_formulario: attrs.datos_formulario,
      estado: attrs.estado,
      fecha_solicitud: attrs.fecha_solicitud || attrs.createdAt,
      carga_familiar: attrs.carga_familiar?.data
        ? {
            id: attrs.carga_familiar.data.id,
            ...(attrs.carga_familiar.data.attributes || attrs.carga_familiar.data),
          }
        : attrs.carga_familiar
        ? {
            id: attrs.carga_familiar.id,
            ...attrs.carga_familiar,
          }
        : null,
    };
  });
}

export async function submitSolicitudServicio(
  token: string,
  payload: {
    mensaje?: string;
    datos_formulario?: Record<string, any>;
    servicio: number;
    carga_familiar?: number;
  }
) {
  const res = await fetch(getStrapiURL("/api/solicitudes-servicios"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        ...payload,
        estado: "pendiente",
        fecha_solicitud: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Error submitting request");
  }

  return res.json();
}

export async function cancelarSolicitudServicio(token: string, id: number) {
  const res = await fetch(getStrapiURL(`/api/solicitudes-servicios/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        estado: "cancelada",
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Error cancelling request");
  }

  return res.json();
}
