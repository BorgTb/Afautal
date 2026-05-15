export interface AuthUser {
  id: number;
  username: string;
  email: string;
  rut?: string;
  nombre_completo?: string;
  unidad_academica?: string;
  password_temporal?: boolean;
  role?: {
    id: number;
    name: string;
    type: string;
  };
  solicitud?: {
    id?: number;
    documentId?: string;
    rut?: string;
    fecha_nacimiento?: string;
    unidad_academica?: string;
    tipo_contrato?: string;
    categoria?: string;
    jerarquia?: string;
    region?: { nombre: string };
    comuna?: { nombre: string };
    ciudad?: { nombre: string };
    direccion_particular?: string;
    banco?: string;
    tipo_cuenta?: string;
  };
}

export interface LoginResponse {
  jwt: string;
  user: AuthUser;
}

export interface RegistroSolicitudPayload {
  rut: string;
  nombre_completo: string;
  correo_electronico: string;
  telefono?: string;
  unidad_academica?: string;
  fecha_nacimiento?: string;
  tipo_contrato?: string;
  categoria?: string;
  jerarquia?: string;
  region?: string;
  comuna?: string;
  ciudad?: string;
  direccion_particular?: string;
  banco?: string;
  tipo_cuenta?: string;
}

export interface RegistroOptions {
  tipo_contrato: { documentId: string; nombre: string }[];
  categoria: { documentId: string; nombre: string }[];
  jerarquia: { documentId: string; nombre: string }[];
  tipo_cuenta: { documentId: string; nombre: string }[];
  banco: { documentId: string; nombre: string }[];
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
    categoria: payload.categoria,
    jerarquia: payload.jerarquia,
    region: payload.region?.trim(),
    comuna: payload.comuna?.trim(),
    ciudad: payload.ciudad?.trim(),
    direccion_particular: payload.direccion_particular?.trim(),
    banco: payload.banco?.trim(),
    tipo_cuenta: payload.tipo_cuenta,
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
  const [tcRes, catRes, jerRes, tcCuentaRes, bancoRes] = await Promise.all([
    fetch(`${STRAPI_URL}/api/tipos-contrato?sort=nombre:asc&pagination[limit]=100`, { cache: "no-store" }),
    fetch(`${STRAPI_URL}/api/categorias?sort=nombre:asc&pagination[limit]=100`, { cache: "no-store" }),
    fetch(`${STRAPI_URL}/api/jerarquias?sort=nombre:asc&pagination[limit]=100`, { cache: "no-store" }),
    fetch(`${STRAPI_URL}/api/tipos-cuenta?sort=nombre:asc&pagination[limit]=100`, { cache: "no-store" }),
    fetch(`${STRAPI_URL}/api/bancos?sort=nombre:asc&pagination[limit]=100`, { cache: "no-store" })
  ]);

  const [tcBody, catBody, jerBody, tcCuentaBody, bancoBody] = await Promise.all([
    safeJson<{ data?: { documentId: string; nombre: string }[] }>(tcRes),
    safeJson<{ data?: { documentId: string; nombre: string }[] }>(catRes),
    safeJson<{ data?: { documentId: string; nombre: string }[] }>(jerRes),
    safeJson<{ data?: { documentId: string; nombre: string }[] }>(tcCuentaRes),
    safeJson<{ data?: { documentId: string; nombre: string }[] }>(bancoRes)
  ]);

  return {
    tipo_contrato: tcBody.data || [],
    categoria: catBody.data || [],
    jerarquia: jerBody.data || [],
    tipo_cuenta: tcCuentaBody.data || [],
    banco: bancoBody.data || [],
  };
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

export interface ExternalClientData {
  cli_rut: string;
  cli_emp_descrip_giro: string;
  com_idn: string;
  cli_emp_fono_contacto: string;
  cli_emp_mail: string;
  ciud_idn: string;
  cli_digito: string;
  cli_nombre: string;
  cli_emp_direccion: string;
  ciud_nombre: string;
  cli_emp_fono: string;
  cli_emp_nombre_contacto: string;
  cli_emp_monto_linea_credito: string;
  cli_emp_clave_interna: string;
}

export interface ExternalRegisterFuncionarioPayload {
  rut: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  unidadAcademica?: string;
  fechaNacimiento?: string;
  jerarquia?: string;
  ciudadId?: number;
  comunaId?: number;
  direccionParticular?: string;
}

export async function fetchExternalClientData(rut: string): Promise<ExternalClientData | null> {
  try {
    const response = await fetch(`/api/external-data?rut=${rut}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as ExternalClientData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching external client data:", error);
    return null;
  }
}

export async function registerExternalFuncionario(
  payload: ExternalRegisterFuncionarioPayload
): Promise<{ ok: boolean; message?: string }> {
  const response = await fetch("/api/external-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await safeJson<{ ok?: boolean; message?: string; error?: string }>(response);

  if (!response.ok) {
    throw new Error(body.error || body.message || "No se pudo crear el usuario en sistema externo.");
  }

  return {
    ok: Boolean(body.ok),
    message: body.message,
  };
}
