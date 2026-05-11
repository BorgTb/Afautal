import { getStrapiURL } from "./strapi";
import { PrecioGas, SolicitudGas } from "./gas";

export interface VentanaGas {
  id: number;
  documentId: string;
  nombre: string;
  estado: "activa" | "cerrada";
  fecha_inicio: string;
  fecha_fin?: string;
}

export async function fetchAdminPreciosGas(token: string): Promise<(PrecioGas & { status: string; documentId: string })[]> {
  // Fetch including drafts
  const res = await fetch(getStrapiURL("/api/precios-gas?status=draft"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  
  if (!res.ok) throw new Error("Error fetching admin prices");
  const data = await res.json();
  return data.data;
}

export async function upsertPrecioGas(token: string, data: Partial<PrecioGas>, documentId?: string) {
  const method = documentId ? "PUT" : "POST";
  const url = documentId ? `/api/precios-gas/${documentId}` : "/api/precios-gas";
  
  const res = await fetch(getStrapiURL(url), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { ...data } }), // Strapi 5 saves as draft if status=draft is not forced to publish
  });

  if (!res.ok) throw new Error("Error saving price");
  return res.json();
}

export async function deletePrecioGas(token: string, documentId: string) {
  const res = await fetch(getStrapiURL(`/api/precios-gas/${documentId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Error deleting price");
  return res.json();
}

export async function fetchVentanaActiva(token: string): Promise<VentanaGas | null> {
  const res = await fetch(getStrapiURL("/api/ventanas-gas/activa"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export async function iniciarVentanaGas(token: string) {
  const res = await fetch(getStrapiURL("/api/ventanas-gas/iniciar"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error starting window");
  return res.json();
}

export async function fetchSolicitudesPorVentana(token: string, ventanaId: string): Promise<any[]> {
  const res = await fetch(getStrapiURL(`/api/solicitudes-gas?filters[ventana_gas][documentId][$eq]=${ventanaId}&populate=usuario`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error fetching solicitudes");
  const data = await res.json();
  return data.data;
}
