const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export interface CargaFamiliar {
  id: number;
  documentId?: string;
  rut: string;
  nombre_completo: string;
  parentesco: "Cónyuge" | "Hijo/a" | "Padre/Madre" | "Conviviente Civil" | "Otro";
}

export async function fetchMisCargas(token: string): Promise<CargaFamiliar[]> {
  const response = await fetch(`${STRAPI_URL}/api/cargas-familiares?sort=createdAt:desc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener las cargas familiares.");
  }

  const body = await response.json();
  return body.data || [];
}

export async function addCarga(token: string, data: Omit<CargaFamiliar, "id" | "documentId">): Promise<CargaFamiliar> {
  const response = await fetch(`${STRAPI_URL}/api/cargas-familiares`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error?.message || "No se pudo agregar la carga familiar.");
  }

  return body.data;
}

export async function deleteCarga(token: string, id: number): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/cargas-familiares/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la carga familiar.");
  }
}
