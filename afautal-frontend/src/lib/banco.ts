const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export interface Banco {
  id: number;
  nombre: string;
  url: string;
}

export async function fetchBancos(token: string): Promise<Banco[]> {
  const response = await fetch(`${STRAPI_URL}/api/bancos?sort=nombre:asc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("No se pudieron obtener los bancos.");
    return [];
  }

  const body = await response.json();
  return body.data;
}
