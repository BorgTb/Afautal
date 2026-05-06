const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export interface PrecioGas {
  id: number;
  kg: number;
  precio: number;
  empresa: string;
}

export interface SolicitudGas {
  id: number;
  kg: number;
  precio: number;
  cantidad: number;
  estado: "pendiente" | "pagado" | "comprobante_subido" | "entregado" | "rechazado" | "cancelado";
  fecha_solicitud: string;
}

export interface DatosTransferencia {
  nombre: string;
  rut: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  correo_comprobante: string;
}

export async function fetchDatosTransferencia(token: string): Promise<DatosTransferencia | null> {
  const response = await fetch(`${STRAPI_URL}/api/datos-transferencia`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null; // Return null if not configured
  }

  const body = await response.json();
  return body.data || null;
}

export async function fetchPreciosGas(token?: string): Promise<PrecioGas[]> {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${STRAPI_URL}/api/precios-gas`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los precios del gas.");
  }

  const body = await response.json();
  return body.data;
}

export async function submitSolicitudGas(token: string, data: { kg: number; precio: number; cantidad: number }): Promise<SolicitudGas> {
  const response = await fetch(`${STRAPI_URL}/api/solicitudes-gas`, {
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
      },
    }),
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error?.message || "No se pudo crear la solicitud de gas.");
  }

  const body = await response.json();
  return body.data;
}

export async function fetchMySolicitudesGas(token: string): Promise<SolicitudGas[]> {
  const response = await fetch(`${STRAPI_URL}/api/solicitudes-gas?populate=*&sort=fecha_solicitud:desc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener tus solicitudes de gas.");
  }

  const body = await response.json();
  const data: SolicitudGas[] = body.data || [];
  return data.filter(s => s.estado !== "cancelado");
}

export async function uploadComprobante(token: string, file: File): Promise<number> {
  const formData = new FormData();
  formData.append("files", file);

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No se pudo subir el comprobante.");
  }

  const body = await response.json();
  return body[0].id; // Retorna el ID del archivo subido
}

export async function updateSolicitudGas(token: string, id: number, data: Partial<SolicitudGas> & { comprobante?: number }): Promise<SolicitudGas> {
  const response = await fetch(`${STRAPI_URL}/api/solicitudes-gas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la solicitud de gas.");
  }

  const body = await response.json();
  return body.data;
}
