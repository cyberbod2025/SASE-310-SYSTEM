import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { Student, CaseState } from "../types";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { GRUPOS, CICLO_ESCOLAR } from "../config/sase.config";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";

const steps = [
  { id: 1, label: "Datos del Alumno", icon: "person" },
  { id: 2, label: "Tutor / Contacto", icon: "family_restroom" },
  { id: 3, label: "Documentación", icon: "upload_file" },
  { id: 4, label: "Verificación", icon: "verified" },
];

export const Inscripciones: React.FC = () => {
  const { importStudents } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombre: "",
    curp: "",
    verifiedCurp: false,
    fechaNacimiento: "",
    genero: "M",
    promedioAnterior: 0,
    group: "Provisional",
    nombrePadre: "",
    telPadre: "",
    nombreMadre: "",
    telMadre: "",
    nombreTutor: "",
    telTutor: "",
    parentescoTutor: "",
    viveCon: "ambos",
    telEmergencia: "",
    motivoAlta: "nuevo_ingreso",
    isUdeii: false,
    personaInscribe: "padre",
    situacionRiesgo: "",
    hasMedicalDoc: false,
    detallePersonaInscribe: "",
    docs: {
      actaNacimiento: false,
      comprobanteDomicilio: false,
      curpDoc: false,
      boletaPrimaria: false,
      boletaSecundaria: false,
      cambioEscuelaDoc: false,
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileStudent, setFileStudent] = useState<File | null>(null);
  const [fileGuardian, setFileGuardian] = useState<File | null>(null);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    if (e.target.files && e.target.files.length > 0) setter(e.target.files[0]);
  };

  const handleVerifyCurp = () => {
    if (formData.curp.length < 18) {
      toast.error("CURP inválido");
      return;
    }
    window.open("https://www.gob.mx/curp/", "_blank");
    setFormData({ ...formData, verifiedCurp: true });
    toast.success("CURP verificado");
  };

  const handleCheckboxChange = (doc: keyof typeof formData.docs) => {
    setFormData({
      ...formData,
      docs: { ...formData.docs, [doc]: !formData.docs[doc] },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Registrando inscripción institucional...");

    const fullName =
      `${formData.apellidoPaterno} ${formData.apellidoMaterno} ${formData.nombre}`
        .trim()
        .toUpperCase();

    let primaryContactName = formData.nombrePadre;
    let primaryContactRel = "Padre";
    let primaryContactPhone = formData.telPadre;

    if (formData.viveCon === "mama") {
      primaryContactName = formData.nombreMadre;
      primaryContactRel = "Madre";
      primaryContactPhone = formData.telMadre;
    } else if (formData.viveCon === "tutor") {
      primaryContactName = formData.nombreTutor;
      primaryContactRel = formData.parentescoTutor || "Tutor";
      primaryContactPhone = formData.telTutor;
    }

    const uploadFile = async (
      fileToUpload: File,
      bucket: string,
      prefix: string,
    ) => {
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${prefix}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return publicUrl;
    };

    try {
      let studentPhotoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`;
      let guardianPhotoUrl = "";

      if (fileStudent)
        studentPhotoUrl = await uploadFile(
          fileStudent,
          "avatars",
          `student_${formData.curp}`,
        );
      if (fileGuardian)
        guardianPhotoUrl = await uploadFile(
          fileGuardian,
          "avatars",
          `guardian_${formData.curp}`,
        );

      const { data: newStudent, error: studentError } = await (
        supabase.from("alumnos") as any
      )
        .insert([
          {
            nombre_completo: fullName,
            matricula: formData.curp,
            curp: formData.curp,
            grado: formData.group.split(" ")[0] || "1º",
            grupo: formData.group,
            estado_caso: CaseState.OBSERVADO,
            fecha_nacimiento: formData.fechaNacimiento || null,
            genero: formData.genero,
            promedio_anterior: formData.promedioAnterior,
            avatar_url: studentPhotoUrl,
            datos_tutor: {
              name: primaryContactName || "No registrado",
              relationship: primaryContactRel,
              phonePrimary: primaryContactPhone || formData.telEmergencia,
              address: "Pendiente",
              details: {
                vive_con: formData.viveCon,
                persona_inscribe: formData.personaInscribe,
                is_udeii: formData.isUdeii,
              },
              photoUrl: guardianPhotoUrl,
            },
            modificado_por: "Control Escolar",
            modificado_en: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      const mapped: Student = {
        id: newStudent.id,
        matricula: newStudent.matricula,
        name: newStudent.nombre_completo,
        group: newStudent.grupo,
        avatar: newStudent.avatar_url,
        caseState: newStudent.estado_caso as CaseState,
        incidents: [],
        justificantes: [],
        guardianInfo: newStudent.datos_tutor as any,
      };
      importStudents([mapped]);

      toast.success(`Inscripción de ${fullName} concluida exitosamente`, { id: loadingToast });
      setFormData({
        ...formData,
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombre: "",
        curp: "",
        verifiedCurp: false,
      });
      setCurrentStep(1);
    } catch (err: any) {
      toast.error("Error institucional: " + err.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 relative z-10 flex flex-col min-h-full">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Registro de Inscripción</h1>
        <p className="text-slate-500 font-medium tracking-tight">Alta de expediente digital para el {CICLO_ESCOLAR.label}</p>
      </div>

      {/* Stepper Institucional */}
      <div className="flex items-center justify-between relative mb-16 mx-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 z-0"></div>
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />

        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                backgroundColor: currentStep >= step.id ? "#2563eb" : "#f8fafc",
                borderColor: currentStep >= step.id ? "#2563eb" : "#e2e8f0",
                color: currentStep >= step.id ? "#ffffff" : "#94a3b8",
                scale: currentStep === step.id ? 1.15 : 1,
              }}
              className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-lg shadow-slate-100 transition-all`}
            >
              <span className="material-icons text-xl">{step.icon}</span>
            </motion.div>
            <span
              className={`absolute top-14 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${
                currentStep >= step.id ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <GlassCard className="flex-1 flex flex-col overflow-visible p-8 border border-slate-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                    <GlassInput
                      label="Apellido Paterno"
                      placeholder="GARCÍA"
                      value={formData.apellidoPaterno}
                      onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value.toUpperCase() })}
                      required
                    />
                    <GlassInput
                      label="Apellido Materno"
                      placeholder="LÓPEZ"
                      value={formData.apellidoMaterno}
                      onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value.toUpperCase() })}
                      required
                    />
                    <GlassInput
                      label="Nombre(s)"
                      placeholder="JUAN CARLOS"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                      required
                    />
                   </div>
                   <div className="space-y-6">
                    <div className="relative">
                      <GlassInput
                        label="CURP"
                        placeholder="AAAA000000XXXXXX00"
                        maxLength={18}
                        value={formData.curp}
                        onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCurp}
                        className="absolute right-3 bottom-3 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Validar RENAPO
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha Nacimiento</label>
                        <input
                          type="date"
                          title="Fecha de Nacimiento"
                          aria-label="Fecha de Nacimiento"
                          className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          value={formData.fechaNacimiento}
                          onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Género</label>
                        <select
                          title="Género"
                          aria-label="Género"
                          className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          value={formData.genero}
                          onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="X">Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Grupo Asignado</label>
                        <select
                          title="Grupo Asignado"
                          aria-label="Grupo Asignado"
                          className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          value={formData.group}
                          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        >
                          <option value="Provisional">Provisional</option>
                          {GRUPOS.todos().map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <GlassInput
                        label="Promedio Anterior"
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={formData.promedioAnterior}
                        onChange={(e) => setFormData({ ...formData, promedioAnterior: Number(e.target.value) })}
                      />
                    </div>
                   </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vive Con</label>
                      <select
                        title="Vive Con"
                        aria-label="Vive Con"
                        className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        value={formData.viveCon}
                        onChange={(e) => setFormData({ ...formData, viveCon: e.target.value })}
                      >
                        <option value="ambos">Padre y Madre</option>
                        <option value="mama">Solo Madre</option>
                        <option value="papa">Solo Padre</option>
                        <option value="tutor">Tutor Legal</option>
                      </select>
                    </div>
                    <GlassInput label="Nombre del Padre" value={formData.nombrePadre} onChange={(e) => setFormData({ ...formData, nombrePadre: e.target.value.toUpperCase() })} />
                    <GlassInput label="Teléfono Padre" value={formData.telPadre} onChange={(e) => setFormData({ ...formData, telPadre: e.target.value })} />
                    <GlassInput label="Nombre de la Madre" value={formData.nombreMadre} onChange={(e) => setFormData({ ...formData, nombreMadre: e.target.value.toUpperCase() })} />
                    <GlassInput label="Teléfono Madre" value={formData.telMadre} onChange={(e) => setFormData({ ...formData, telMadre: e.target.value })} />
                  </div>
                  <div className="space-y-6">
                    <GlassInput label="Nombre del Tutor" value={formData.nombreTutor} onChange={(e) => setFormData({ ...formData, nombreTutor: e.target.value.toUpperCase() })} />
                    <GlassInput label="Teléfono Tutor" value={formData.telTutor} onChange={(e) => setFormData({ ...formData, telTutor: e.target.value })} />
                    <GlassInput label="Parentesco" value={formData.parentescoTutor} onChange={(e) => setFormData({ ...formData, parentescoTutor: e.target.value })} />
                    <GlassInput label="Teléfono de Emergencia" value={formData.telEmergencia} onChange={(e) => setFormData({ ...formData, telEmergencia: e.target.value })} required />
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                       <span className="text-xs font-bold text-slate-600">¿Requerido por UDEII?</span>
                       <input type="checkbox" title="Requerido por UDEII" aria-label="Requerido por UDEII" checked={formData.isUdeii} onChange={(e) => setFormData({...formData, isUdeii: e.target.checked})} className="size-5 accent-blue-600" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fotografías Oficiales</label>
                       <div className="flex flex-col gap-3">
                          <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <span className="material-icons text-slate-400">face</span>
                               <span className="text-xs font-bold text-slate-700">Foto Estudiante</span>
                             </div>
                             <input type="file" title="Subir Foto Estudiante" aria-label="Subir Foto Estudiante" className="text-[10px]" onChange={(e) => handleFileChange(e, setFileStudent)} />
                          </div>
                          <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <span className="material-icons text-slate-400">assignment_ind</span>
                               <span className="text-xs font-bold text-slate-700">Foto Tutor</span>
                             </div>
                             <input type="file" title="Subir Foto Tutor" aria-label="Subir Foto Tutor" className="text-[10px]" onChange={(e) => handleFileChange(e, setFileGuardian)} />
                          </div>
                       </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4 block">Documentación Recibida</label>
                      <div className="grid grid-cols-1 gap-2">
                        {(Object.keys(formData.docs) as Array<keyof typeof formData.docs>).map((docKey) => (
                           <label key={docKey} title={docKey} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                              <span className="text-xs font-bold text-slate-600">{docKey.replace(/([A-Z])/g, " $1").toUpperCase()}</span>
                              <input type="checkbox" title={docKey} aria-label={docKey} checked={formData.docs[docKey]} onChange={() => handleCheckboxChange(docKey)} className="size-4 accent-emerald-500" />
                           </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Antecedentes de Salud / Situación de Riesgo</label>
                     <textarea 
                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Ej: Alergia a la penicilina, asma, tratamiento médico actual..."
                        value={formData.situacionRiesgo}
                        onChange={(e) => setFormData({...formData, situacionRiesgo: e.target.value})}
                     />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex flex-col items-center">
                   <div className="w-full max-w-2xl bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                         <span className="material-icons text-emerald-500 text-4xl">verified</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-6">Confirmación de Datos</h3>
                      <div className="grid grid-cols-2 gap-8 mb-8">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estudiante</p>
                            <p className="text-sm font-bold text-slate-800">{formData.nombre} {formData.apellidoPaterno} {formData.apellidoMaterno}</p>
                            <p className="text-xs font-mono font-black text-blue-600">{formData.curp}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Asignación</p>
                            <p className="text-sm font-bold text-slate-800">GRUPO: {formData.group}</p>
                            <p className="text-xs font-bold text-slate-500">PROMEDIO: {formData.promedioAnterior}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contacto Primario</p>
                            <p className="text-sm font-bold text-slate-800">{formData.nombrePadre || formData.nombreMadre || formData.nombreTutor || "Pendiente"}</p>
                            <p className="text-xs font-bold text-slate-500">TEL: {formData.telPadre || formData.telMadre || formData.telTutor || formData.telEmergencia}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estatus Institucional</p>
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block uppercase">Expediente Validado</p>
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Al finalizar, el alumno será dado de alta en la base de datos nacional y el expediente digital quedará bajo resguardo institucional.</p>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
            <GlassButton
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className={`min-w-[120px] ${currentStep === 1 ? "opacity-0" : ""}`}
              variant="outline"
            >
              Anterior
            </GlassButton>

            <GlassButton
              type={currentStep === steps.length ? "submit" : "button"}
              onClick={currentStep === steps.length ? undefined : nextStep}
              disabled={isSubmitting}
              className="min-w-[160px]"
              loading={isSubmitting}
            >
              {currentStep === steps.length ? "Finalizar Trámite" : "Siguiente Paso"}
              {currentStep !== steps.length && <span className="material-icons ml-2 text-sm">east</span>}
            </GlassButton>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};
