import { NextResponse } from "next/server";

function normalizeRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "");
}

function splitRut(normalizedRut: string): { rutSinDv: string; dv: string } {
  return {
    rutSinDv: normalizedRut.slice(0, -1),
    dv: normalizedRut.slice(-1).toLowerCase(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rut = searchParams.get("rut");
  if (!rut) {
    return NextResponse.json({ error: "RUT is required" }, { status: 400 });
  }
  // Normaliza el RUT y elimina el ultimo caracter (DV) antes de consultar.
  const normalizedRut = normalizeRut(rut);
  if (normalizedRut.length < 2) {
    return NextResponse.json({ error: "Invalid RUT" }, { status: 400 });
  }
  const { rutSinDv } = splitRut(normalizedRut);

  try {
    const response = await fetch(`https://telegestor.cl/afautal-data/index.php?tipo=obtener_cliente&cli_rut=${rutSinDv}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch external data" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

interface ExternalRegisterPayload {
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

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ExternalRegisterPayload;
    const normalizedRut = normalizeRut(payload.rut ?? "");

    if (normalizedRut.length < 2) {
      return NextResponse.json({ error: "RUT is required" }, { status: 400 });
    }

    if (!payload.nombreCompleto?.trim()) {
      return NextResponse.json({ error: "Nombre is required" }, { status: 400 });
    }

    const { rutSinDv, dv } = splitRut(normalizedRut);

    const body = new URLSearchParams({
      tipo: "registrar_funcionario",
      rut: rutSinDv,
      dv,
      nombre: payload.nombreCompleto.trim(),
      correo: (payload.correo ?? "").trim().toLowerCase(),
      telefono: (payload.telefono ?? "").replace(/\D/g, "").slice(-8),
      unidad_academica: payload.unidadAcademica?.trim() ?? "",
      fecha_nacimiento: payload.fechaNacimiento ?? "",
      jerarquia: payload.jerarquia ?? "",
      ciudad_id: payload.ciudadId ? String(payload.ciudadId) : "",
      comuna_id: payload.comunaId ? String(payload.comunaId) : "",
      direccion: payload.direccionParticular?.trim() ?? "",
    });

    const response = await fetch("https://telegestor.cl/afautal-data/index.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Failed to register external user" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
