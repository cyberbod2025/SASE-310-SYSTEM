import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { normalizeString, cleanCURP } from "../utils/stringUtils";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";

interface RegistroPersonalProps {
  onBack: () => void;
}

const AVAILABLE_ROLES = [
  { id: "docente", label: "Docente", icon: "school", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "prefectura", label: "Prefectura", icon: "local_police", color: "text-orange-600", bg: "bg-orange-50" },
  { id: "orientacion", label: "Orientación", icon: "psychology", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "trabajo_social", label: "Trabajo Social", icon: "groups", color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "secretaria", label: "Secretaría", icon: "description", color: "text-slate-600", bg: "bg-slate-50" },
  { id: "enfermeria", label: "Enfermería", icon: "medical_services", color: "text-rose-600", bg: "bg-rose-50" },
  { id: "udeii", label: "UDEII", icon: "diversity_3", color: "text-teal-600", bg: "bg-teal-50" },
  { id: "direccion", label: "Dirección", icon: "admin_panel_settings", color: "text-slate-800", bg: "bg-slate-100" },
];

export const RegistroPersonal: React.FC<RegistroPersonalProps> = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folioSolicitud, setFolioSolicitud] = useState("");

  const [formData, setFormData] = useState({
    rol: "", turno: "vespertino", nombres: "", apellidoPaterno: "", apellidoMaterno: "",
    curp: "", fechaNacimiento: "", rfc: "", matricula: "", cct: "09DES4310M",
    correoInstitucional: "", password: "", confirmPassword: "",
    checkPrivacidad: false, checkEtica: false, checkAuditoria: false,
  });

  useEffect(() => {
    if (formData.nombres && formData.apellidoPaterno && formData.fechaNacimiento) {
      const p = formData.apellidoPaterno.trim().toUpperCase();
      const m = formData.apellidoMaterno.trim().toUpperCase() || "X";
      const n = formData.nombres.trim().toUpperCase();
      const d = formData.fechaNacimiento;
      const rfcBase = (p.substring(0, 2) + m.substring(0, 1) + n.substring(0, 1) + d.substring(2, 4) + d.substring(5, 7) + d.substring(8, 10)).toUpperCase();
      if (formData.rfc !== rfcBase) setFormData(prev => ({ ...prev, rfc: rfcBase }));
    }
  }, [formData.nombres, formData.apellidoPaterno, formData.apellidoMaterno, formData.fechaNacimiento]);

  useEffect(() => {
    const cleaned = cleanCURP(formData.curp);
    if (cleaned && cleaned.length >= 10) {
      const unique = Math.floor(1000 + Math.random() * 9000);
      const generated = `MAT-${formData.curp.substring(0, 10)}-${unique}`;
      if (!formData.matricula || !formData.matricula.includes(formData.curp.substring(0, 10))) {
        setFormData(prev => ({ ...prev, matricula: generated }));
      }
    }
  }, [formData.curp]);

  const selectedRoleData = AVAILABLE_ROLES.find(r => r.id === formData.rol);

  const handleSubmit = async () => {
    if (!formData.checkPrivacidad || !formData.checkEtica || !formData.checkAuditoria) return toast.error("Acepte los términos institucionales");
    setLoading(true);
    try {
      const folio = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from("solicitudes_alta_personal").insert({
        rol_solicitado: [formData.rol], turno: formData.turno, nombres: formData.nombres.toUpperCase(),
        apellido_paterno: formData.apellidoPaterno.toUpperCase(), apellido_materno: formData.apellidoMaterno.toUpperCase(),
        curp: formData.curp.toUpperCase(), correo_institucional: formData.correoInstitucional,
        acepta_privacidad: formData.checkPrivacidad, acepta_etica: formData.checkEtica, acepta_auditoria: formData.checkAuditoria,
        estado: "PENDIENTE", metadata: { folio_solicitud: folio, cct: formData.cct, matricula: formData.matricula }
      });
      if (error) throw error;
      setFolioSolicitud(folio);
      setSuccess(true);
      toast.success("Solicitud enviada");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 animate-fade-in">
        <GlassCard className="max-w-lg w-full p-12 text-center space-y-8 bg-white border-slate-200 shadow-2xl">
           <div className="size-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-lg">
              <span className="material-icons text-5xl text-emerald-600">verified</span>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Solicitud Enviada</h2>
              <p className="text-slate-500 font-medium tracking-tight mt-2 italic">Su expediente ha sido turnado a Dirección para validación de nómina.</p>
           </div>
           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Folio Institucional</p>
              <p className="text-3xl font-black text-blue-600 tracking-[0.3em] font-mono">{folioSolicitud}</p>
           </div>
           <GlassButton variant="primary" className="w-full h-14" onClick={onBack}>Regresar al Portal</GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
       <div className="p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <span className="material-icons">school</span>
             </div>
             <p className="text-sm font-black text-slate-800 uppercase italic tracking-widest">Portal de Alistamiento SASE</p>
          </div>
          <button onClick={onBack} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Cancelar Registro</button>
       </div>

       <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
          <AnimatePresence mode="wait">
             {step === 0 && (
               <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl w-full">
                  <GlassCard className="p-12 space-y-10 bg-white border-slate-200 shadow-2xl">
                     <div className="text-center space-y-4">
                        <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">Bienvenido</h1>
                        <p className="text-slate-500 font-medium tracking-tight text-lg">Inicie su proceso de alta institucional en el plantel 310.</p>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">¿Cómo debemos llamarle?</label>
                        <input autoFocus className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xl font-black text-slate-800 uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-300" placeholder="Ej. Miguel Ángel" value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} onKeyDown={e => e.key === 'Enter' && formData.nombres && setStep(1)} />
                     </div>
                     <GlassButton variant="primary" className="w-full h-16 shadow-xl" disabled={!formData.nombres} onClick={() => setStep(1)}>Comenzar Alta</GlassButton>
                  </GlassCard>
               </motion.div>
             )}

             {step === 1 && (
               <motion.div key="s1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-4xl w-full space-y-10">
                  <div className="text-center space-y-2">
                     <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Mucho gusto, {formData.nombres}</h2>
                     <p className="text-slate-400 font-medium tracking-tight uppercase">Seleccione su función institucional en el plantel</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {AVAILABLE_ROLES.map(role => (
                       <button key={role.id} onClick={() => setFormData({...formData, rol: role.id})} className={`p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${formData.rol === role.id ? 'bg-white border-blue-500 shadow-2xl scale-105 z-10' : 'bg-slate-50/50 border-slate-100 hover:border-blue-200 hover:bg-white'}`}>
                          <div className={`size-16 rounded-3xl flex items-center justify-center transition-all ${formData.rol === role.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}>
                             <span className="material-icons text-3xl">{role.icon}</span>
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${formData.rol === role.id ? 'text-blue-600' : 'text-slate-500'}`}>{role.label}</p>
                       </button>
                     ))}
                  </div>
                  <div className="flex justify-center gap-6">
                     <button onClick={() => setStep(0)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest italic">Anterior</button>
                     <GlassButton variant="primary" className="px-12 h-14" disabled={!formData.rol} onClick={() => setStep(2)}>Siguiente Paso</GlassButton>
                  </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl w-full">
                  <GlassCard className="p-0 border border-slate-200 bg-white overflow-hidden shadow-2xl">
                     <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                           <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Expediente de Identidad</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alistamiento Perfil: {selectedRoleData?.label}</p>
                        </div>
                        <div className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedRoleData?.bg} ${selectedRoleData?.color}`}>Status: Validando</div>
                     </div>
                     <div className="p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <GlassInput label="Apellido Paterno" value={formData.apellidoPaterno} onChange={e => setFormData({...formData, apellidoPaterno: e.target.value.toUpperCase()})} />
                           <GlassInput label="Apellido Materno" value={formData.apellidoMaterno} onChange={e => setFormData({...formData, apellidoMaterno: e.target.value.toUpperCase()})} />
                           <GlassInput label="CURP (18 Dígitos)" value={formData.curp} onChange={e => setFormData({...formData, curp: e.target.value.toUpperCase()})} />
                           <GlassInput label="Fecha de Nacimiento" type="date" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                        </div>
                        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                           <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest italic">Anterior</button>
                           <GlassButton variant="primary" className="px-12 h-14" disabled={!formData.apellidoPaterno || !formData.curp || !formData.fechaNacimiento} onClick={() => setStep(3)}>Continuar Registro</GlassButton>
                        </div>
                     </div>
                  </GlassCard>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div key="s3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
                  <GlassCard className="p-12 space-y-10 bg-white border-slate-200 shadow-2xl">
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Seguridad y Protocolo</h3>
                        <p className="text-slate-400 font-medium text-xs leading-relaxed italic">Últimos pasos para enviar su solicitud al servidor central de SASE-310.</p>
                     </div>
                     <div className="space-y-6">
                        <GlassInput label="Correo Electrónico Institucional" type="email" value={formData.correoInstitucional} onChange={e => setFormData({...formData, correoInstitucional: e.target.value})} />
                        <div className="grid grid-cols-2 gap-6">
                           <GlassInput label="Contraseña" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                           <GlassInput label="Confirmar" type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                        </div>
                        <div className="space-y-4 pt-6">
                           {[
                             { id: 'checkPrivacidad', label: 'Acepto el aviso de privacidad de datos SASE' },
                             { id: 'checkEtica', label: 'Me comprometo al código de ética del plantel 310' },
                             { id: 'checkAuditoria', label: 'Reconozco que mis acciones serán auditadas' }
                           ].map(item => (
                             <div key={item.id} className="flex items-center gap-4 cursor-pointer group" onClick={() => setFormData({...formData, [item.id]: !formData[item.id as keyof typeof formData]})}>
                                <div className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData[item.id as keyof typeof formData] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                                   {formData[item.id as keyof typeof formData] && <span className="material-icons text-[14px]">check</span>}
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{item.label}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-4">
                        <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest italic">Anterior</button>
                        <GlassButton variant="primary" className="px-16 h-16 shadow-2xl shadow-blue-900/20" loading={loading} onClick={handleSubmit}>Despachar Alta</GlassButton>
                     </div>
                  </GlassCard>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
};
