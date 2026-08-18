"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Handshake, Receipt, BarChart3, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchServiciosHabilitados, type Servicio } from "@/lib/servicios";
import { fetchEstadoFinanciero, type EstadoFinanciero } from "@/lib/descuentos";
import PanelHeader, { SecureSessionBadge } from "@/components/dashboard/PanelHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import QuickServiceCard from "@/components/dashboard/QuickServiceCard";
import DashboardTabs, { type DashboardTabId } from "@/components/dashboard/DashboardTabs";
import ConveniosPanel from "@/components/dashboard/panels/ConveniosPanel";
import DeudasPanel from "@/components/dashboard/panels/DeudasPanel";
import FinanzasPanel from "@/components/dashboard/panels/FinanzasPanel";
import DescuentosPanel from "@/components/dashboard/panels/DescuentosPanel";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estadoFinanciero, setEstadoFinanciero] = useState<EstadoFinanciero | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTabId>("convenios");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchServiciosHabilitados(token)
      .then(setServicios)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchEstadoFinanciero(token)
      .then(setEstadoFinanciero)
      .catch(console.error);
  }, [token]);

  const scrollToTabs = (tab: DashboardTabId) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#BF0F0F] border-t-transparent" />
      </div>
    );
  }

  const conveniosCount = servicios.length + 1; // +1 plan complementario

  const anioActual = new Date().getFullYear();
  const totalIngresos = estadoFinanciero?.totalesGlobales.monto ?? null;
  const totalAnioActual =
    estadoFinanciero?.totalesPorAnio.find((a) => a.anio === anioActual)?.monto ?? null;
  const formatoMonto = (monto: number | null): string => {
    return monto === null ? "…" : `$${monto.toLocaleString("es-CL")}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PanelHeader
        title="Panel del asociado"
        subtitle={
          user?.nombre_completo
            ? `Bienvenido/a, ${user.nombre_completo}`
            : "Acceda a sus servicios y beneficios en línea."
        }
        badge={<SecureSessionBadge />}
        action={
          <Link href="/dashboard/perfil" className="portal-btn-light text-sm">
            <User size={16} />
            Mi perfil
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Estado de cuotas"
          value="Al día"
          note="Próximo vencimiento: 15-08-2026 (ficticio)"
        />
        <MetricCard
          label="Convenios activos"
          value={String(conveniosCount)}
          note={`${servicios.length} servicio${servicios.length !== 1 ? "s" : ""} habilitado${servicios.length !== 1 ? "s" : ""}`}
        />
        <MetricCard
          label="Ingresos acumulados"
          value={formatoMonto(totalIngresos)}
          note={
            totalIngresos === null
              ? "Cargando datos…"
              : totalIngresos === 0
              ? "Aún no hay descuentos cargados"
              : "Cuota social + seguro de salud (histórico)"
          }
        />
        <MetricCard
          label="Saldo disponible"
          value={formatoMonto(totalAnioActual)}
          note={
            totalAnioActual === null
              ? "Cargando datos…"
              : `Ingresos de ${anioActual} (sin egresos registrados)`
          }
        />
      </div>

      <div className="mt-8">
        <PanelHeader
          title="Servicios en línea"
          subtitle="Accesos principales del área privada."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickServiceCard
            icon={Handshake}
            title="Suscribir convenios"
            description="Revise beneficios disponibles, condiciones, documentos y adhesión digital."
            buttonLabel="Ver convenios"
            onAction={() => scrollToTabs("convenios")}
          />
          <QuickServiceCard
            icon={Receipt}
            title="Deudas y cuotas"
            description="Consulte cargos, pagos, cuotas pendientes y descargue su certificado."
            buttonLabel="Revisar estado"
            onAction={() => scrollToTabs("deudas")}
          />
          <QuickServiceCard
            icon={BarChart3}
            title="Estado de situación"
            description="Ingresos, gastos, saldos y ejecución presupuestaria de la Asociación."
            buttonLabel="Ver finanzas"
            onAction={() => scrollToTabs("finanzas")}
          />
        </div>
      </div>

      <div ref={tabsRef}>
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          panels={{
            convenios: <ConveniosPanel servicios={servicios} />,
            deudas: <DeudasPanel />,
            finanzas: <FinanzasPanel />,
            descuentos: <DescuentosPanel />,
          }}
        />
      </div>
    </div>
  );
}
