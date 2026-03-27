"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar, MapPin, Shield, Building, Briefcase } from "lucide-react";

export default function PerfilPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-700 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <p className="text-lg text-slate-600">No se pudo cargar la información del usuario.</p>
      </div>
    );
  }

  // Extraemos la solicitud si existe
  const solicitud = user.solicitud || {};

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No registrada";
    const dateToFormat = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    return new Date(dateToFormat).toLocaleDateString('es-CL');
  };

  // Construir dirección completa
  const getDireccionCompleta = () => {
    const partes = [solicitud.direccion_particular, solicitud.comuna, solicitud.ciudad, solicitud.region].filter(Boolean);
    return partes.length > 0 ? partes.join(", ") : "No registrada";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Encabezado del Perfil */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-32 bg-gradient-to-r from-red-800 to-red-600 sm:h-40"></div>
        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-col sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-md sm:h-32 sm:w-32">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <User size={48} className="sm:h-16 sm:w-16" />
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:pb-2">
                <h2 className="text-2xl font-bold text-slate-800 capitalize">
                  {user.nombre_completo || "Socio AFAUTAL"}
                </h2>
                <p className="font-medium text-slate-500">{solicitud.jerarquia || "Sin jerarquía definida"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:pb-2">
              {solicitud.tipo_contrato && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20">
                  <Shield size={14} />
                  {solicitud.tipo_contrato}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Información Personal y Laboral */}
      <div className="grid gap-8 md:grid-cols-2">
        
        {/* Información Personal */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
            <User className="text-red-700" size={24} />
            Información Personal
          </h3>
          <div className="space-y-6">
            <InfoItem
              icon={<User className="text-slate-400" size={20} />}
              label="RUT"
              value={user.rut || solicitud.rut || "No registrado"}
            />
            <InfoItem
              icon={<Mail className="text-slate-400" size={20} />}
              label="Correo Electrónico"
              value={user.email}
            />
            <InfoItem
              icon={<Calendar className="text-slate-400" size={20} />}
              label="Fecha de Nacimiento"
              value={formatDate(solicitud.fecha_nacimiento)}
            />
            <InfoItem
              icon={<MapPin className="text-slate-400" size={20} />}
              label="Dirección"
              value={getDireccionCompleta()}
            />
          </div>
        </div>

        {/* Información Académica / Laboral */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Briefcase className="text-red-700" size={24} />
            Información Académica
          </h3>
          <div className="space-y-6">
            <InfoItem
              icon={<Building className="text-slate-400" size={20} />}
              label="Unidad Académica"
              value={user.unidad_academica || solicitud.unidad_academica || "No registrada"}
            />
            <InfoItem
              icon={<Briefcase className="text-slate-400" size={20} />}
              label="Jerarquía"
              value={solicitud.jerarquia || "No registrada"}
            />
            <InfoItem
              icon={<Shield className="text-slate-400" size={20} />}
              label="Tipo de Contrato"
              value={solicitud.tipo_contrato || "No registrado"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}