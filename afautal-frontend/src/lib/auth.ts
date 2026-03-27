export interface AuthUser {
  id: number;
  username: string;
  email: string;
  rut?: string;
  nombre_completo?: string;
  unidad_academica?: string;
  password_temporal?: boolean;
}

export interface LoginResponse {
  jwt: string;
  user: AuthUser;
}

export interface RegistroSolicitudPayload {
  rut: string;
  nombre_completo: string;
  correo_electronico: string;
  unidad_academica?: string;
  fecha_nacimiento?: string;
  tipo_contrato?: string;
  jerarquia?: string;
  region?: string;
  comuna?: string;
  ciudad?: string;
  direccion_particular?: string;
  acepta_descuento?: boolean;
}

export interface RegistroOptions {
  tipo_contrato: string[];
  jerarquia: string[];
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const AUTH_STORAGE_KEY = "afautal-auth";

export function getAuthStorageKey(): string {
  return AUTH_STORAGE_KEY;
}

async function safeJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error?: { message?: string } }).error;

    if (error?.message) {
      return error.message;
    }
  }

  if (typeof body === "object" && body !== null && "message" in body) {
    const message = (body as { message?: string }).message;

    if (message) {
      return message;
    }
  }

  return fallback;
}

export async function submitSolicitudRegistro(payload: RegistroSolicitudPayload): Promise<{ ok: boolean; message?: string }> {
  const normalizedPayload: RegistroSolicitudPayload = {
    ...payload,
    rut: payload.rut.trim(),
    nombre_completo: payload.nombre_completo.trim(),
    correo_electronico: payload.correo_electronico.trim().toLowerCase(),
    unidad_academica: payload.unidad_academica?.trim(),
    tipo_contrato: payload.tipo_contrato,
    jerarquia: payload.jerarquia,
    region: payload.region?.trim(),
    comuna: payload.comuna?.trim(),
    ciudad: payload.ciudad?.trim(),
    direccion_particular: payload.direccion_particular?.trim(),
  };

  const response = await fetch(`${STRAPI_URL}/api/auth/solicitud-registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedPayload),
  });

  const body = await safeJson<{ ok?: boolean; message?: string; error?: { message?: string } }>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, "No se pudo enviar la solicitud de registro."));
  }

  return {
    ok: Boolean(body.ok),
    message: body.message,
  };
}

export async function fetchRegistroOptions(): Promise<RegistroOptions> {
  const response = await fetch(`${STRAPI_URL}/api/auth/registro-options`, {
    cache: "no-store",
  });

  const body = await safeJson<{ data?: RegistroOptions; error?: { message?: string } }>(response);

  if (!response.ok || !body.data) {
    throw new Error(getErrorMessage(body, "No se pudieron obtener las opciones de registro."));
  }

  return body.data;
}

export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: normalizedIdentifier,
      password,
    }),
  });

  const body = await safeJson<LoginResponse & { error?: { message?: string } }>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, "No fue posible iniciar sesion."));
  }

  return body;
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${STRAPI_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const body = await safeJson<{ data?: AuthUser; error?: { message?: string } }>(response);

  if (!response.ok || !body.data) {
    throw new Error(getErrorMessage(body, "No se pudo recuperar el usuario actual."));
  }

  return body.data;
}

export async function changePasswordFirstLogin(
  token: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/auth/change-password-first-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      newPassword,
    }),
  });

  const body = await safeJson<{ error?: { message?: string }; message?: string }>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, "No se pudo cambiar la contraseña."));
  }
}
