
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export interface Region {
  id: number;
  documentId: string;
  nombre: string;
}

export interface Ciudad {
  id: number;
  documentId: string;
  nombre: string;
}

export interface Comuna {
  id: number;
  documentId: string;
  nombre: string;
}

export async function fetchRegiones(): Promise<Region[]> {
  const response = await fetch(`${STRAPI_URL}/api/regiones?sort=nombre:asc&pagination[limit]=100`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Error al obtener regiones");
  const data = await response.json();
  return data.data;
}

export async function fetchCiudadesByRegion(regionDocumentId: string): Promise<Ciudad[]> {
  const response = await fetch(`${STRAPI_URL}/api/ciudades?filters[region][documentId][$eq]=${regionDocumentId}&sort=nombre:asc&pagination[limit]=100`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Error al obtener ciudades");
  const data = await response.json();
  return data.data;
}

export async function fetchComunasByRegion(regionDocumentId: string): Promise<Comuna[]> {
  const response = await fetch(`${STRAPI_URL}/api/comunas?filters[region][documentId][$eq]=${regionDocumentId}&sort=nombre:asc&pagination[limit]=100`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Error al obtener comunas");
  const data = await response.json();
  return data.data;
}
