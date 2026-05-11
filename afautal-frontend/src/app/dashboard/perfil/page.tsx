"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar, MapPin, Shield, Building, Briefcase, CreditCard, Save, Users, Plus, Trash2, XCircle, Phone } from "lucide-react";
import { getAuthStorageKey } from "@/lib/auth";
import { fetchBancos, type Banco } from "@/lib/banco";
import { fetchMisCargas, addCarga, deleteCarga, type CargaFamiliar } from "@/lib/carga";
import { formatRUT, formatPhone } from "@/lib/utils";

const TIPOS_CUENTA = ["Cuenta Corriente", "Cuenta Vista", "Cuenta RUT", "Cuenta de Ahorro"];
const PARENTESCOS = ["Cónyuge", "Hijo/a", "Padre/Madre", "Conviviente Civil", "Otro"];

export default function PerfilPage() {
  const { user, token, refreshUser, loading } = useAuth();
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [banco, setBanco] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [saving, setSaving] = useState(false);
  const [bancosList, setBancosList] = useState<Banco[]>([]);

  const [cargas, setCargas] = useState<CargaFamiliar[]>([]);
  const [isAddingCarga, setIsAddingCarga] = useState(false);
  const [nuevaCarga, setNuevaCarga] = useState({ rut: "", nombre_completo: "", parentesco: "Hijo/a" });
  const [savingCarga, setSavingCarga] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBancos(token).then(setBancosList).catch(console.error);
      fetchMisCargas(token).then(setCargas).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    if (user?.solicitud) {
      setBanco(user.solicitud.banco || "");
      setTipoCuenta(user.solicitud.tipo_cuenta || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#BF0F0F] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <p className="text-lg text-slate-600 font-bold">No se pudo cargar la información del usuario.</p>
      </div>
    );
  }

  const solicitud = user.solicitud || {};

  const handleSaveBank = async () => {
    const targetId = solicitud.documentId || solicitud.id;
    if (!token || !targetId) return;
    
    setSaving(true);
    try {
      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
      const response = await fetch(`${STRAPI_URL}/api/solicitudes/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            banco,
            tipo_cuenta: tipoCuenta
          }
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar datos bancarios");
      
      await refreshUser();
      setIsEditingBank(false);
    } catch (error) {
      alert("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No registrada";
    const dateToFormat = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    return new Date(dateToFormat).toLocaleDateString('es-CL');
  };

  const getDireccionCompleta = () => {
    const partes = [
      solicitud.direccion_particular, 
      solicitud.comuna?.nombre, 
      solicitud.ciudad?.nombre, 
      solicitud.region?.nombre
    ].filter(Boolean);
    return partes.length > 0 ? partes.join(", ") : "No registrada";
  };

  const handleAddCarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingCarga(true);
    try {
      const newCarga = await addCarga(token, nuevaCarga as any);
      setCargas([newCarga, ...cargas]);
      setIsAddingCarga(false);
      setNuevaCarga({ rut: "", nombre_completo: "", parentesco: "Hijo/a" });
    } catch (error) {
      alert("Error al agregar la carga familiar.");
    } finally {
      setSavingCarga(false);
    }
  };

  const handleDeleteCarga = async (id: number) => {
    if (!token || !confirm("¿Eliminar esta carga familiar?")) return;
    try {
      await deleteCarga(token, id);
      setCargas(cargas.filter(c => c.id !== id));
    } catch (error) {
      alert("Error al eliminar la carga.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Encabezado del Perfil */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 border-b-4 border-[#BF0F0F]">
        <div className="h-32 bg-gradient-to-r from-red-900 via-red-700 to-red-600 sm:h-48"></div>
        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-16 flex flex-col sm:-mt-24 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-8">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-8 border-white bg-white shadow-2xl sm:h-44 sm:w-44">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <User size={64} className="sm:h-24 sm:w-24" />
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:pb-4">
                <h2 className="text-3xl font-black text-slate-900 capitalize">
                  {user.nombre_completo || "Socio AFAUTAL"}
                </h2>
                <p className="text-lg font-bold text-red-700">{solicitud.jerarquia || "Socio Activo"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:pb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-black text-[#BF0F0F] ring-1 ring-inset ring-red-600/20">
                <Shield size={16} />
                {solicitud.tipo_contrato || "Planta"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Columna Izquierda: Información Personal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-black text-slate-900 border-b pb-4">
              <User className="text-[#BF0F0F]" size={28} />
              Información Personal
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
              <InfoItem icon={<User className="text-slate-400" />} label="RUT" value={formatRUT(user.rut || solicitud.rut)} />
              <InfoItem icon={<Mail className="text-slate-400" />} label="Correo Electrónico" value={user.email} />
              <InfoItem icon={<Phone className="text-slate-400" />} label="Teléfono" value={solicitud.telefono || "No registrado"} />
              <InfoItem icon={<Calendar className="text-slate-400" />} label="Fecha de Nacimiento" value={formatDate(solicitud.fecha_nacimiento)} />
              <InfoItem icon={<MapPin className="text-slate-400" />} label="Dirección" value={getDireccionCompleta()} />
              <InfoItem icon={<Building className="text-slate-400" />} label="Unidad Académica" value={user.unidad_academica || solicitud.unidad_academica || "No registrada"} />
              <InfoItem icon={<Briefcase className="text-slate-400" />} label="Tipo de Contrato" value={solicitud.tipo_contrato || "No registrado"} />
            </div>
          </div>

          {/* Cargas Familiares */}
          <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <h3 className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <Users className="text-[#BF0F0F]" size={28} />
                Cargas Familiares
              </h3>
              {!isAddingCarga && (
                <button onClick={() => setIsAddingCarga(true)} className="flex items-center gap-2 text-sm font-black text-[#BF0F0F] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={16} /> Añadir
                </button>
              )}
            </div>

            {isAddingCarga && (
              <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleAddCarga} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">RUT</label>
                      <input 
                        required 
                        type="text" 
                        value={nuevaCarga.rut} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9kK]/g, "").slice(0, 9);
                          setNuevaCarga({...nuevaCarga, rut: val});
                        }} 
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#BF0F0F] outline-none" 
                        placeholder="Ej: 123456789" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nombre Completo</label>
                      <input required type="text" value={nuevaCarga.nombre_completo} onChange={e => setNuevaCarga({...nuevaCarga, nombre_completo: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#BF0F0F] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">Parentesco</label>
                      <select value={nuevaCarga.parentesco} onChange={e => setNuevaCarga({...nuevaCarga, parentesco: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#BF0F0F] outline-none">
                        {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setIsAddingCarga(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
                    <button type="submit" disabled={savingCarga} className="px-6 py-2 bg-[#BF0F0F] text-white rounded-lg text-sm font-black hover:bg-[#A61B26] disabled:opacity-50">
                      {savingCarga ? "Guardando..." : "Guardar Carga"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {cargas.length === 0 && !isAddingCarga ? (
                <p className="text-center text-slate-500 font-medium py-4 italic">No tienes cargas familiares registradas.</p>
              ) : (
                cargas.map(carga => (
                  <div key={carga.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow gap-4">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{carga.nombre_completo}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-slate-500">{formatRUT(carga.rut)}</span>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {carga.parentesco}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCarga(carga.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors self-start sm:self-auto" title="Eliminar carga">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Datos Bancarios */}
        <div className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="flex items-center gap-3 text-xl font-black text-slate-900">
                <CreditCard className="text-[#BF0F0F]" size={24} />
                Datos de Pago
              </h3>
              {!isEditingBank && (
                <button onClick={() => setIsEditingBank(true)} className="text-xs font-black text-[#BF0F0F] hover:underline uppercase">Editar</button>
              )}
            </div>
            
            <div className="space-y-6">
              {isEditingBank ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Banco</label>
                    <select value={banco} onChange={(e) => setBanco(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#BF0F0F]">
                      <option value="">Seleccionar Banco</option>
                      {bancosList.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Tipo de Cuenta</label>
                    <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#BF0F0F]">
                      <option value="">Seleccionar Tipo</option>
                      {TIPOS_CUENTA.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleSaveBank} 
                      disabled={saving}
                      className="flex-1 bg-[#BF0F0F] text-white py-2 rounded-lg text-sm font-black flex items-center justify-center gap-2 hover:bg-[#A61B26] transition-all disabled:opacity-50"
                    >
                      <Save size={16} /> {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button onClick={() => setIsEditingBank(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <InfoItem icon={<Building className="text-slate-400" />} label="Mi Banco" value={solicitud.banco || "No definido"} />
                  <InfoItem icon={<CreditCard className="text-slate-400" />} label="Tipo de Cuenta" value={solicitud.tipo_cuenta || "No definida"} />
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-800 leading-relaxed">
                      Estos datos se usarán para facilitar tus transferencias en la compra de vales de gas.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex-shrink-0 bg-slate-50 p-2 rounded-lg">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}
