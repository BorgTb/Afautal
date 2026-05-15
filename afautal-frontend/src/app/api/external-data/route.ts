import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rut = searchParams.get("rut");
  if (!rut) {
    return NextResponse.json({ error: "RUT is required" }, { status: 400 });
  }
  // Normaliza el RUT y elimina el ultimo caracter (DV) antes de consultar.
  const normalizedRut = rut.replace(/[^0-9kK]/g, "");
  if (normalizedRut.length < 2) {
    return NextResponse.json({ error: "Invalid RUT" }, { status: 400 });
  }
  const rutSinDv = normalizedRut.slice(0, -1);

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
