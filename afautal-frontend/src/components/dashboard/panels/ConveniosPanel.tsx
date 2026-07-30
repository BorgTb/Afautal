import Link from "next/link";
import type { Servicio } from "@/lib/servicios";
import AgreementRow from "../AgreementRow";
import PanelHeader from "../PanelHeader";

const EXTRA_CONVENIOS: { nombre: string; descripcion: string; estado: string; slug: string }[] = [];

export default function ConveniosPanel({ servicios }: { servicios: Servicio[] }) {
  const allItems = [
    ...servicios.map((s) => ({
      slug: s.slug,
      nombre: s.nombre,
      descripcion: s.descripcion || "Beneficio disponible para asociados AFAUTAL.",
      href: `/dashboard/servicios/${s.slug}`,
    })),
    ...EXTRA_CONVENIOS.map((c) => ({
      ...c,
      href: `/dashboard/${c.slug}`,
    })),
  ];

  return (
    <div className="portal-card">
      <PanelHeader
        title="Convenios disponibles"
        subtitle="Revise beneficios, condiciones y solicite su adhesión."
      />

      {allItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No hay convenios disponibles en este momento.
        </p>
      ) : (
        allItems.map((item) => (
          <AgreementRow
            key={item.slug}
            title={item.nombre}
            description={item.descripcion}
            statusLabel="Disponible"
            statusVariant="warn"
            action={
              <Link href={item.href} className="portal-btn-primary text-sm">
                Ver detalle
              </Link>
            }
          />
        ))
      )}
    </div>
  );
}
