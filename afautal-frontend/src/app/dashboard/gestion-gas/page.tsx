"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPreciosGas, submitSolicitudGas, fetchMySolicitudesGas, fetchDatosTransferencia, uploadComprobante, updateSolicitudGas, type PrecioGas, type SolicitudGas, type DatosTransferencia } from "@/lib/gas";
import gsap from "gsap";
import { Flame, ShoppingCart, History, Info, ExternalLink, CheckCircle2, UploadCloud, FileCheck, Filter, XCircle } from "lucide-react";

const BANK_URLS: Record<string, string> = {
  "Banco Estado": "https://www.bancoestado.cl",
  "Banco de Chile": "https://www.bancochile.cl",
  "Santander": "https://www.santander.cl",
  "BCI": "https://www.bci.cl",
  "Scotiabank": "https://www.scotiabank.cl",
  "Itaú": "https://www.itau.cl"
};

const ITEMS_POR_PAGINA = 10;

export default function GestionGasPage() {
  const { token, user } = useAuth();
  const [precios, setPrecios] = useState<PrecioGas[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudGas[]>([]);
  const [datosTransferencia, setDatosTransferencia] = useState<DatosTransferencia | null>(null);
  const [selectedGas, setSelectedGas] = useState<PrecioGas | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<"compra" | "exito">("compra");
  const [lastSolicitud, setLastSolicitud] = useState<SolicitudGas | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Estados de Filtro y Paginación
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [ordenFecha, setOrdenFecha] = useState<"desc" | "asc">("desc");
  const [pagina, setPagina] = useState(1);

  // Estado del Modal
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

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetSolicitudId, setTargetSolicitudId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [p, s, d] = await Promise.all([
          fetchPreciosGas(token), 
          fetchMySolicitudesGas(token),
          fetchDatosTransferencia(token)
        ]);
        setPrecios(p);
        setSolicitudes(s);
        setDatosTransferencia(d);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [token]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [view]);

  // Resetear paginación si cambia el filtro o el orden
  useEffect(() => {
    setPagina(1);
  }, [filtroEstado, ordenFecha]);

  const showModal = (title: string, message: string, type: "success" | "error" | "confirm" = "success", onConfirm?: () => void) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleRequest = async () => {
    if (!token || !selectedGas) return;

    setSubmitting(true);
    try {
      const sol = await submitSolicitudGas(token, {
        kg: selectedGas.kg,
        precio: selectedGas.precio,
        cantidad: cantidad
      });
      setLastSolicitud(sol);
      setView("exito");
      // Actualizar historial
      const s = await fetchMySolicitudesGas(token);
      setSolicitudes(s);
    } catch (error) {
      showModal("Error", error instanceof Error ? error.message : "Error al solicitar el gas.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSolicitudId || !token) return;

    setUploadingId(targetSolicitudId);
    try {
      const fileId = await uploadComprobante(token, file);
      
      await updateSolicitudGas(token, targetSolicitudId, {
        comprobante: fileId,
        estado: "comprobante_subido"
      });

      const s = await fetchMySolicitudesGas(token);
      setSolicitudes(s);
      
      showModal("¡Éxito!", "Comprobante subido exitosamente. La solicitud está en revisión.", "success");
    } catch (error) {
      showModal("Error", "Ocurrió un error al subir el comprobante. Inténtalo de nuevo.", "error");
    } finally {
      setUploadingId(null);
      setTargetSolicitudId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancel = (id: number) => {
    showModal("Cancelar Solicitud", "¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.", "confirm", async () => {
      if (!token) return;
      try {
        await updateSolicitudGas(token, id, { estado: "cancelado" });
        const s = await fetchMySolicitudesGas(token);
        setSolicitudes(s);
        showModal("Cancelada", "La solicitud ha sido cancelada exitosamente.", "success");
      } catch (error) {
        showModal("Error", "No se pudo cancelar la solicitud.", "error");
      }
    });
  };

  const openFileSelector = (solicitudId: number) => {
    setTargetSolicitudId(solicitudId);
    fileInputRef.current?.click();
  };

  const getBankPortal = () => {
    const userBank = user?.solicitud?.banco || "";
    return BANK_URLS[userBank] || null;
  };

  // Lógica de filtrado, ordenamiento y paginación
  const solicitudesFiltradas = solicitudes
    .filter(s => s.estado?.toLowerCase().trim() !== "cancelado")
    .filter(s => filtroEstado === "todos" ? true : s.estado === filtroEstado)
    .sort((a, b) => {
      const dateA = new Date(a.fecha_solicitud).getTime();
      const dateB = new Date(b.fecha_solicitud).getTime();
      return ordenFecha === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalPaginas = Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA) || 1;
  const solicitudesPaginadas = solicitudesFiltradas.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);


  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BF0F0F] border-t-transparent"></div>
      </div>
    );
  }

  if (view === "exito" && lastSolicitud) {
    return (
      <div ref={containerRef} className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center">
          <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">¡Solicitud Registrada!</h2>
          <p className="text-gray-600 mt-2">Para finalizar, realiza la transferencia bancaria con los siguientes datos y sube tu comprobante en el historial.</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-200">
            {datosTransferencia ? (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Nombre</p>
                  <p className="font-bold text-gray-900">{datosTransferencia.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">RUT</p>
                  <p className="font-bold text-gray-900">{datosTransferencia.rut}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Banco</p>
                  <p className="font-bold text-gray-900">{datosTransferencia.banco}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Tipo de Cuenta</p>
                  <p className="font-bold text-gray-900">{datosTransferencia.tipo_cuenta}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Nº de Cuenta</p>
                  <p className="font-bold text-gray-900">{datosTransferencia.numero_cuenta}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                  <p className="font-bold text-gray-900">{datosTransferencia.correo_comprobante}</p>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 text-center py-4">
                <p className="text-red-500 font-bold">Datos de transferencia no configurados por el administrador.</p>
              </div>
            )}
            <div className="md:col-span-2 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Monto a Transferir</p>
              <p className="text-2xl font-black text-[#BF0F0F]">${(lastSolicitud.precio * lastSolicitud.cantidad).toLocaleString('es-CL')}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {getBankPortal() && (
              <a 
                href={getBankPortal()!} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg"
              >
                Ir a mi Banco <ExternalLink size={18} />
              </a>
            )}
            <button 
              onClick={() => setView("compra")}
              className="py-3 px-8 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-all shadow-lg"
            >
              Volver a Gestión Gas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Input oculto para subida de archivos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Flame className="text-[#BF0F0F]" size={36} />
            Gestión de Gas
          </h1>
          <p className="text-gray-600 mt-1 font-medium">Compra tus vales de gas con convenio AFAUTAL</p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* Fila 1: Selección de Vales y Ayuda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Selección de Vales */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart size={22} className="text-[#BF0F0F]" />
              Selecciona tu Vale
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {precios.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedGas(p)}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
                    selectedGas?.id === p.id 
                    ? "border-[#BF0F0F] bg-red-50" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-black text-gray-900">{p.kg} KG</span>
                    <Flame size={24} className={selectedGas?.id === p.id ? "text-[#BF0F0F]" : "text-gray-200 group-hover:text-red-200"} />
                  </div>
                  <p className="text-3xl font-black text-[#BF0F0F]">${p.precio.toLocaleString('es-CL')}</p>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">{p.empresa}</p>
                </button>
              ))}
            </div>

            {selectedGas && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <label className="font-bold text-gray-700">Cantidad:</label>
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                      <button 
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold"
                      >-</button>
                      <span className="px-4 py-2 font-black text-gray-900">{cantidad}</span>
                      <button 
                        onClick={() => setCantidad(cantidad + 1)}
                        className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold"
                      >+</button>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm font-bold text-gray-500 uppercase">Total a pagar</p>
                    <p className="text-3xl font-black text-[#BF0F0F]">${(selectedGas.precio * cantidad).toLocaleString('es-CL')}</p>
                  </div>
                </div>
                <button
                  onClick={handleRequest}
                  disabled={submitting}
                  className="w-full mt-6 py-4 bg-[#BF0F0F] text-white rounded-xl font-black text-lg shadow-xl hover:bg-[#A61B26] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? "Procesando..." : "Confirmar y Ver Datos de Pago"}
                </button>
              </div>
            )}
          </div>

          {/* Información y Ayuda */}
          <div className="lg:col-span-1 bg-blue-50 p-6 sm:p-8 rounded-2xl border border-blue-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Info className="text-blue-600 shrink-0" size={28} />
              <h4 className="font-black text-blue-900 text-lg">Importante</h4>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed font-medium">
              Una vez confirmada la solicitud, deberás realizar la transferencia y adjuntar el comprobante en tu historial ("Mis Solicitudes" en la parte inferior). El vale será habilitado en un plazo máximo de 24 horas hábiles tras la verificación.
            </p>
          </div>
        </div>

        {/* Fila 2: Historial de Solicitudes Filtrable y Paginado */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <History size={26} className="text-[#BF0F0F]" />
              Mis Solicitudes
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <select 
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#BF0F0F] bg-white cursor-pointer"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="comprobante_subido">En revisión</option>
                  <option value="pagado">Pagados</option>
                  <option value="entregado">Entregados</option>
                  <option value="rechazado">Rechazados</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <select 
                value={ordenFecha}
                onChange={(e) => setOrdenFecha(e.target.value as "desc" | "asc")}
                className="p-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#BF0F0F] bg-white cursor-pointer"
              >
                <option value="desc">Más recientes primero</option>
                <option value="asc">Más antiguos primero</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {solicitudesPaginadas.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium italic text-lg">No hay solicitudes que coincidan con los filtros.</p>
              </div>
            ) : (
              solicitudesPaginadas.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-gray-900 text-lg">{s.kg} KG <span className="text-gray-500 text-sm">(x{s.cantidad})</span></p>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        s.estado === 'entregado' ? "bg-green-100 text-green-700" :
                        s.estado === 'rechazado' || s.estado === 'cancelado' ? "bg-red-100 text-red-700" :
                        s.estado === 'comprobante_subido' ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {s.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-bold text-gray-400 text-xs">{new Date(s.fecha_solicitud).toLocaleDateString()}</p>
                      <p className="font-black text-[#BF0F0F] text-lg">${(s.precio * s.cantidad).toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  
                  {/* Acciones por estado */}
                  <div>
                    {s.estado === 'pendiente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openFileSelector(s.id)}
                          disabled={uploadingId === s.id}
                          className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                          {uploadingId === s.id ? "Subiendo..." : <><UploadCloud size={14} /> Comprobante</>}
                        </button>
                        <button
                          onClick={() => handleCancel(s.id)}
                          disabled={uploadingId === s.id}
                          className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center disabled:opacity-50 shadow-sm"
                          title="Cancelar Solicitud"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}

                    {s.estado === 'comprobante_subido' && (
                      <div className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 py-2.5 rounded-xl border border-blue-200">
                        <FileCheck size={16} /> Comprobante en revisión
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4 border-t border-gray-100 pt-6">
              <button 
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Anterior
              </button>
              <span className="text-sm font-black text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                {pagina} / {totalPaginas}
              </span>
              <button 
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Modal */}
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
