import { getStrapiURL } from "./strapi";

export interface Servicio {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  habilitado: boolean;
}

export interface SolicitudServicio {
  id: number;
  mensaje: string;
  estado: "pendiente" | "agendada" | "completada" | "rechazada" | "cancelada";
  fecha_solicitud: string;
  carga_familiar?: {
    id: number;
    nombre_completo: string;
    parentesco: string;
  } | null;
  servicio?: Servicio | null;
}

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
    throw new Error("Error al obtener los servicios");
  }

  const data = await res.json();
  return data.data.map((item: any) => ({
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
    getStrapiURL(`/api/servicios?filters[slug][$eq]=${slug}`),
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
    mensaje: string;
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
