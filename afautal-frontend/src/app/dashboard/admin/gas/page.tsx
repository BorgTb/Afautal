"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  fetchAdminPreciosGas, 
  upsertPrecioGas, 
  deletePrecioGas,
  iniciarVentanaGas, 
  fetchVentanaActiva,
  fetchSolicitudesPorVentana,
  type VentanaGas
} from "@/lib/admin-gas";
import { Flame, Save, Send, Plus, History, Users, FileSpreadsheet, AlertCircle, CheckCircle2, Trash2, Layers, Clock } from "lucide-react";
import { AdminGate } from "@/components/shared/admin-gate";
import * as XLSX from "xlsx";
import { formatRUT } from "@/lib/utils";

export default function AdminGasPage() {
  const { token } = useAuth();
  const [precios, setPrecios] = useState<any[]>([]);
  const [ventanaActiva, setVentanaActiva] = useState<VentanaGas | null>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [p, v] = await Promise.all([
        fetchAdminPreciosGas(token),
        fetchVentanaActiva(token)
      ]);
      setPrecios(p);
      setVentanaActiva(v);
      
      if (v) {
        const s = await fetchSolicitudesPorVentana(token, v.documentId);
        // Solo considerar las solicitudes marcadas como pagadas
        const pagadas = s.filter((sol: any) => sol.estado === "pagado");
        setSolicitudes(pagadas);
      } else {
        setSolicitudes([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGalon = () => {
    setPrecios([...precios, { kg: 15, precio: 0, empresa: "Abastible", status: "draft", id: Date.now(), isNew: true }]);
  };

  const handlePriceChange = (index: number, field: string, value: string) => {
    const newPrecios = [...precios];
    // Permitir string vacío para que el usuario pueda borrar, sino convertir a número
    const val = value === "" ? "" : Number(value);
    newPrecios[index] = { ...newPrecios[index], [field]: val };
    setPrecios(newPrecios);
  };

  const handleSaveDraft = async (index: number) => {
    if (!token) return;
    const item = precios[index];
    // Validar que no estén vacíos antes de guardar
    if (item.kg === "" || item.precio === "" || Number(item.precio) === 0) {
      alert("Por favor ingresa valores válidos para KG y Precio.");
      return;
    }
    try {
      setSubmitting(true);
      await upsertPrecioGas(token, { kg: Number(item.kg), precio: Number(item.precio), empresa: item.empresa }, item.isNew ? undefined : item.documentId);
      alert("Precio guardado como borrador correctamente.");
      await loadData();
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAll = async () => {
    if (!token) return;
    
    // Filtrar precios que tengan datos válidos
    const preciosValidos = precios.filter(p => p.kg !== "" && p.precio !== "" && Number(p.precio) > 0);
    
    if (preciosValidos.length === 0) {
      alert("No hay cambios válidos para guardar.");
      return;
    }

    try {
      setSubmitting(true);
      // Guardar todos en paralelo
      await Promise.all(
        preciosValidos.map(p => 
          upsertPrecioGas(token, { kg: Number(p.kg), precio: Number(p.precio), empresa: p.empresa }, p.isNew ? undefined : p.documentId)
        )
      );
      alert("Todos los precios han sido guardados como borrador.");
      await loadData();
    } catch (e) {
      alert("Hubo un error al guardar algunos precios.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    const item = precios[index];
    if (item.isNew) {
      const newPrecios = [...precios];
      newPrecios.splice(index, 1);
      setPrecios(newPrecios);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el cilindro de ${item.kg}kg? Esta acción es inmediata en la base de datos.`)) return;

    if (!token) return;
    try {
      setSubmitting(true);
      await deletePrecioGas(token, item.documentId);
      await loadData();
    } catch (e) {
      alert("Error al eliminar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIniciarVentana = async () => {
    if (!token) return;
    if (!confirm("¿Estás seguro de iniciar una nueva ventana? Esto cerrará la lista actual, publicará los nuevos precios y notificará a todos los socios por correo.")) return;

    try {
      setSubmitting(true);
      await iniciarVentanaGas(token);
      alert("¡Nueva ventana iniciada con éxito!");
      await loadData();
    } catch (e) {
      alert("Error al iniciar ventana");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadExcel = () => {
    if (solicitudes.length === 0) {
      alert("No hay solicitudes para exportar en esta ventana.");
      return;
    }

    // Preparar datos para Excel: RUT, Correo, Cantidad (KG)
    const dataToExport = solicitudes.map((s) => {
      // Manejar formato Strapi 5 (plano)
      const u = s.usuario || {};
      return {
        "RUT": formatRUT(u.rut),
        "Correo": u.email || "No disponible",
        "Nombre Completo": u.nombre_completo || u.username || "Desconocido",
        "Tamaño Cilindro (KG)": s.kg || 0,
        "Cantidad Pedida": s.cantidad || 0,
        "Total Pedido (KG)": (s.kg || 0) * (s.cantidad || 1),
        "Fecha Solicitud": new Date(s.fecha_solicitud || s.createdAt).toLocaleDateString('es-CL'),
        "Estado": s.estado
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Gas");
    
    const fileName = `Reporte_Gas_${ventanaActiva?.nombre.replace(/\s/g, '_') || "AFAUTAL"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) return <div className="p-20 text-center font-bold text-black">Cargando panel de administración...</div>;

  return (
    <AdminGate>
      <div className="max-w-7xl mx-auto space-y-10 pb-20 text-black">
        
        <header className="flex justify-between items-end border-b pb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <Flame className="text-[#BF0F0F]" size={40} />
              Administración de Gas
            </h1>
            <p className="text-gray-500 font-medium mt-1">Gestiona precios, ventanas de venta y exportación de datos.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleIniciarVentana}
              disabled={submitting}
              className="flex items-center gap-2 bg-[#BF0F0F] text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-red-800 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={20} />
              PUBLICAR E INICIAR VENTANA
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gestión de Precios */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Save size={20} className="text-gray-400" />
                  Configuración de Precios (Borradores)
                </h2>
                <div className="flex gap-3">
                  <button onClick={handleAddGalon} className="text-[#BF0F0F] font-bold text-sm flex items-center gap-1 hover:underline">
                    <Plus size={16} /> Agregar Galón
                  </button>
                  <div className="w-px h-4 bg-gray-200 self-center"></div>
                  <button 
                    onClick={handleSaveAll}
                    disabled={submitting || precios.length === 0}
                    className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <Layers size={16} /> Guardar Todos
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Cilindro (Kg)</th>
                      <th className="px-6 py-4">Precio ($)</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {precios.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            value={p.kg} 
                            onChange={(e) => handlePriceChange(i, "kg", e.target.value)}
                            className="w-20 p-2 border border-gray-300 rounded-lg font-bold bg-white text-black focus:border-[#BF0F0F] outline-none shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            value={p.precio} 
                            onChange={(e) => handlePriceChange(i, "precio", e.target.value)}
                            className="w-32 p-2 border border-gray-300 rounded-lg font-bold text-black bg-white focus:border-green-600 outline-none shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.status === 'published' ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleSaveDraft(i)}
                              disabled={submitting}
                              className="text-gray-400 hover:text-blue-600 p-2 transition-colors disabled:opacity-30"
                              title="Guardar como borrador"
                            >
                              <Save size={20} />
                            </button>
                            <button 
                              onClick={() => handleDelete(i)}
                              disabled={submitting}
                              className="text-gray-400 hover:text-red-600 p-2 transition-colors disabled:opacity-30"
                              title="Eliminar cilindro"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4">
              <AlertCircle className="text-blue-500 shrink-0" size={24} />
              <div>
                <p className="text-blue-900 font-bold">Nota sobre el Guardado Silencioso</p>
                <p className="text-blue-800/80 text-sm font-medium mt-1">
                  Al usar el ícono de disco, el precio se guarda pero <strong>no se muestra al socio</strong> hasta que presiones el botón rojo de "Publicar e Iniciar Ventana". Esto es útil para ir preparando los precios antes del día de venta.
                </p>
              </div>
            </div>
          </section>

          {/* Estado de la Ventana */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6">
                <History size={20} className="text-gray-400" />
                Ventana Actual
              </h2>
              
              {ventanaActiva ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Estado</p>
                    <p className="text-lg font-black text-green-900 flex items-center gap-2">
                      <CheckCircle2 size={18} /> ACTIVA
                    </p>
                    <p className="text-xs font-bold text-green-700 mt-2">{ventanaActiva.nombre}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    <p>Iniciada: {new Date(ventanaActiva.fecha_inicio).toLocaleString()}</p>
                  </div>
                  <div className="pt-4 border-t">
                     <div className="flex justify-between items-center mb-4">
                       <p className="font-black text-gray-800">Solicitudes: {solicitudes.length}</p>
                     </div>
                     <button 
                      onClick={handleDownloadExcel}
                      className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-black hover:bg-black transition-all"
                     >
                       <FileSpreadsheet size={18} /> DESCARGAR EXCEL
                     </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-400 font-bold italic">No hay ninguna ventana de venta abierta actualmente.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-xl">
                    <Clock size={14} /> POR IMPLEMENTAR
                  </div>
               </div>
               <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-4">
                  <Users size={20} className="text-gray-400" />
                  Carga de Excel
               </h2>
               <p className="text-sm text-gray-500 font-medium mb-6">Sube el archivo de respuesta para procesar las solicitudes.</p>
               
               <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-colors cursor-not-allowed">
                  <FileSpreadsheet className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-xs font-black text-gray-400 uppercase">Función deshabilitada</p>
               </div>
            </div>
          </aside>

        </div>
      </div>
    </AdminGate>
  );
}
