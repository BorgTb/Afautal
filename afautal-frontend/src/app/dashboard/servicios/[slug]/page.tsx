"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMisCargas, type CargaFamiliar } from "@/lib/carga";
import { 
  fetchServicioBySlug, 
  fetchMisSolicitudesServicio, 
  submitSolicitudServicio, 
  cancelarSolicitudServicio, 
  type Servicio, 
  type SolicitudServicio,
  type CampoFormulario,
  type FormValues,
  type FormFiles,
} from "@/lib/servicios";
import { CalendarPlus, History, UserCircle, Users, CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";
import FormRenderer, { getDefaultValues, validate, normalizeCampos } from "@/components/form/FormRenderer";
import { getStrapiURL } from "@/lib/strapi";

async function uploadFiles(token: string, files: File[]): Promise<number[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  for (const f of files) {
    formData.append("files", f);
  }
  const res = await fetch(getStrapiURL("/api/upload"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir archivos");
  const data = await res.json();
  return (data as any[]).map((item: any) => item.id);
}

export default function ServicioPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const { token } = useAuth();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [cargas, setCargas] = useState<CargaFamiliar[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [beneficiario, setBeneficiario] = useState<string>("socio");
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formFiles, setFormFiles] = useState<FormFiles>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const serv = await fetchServicioBySlug(slug, token);
        if (!serv || !serv.habilitado) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setServicio(serv);

        const campos = normalizeCampos(serv.campos_formulario || []);
        setFormValues(getDefaultValues(campos));

        const [c, s] = await Promise.all([
          fetchMisCargas(token),
          fetchMisSolicitudesServicio(serv.id, token)
        ]);
        setCargas(c);
        setSolicitudes(s);
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [token, slug]);

  const handleFieldChange = (name: string, value: any) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleFilesChange = (name: string, files: File[]) => {
    setFormFiles(prev => ({ ...prev, [name]: files }));
    if (formErrors[name]) {
      setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const showModal = (title: string, message: string, type: "success" | "error" | "confirm" = "success", onConfirm?: () => void) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !servicio) return;

    const errs = validate(normalizeCampos(servicio.campos_formulario || []), formValues);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      showModal("Campos Incompletos", "Revisa los campos obligatorios marcados en rojo.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const cargaFamiliarId = beneficiario !== "socio" ? Number(beneficiario) : undefined;

      const normalized = normalizeCampos(servicio.campos_formulario || []);
      const datos: FormValues = { ...formValues };

      for (const campo of normalized) {
        if (campo.__component === "formulario.campo-upload") {
          const fieldFiles = formFiles[campo.nombre_variable];
          if (fieldFiles && fieldFiles.length > 0) {
            const ids = await uploadFiles(token, fieldFiles);
            datos[campo.nombre_variable] = ids;
          }
        }
      }

      const resumenMensaje = Object.entries(datos)
        .map(([key, val]) => `${key}: ${val}`)
        .join(" | ");

      await submitSolicitudServicio(token, {
        mensaje: resumenMensaje || "Solicitud generada dinámicamente",
        datos_formulario: datos,
        servicio: servicio.id,
        carga_familiar: cargaFamiliarId
      });

      const s = await fetchMisSolicitudesServicio(servicio.id, token);
      setSolicitudes(s);
      
      setFormValues(getDefaultValues(normalizeCampos(servicio.campos_formulario || [])));
      setFormFiles({});
      setBeneficiario("socio");
      
      showModal("Solicitud Enviada", "Tu solicitud ha sido enviada exitosamente. Te contactaremos pronto.", "success");
    } catch (error) {
      showModal("Error", error instanceof Error ? error.message : "Error al enviar la solicitud.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id: number) => {
    showModal("Cancelar Solicitud", "¿Estás seguro de que deseas cancelar esta solicitud?", "confirm", async () => {
      if (!token || !servicio) return;
      try {
        await cancelarSolicitudServicio(token, id);
        const s = await fetchMisSolicitudesServicio(servicio.id, token);
        setSolicitudes(s);
        showModal("Cancelada", "La solicitud ha sido cancelada.", "success");
      } catch (error) {
        showModal("Error", "No se pudo cancelar la solicitud.", "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BF0F0F] border-t-transparent"></div>
      </div>
    );
  }

  if (notFound || !servicio) {
    return (
      <div className="flex flex-col h-96 items-center justify-center text-center">
        <XCircle size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-black text-gray-800">Servicio no encontrado</h2>
        <p className="text-gray-500 mt-2">El servicio que intentas solicitar no existe o no está disponible.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-6 text-[#BF0F0F] font-bold hover:underline">Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900">
            {servicio.nombre}
          </h1>
          {servicio.descripcion && (
            <p className="text-gray-600 mt-1 font-medium">{servicio.descripcion}</p>
          )}
        </div>
      </div>

      {servicio.bloques && servicio.bloques.length > 0 && (
        <div className="space-y-6">
          {servicio.bloques.map((bloque) => {
            if (bloque.__component === "shared.contenido") {
              return (
                <div key={bloque.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                    {bloque.contenido}
                  </div>
                </div>
              );
            }

            if (bloque.__component === "shared.alerta") {
              const bgColors = {
                info: "bg-blue-50 border-blue-200",
                warning: "bg-yellow-50 border-yellow-200",
                success: "bg-green-50 border-green-200",
                error: "bg-red-50 border-red-200"
              };
              const textColors = {
                info: "text-blue-800",
                warning: "text-yellow-800",
                success: "text-green-800",
                error: "text-red-800"
              };
              const iconColors = {
                info: "text-blue-500",
                warning: "text-yellow-500",
                success: "text-green-500",
                error: "text-red-500"
              };

              return (
                <div key={bloque.id} className={`p-4 rounded-xl border ${bgColors[bloque.tipo]} flex items-start gap-3`}>
                  {bloque.tipo === 'info' ? <Info size={24} className={`shrink-0 ${iconColors[bloque.tipo]}`} /> :
                   bloque.tipo === 'success' ? <CheckCircle2 size={24} className={`shrink-0 ${iconColors[bloque.tipo]}`} /> :
                   <AlertTriangle size={24} className={`shrink-0 ${iconColors[bloque.tipo]}`} />}
                  <div>
                    <h4 className={`font-black ${textColors[bloque.tipo]}`}>{bloque.titulo}</h4>
                    <p className={`text-sm mt-1 font-medium ${textColors[bloque.tipo]} opacity-90`}>{bloque.mensaje}</p>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
            <CalendarPlus size={22} className="text-[#BF0F0F]" />
            Nueva Solicitud
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase mb-2">¿Para quién es la hora?</label>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${beneficiario === 'socio' ? 'border-[#BF0F0F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="beneficiario" value="socio" checked={beneficiario === "socio"} onChange={() => setBeneficiario("socio")} className="sr-only" />
                  <UserCircle className={beneficiario === 'socio' ? "text-[#BF0F0F]" : "text-gray-400"} size={24} />
                  <span className={`ml-3 font-bold ${beneficiario === 'socio' ? "text-gray-900" : "text-gray-600"}`}>Para mí (Socio)</span>
                </label>
                
                {cargas.map(carga => (
                  <label key={carga.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${beneficiario === String(carga.id) ? 'border-[#BF0F0F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="beneficiario" value={carga.id} checked={beneficiario === String(carga.id)} onChange={(e) => setBeneficiario(e.target.value)} className="sr-only" />
                    <Users className={beneficiario === String(carga.id) ? "text-[#BF0F0F]" : "text-gray-400"} size={24} />
                    <div className="ml-3">
                      <p className={`font-bold ${beneficiario === String(carga.id) ? "text-gray-900" : "text-gray-600"}`}>{carga.nombre_completo}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase mt-0.5">Carga Familiar ({carga.parentesco})</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {servicio.campos_formulario && servicio.campos_formulario.length > 0 && (
              <FormRenderer
                campos={normalizeCampos(servicio.campos_formulario)}
                values={formValues}
                files={formFiles}
                onFieldChange={handleFieldChange}
                onFilesChange={handleFilesChange}
                errors={formErrors}
              />
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#BF0F0F] text-white rounded-xl font-black text-lg shadow-xl hover:bg-[#A61B26] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 h-full">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
            <History size={22} className="text-[#BF0F0F]" />
            Historial de Solicitudes
          </h3>

          <div className="space-y-4">
            {solicitudes.length === 0 ? (
              <p className="text-gray-400 text-center py-8 font-medium italic">No tienes solicitudes previas para este servicio.</p>
            ) : (
              solicitudes.map(s => (
                <div key={s.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-gray-900">
                        {s.carga_familiar ? s.carga_familiar.nombre_completo : "Socio Titular"}
                      </p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{new Date(s.fecha_solicitud).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        s.estado === 'agendada' ? "bg-blue-100 text-blue-700" :
                        s.estado === 'completada' ? "bg-green-100 text-green-700" :
                        s.estado === 'rechazada' ? "bg-red-100 text-red-700" :
                        s.estado === 'cancelada' ? "bg-gray-200 text-gray-600" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {s.estado}
                    </span>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 mt-2">
                    {s.datos_formulario && Object.keys(s.datos_formulario).length > 0 ? (
                      <ul className="space-y-1.5">
                        {Object.entries(s.datos_formulario).map(([key, val]) => {
                          const campoDef = servicio.campos_formulario?.filter((c): c is CampoFormulario & { nombre_variable: string; etiqueta: string } => 'nombre_variable' in c).find(c => c.nombre_variable === key);
                          const etiqueta = campoDef ? campoDef.etiqueta : key.replace(/_/g, ' ');
                          const displayVal = Array.isArray(val) ? val.join(", ") : String(val ?? "-");
                          return (
                            <li key={key} className="text-sm">
                              <span className="font-black text-gray-700 capitalize">{etiqueta}:</span>{' '}
                              <span className="font-medium text-gray-600">{displayVal}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm font-medium text-gray-700">
                        "{s.mensaje}"
                      </p>
                    )}
                  </div>

                  {s.estado === 'pendiente' && (
                    <button onClick={() => handleCancel(s.id)} className="absolute bottom-4 right-4 text-xs font-bold text-red-600 hover:underline">
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 flex flex-col items-center text-center ${modalConfig.type === 'error' ? 'bg-red-50' : modalConfig.type === 'confirm' ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <div className="mb-4">
                {modalConfig.type === 'success' && <CheckCircle2 size={56} className="text-green-600" />}
                {modalConfig.type === 'error' && <XCircle size={56} className="text-red-600" />}
                {modalConfig.type === 'confirm' && <Info size={56} className="text-yellow-600" />}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{modalConfig.title}</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">{modalConfig.message}</p>
            </div>
            <div className="p-5 bg-white flex gap-3 justify-end border-t border-gray-100">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button onClick={closeModal} className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    No, Volver
                  </button>
                  <button onClick={() => { closeModal(); modalConfig.onConfirm?.(); }} className="flex-1 py-2.5 text-sm font-bold text-white bg-[#BF0F0F] rounded-xl hover:bg-[#A61B26] transition-colors shadow-md">
                    Sí, Cancelar
                  </button>
                </>
              ) : (
                <button onClick={closeModal} className="w-full py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-colors shadow-md">
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
