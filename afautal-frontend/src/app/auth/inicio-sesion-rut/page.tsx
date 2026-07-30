"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InicioSesionRutRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/inicio-sesion");
  }, [router]);
  return null;
}
