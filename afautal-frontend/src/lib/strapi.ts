type QueryValue = string | number | boolean | undefined | null;

export interface StrapiSingleResponse<T> {
  data: T | null;
  meta?: Record<string, unknown>;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta?: Record<string, unknown>;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

function normalizePath(path: string): string {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function buildQueryString(query?: Record<string, QueryValue> | string): string {
  if (!query) return "";
  if (typeof query === "string") return query.startsWith("?") ? query : `?${query}`;

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function getStrapiURL(path = ""): string {
  return `${STRAPI_URL}${normalizePath(path)}`;
}

export function getStrapiMediaURL(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

export async function strapiFetch<T>(
  path: string,
  options: RequestInit = {},
  query?: Record<string, QueryValue> | string
): Promise<T> {
  const url = `${getStrapiURL(path)}${buildQueryString(query)}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (STRAPI_TOKEN) {
    headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Strapi request failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

// Example helper for single types:
// const about = await getSingleType<{ titulo: string }>("quienes-somo", "populate=imagen");
export async function getSingleType<T>(
  apiName: string,
  query?: Record<string, QueryValue> | string
): Promise<StrapiSingleResponse<T>> {
  return strapiFetch<StrapiSingleResponse<T>>(`/api/${apiName}`, {}, query);
}

// Example helper for collection types:
// const posts = await getCollectionType<Post>("noticias", "populate=imagen");
export async function getCollectionType<T>(
  apiName: string,
  query?: Record<string, QueryValue> | string
): Promise<StrapiCollectionResponse<T>> {
  return strapiFetch<StrapiCollectionResponse<T>>(`/api/${apiName}`, {}, query);
}
