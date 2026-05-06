const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export interface SolicitudOptica {
  id: number;
  documentId?: string;
  mensaje: string;
  estado: "pendiente" | "agendada" | "completada" | "rechazada" | "cancelada";
  fecha_solicitud: string;
  carga_familiar?: {
    id: number;
    nombre_completo: string;
    parentesco: string;
  };
}

export async function fetchMisSolicitudesOpticas(token: string): Promise<SolicitudOptica[]> {
  const response = await fetch(`${STRAPI_URL}/api/solicitudes-opticas?populate=*&sort=fecha_solicitud:desc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener las solicitudes ópticas.");
  }

  const body = await response.json();
  const data: SolicitudOptica[] = body.data || [];
  return data.filter(s => s.estado !== "cancelada");
}

export async function submitSolicitudOptica(token: string, data: { mensaje: string; carga_familiar?: number }): Promise<SolicitudOptica> {
  const response = await fetch(`${STRAPI_URL}/api/solicitudes-opticas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        ...data,
        fecha_solicitud: new Date().toISOString(),
        estado: "pendiente",
      }
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error?.message || "No se pudo enviar la solicitud óptica.");
  }

  return body.data;
}

export async function cancelarSolicitudOptica(token: string, id: number): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/solicitudes-opticas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        estado: "cancelada"
      }
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo cancelar la solicitud.");
  }
}
