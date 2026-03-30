import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { Student, CaseState } from "../types";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { GRUPOS, CICLO_ESCOLAR } from "../config/sase.config";
import { GlassCard } from "./ui/GlassCard";

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
    if (window.confirm("¿Validar CURP en RENAPO?"))
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
    const loadingToast = toast.loading("Registrando inscripción...");

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
      let studentPhotoUrl = `https://i.pravatar.cc/150?u=${Math.random()}`;
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
            modificado_por: "Secretaría",
            modificado_en: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      if (newStudent && formData.situacionRiesgo) {
        let docUrl = null;
        if (file)
          docUrl = await uploadFile(
            file,
            "documentos_salud",
            `${newStudent.id}_salud`,
          );
        await supabase.from("salud").insert([
          {
            alumno_id: newStudent.id,
            padecimiento: formData.situacionRiesgo,
            documento_url: docUrl,
          },
        ]);
      }

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

      toast.success(`Expediente de ${fullName} creado`, { id: loadingToast });
      setFormData({
        ...formData,
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombre: "",
        curp: "",
        verifiedCurp: false,
      });
    } catch (err: any) {
      toast.error("Error: " + err.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight mb-2">
          Nueva Inscripción
        </h1>
        <p className="text-slate-400 text-lg">
          Completa el expediente digital en 4 sencillos pasos. {CICLO_ESCOLAR.label}
        </p>
      </div>

      <div className="flex items-center justify-between relative mb-12">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <motion.div
              animate={{
                backgroundColor:
                  currentStep >= step.id
                    ? "rgba(59, 130, 246, 1)"
                    : "rgba(255, 255, 255, 0.05)",
                borderColor:
                  currentStep >= step.id
                    ? "rgba(59, 130, 246, 1)"
                    : "rgba(255, 255, 255, 0.2)",
              }}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-colors duration-300 ${
                currentStep >= step.id
                  ? "shadow-[0_0_20px_rgba(59,130,246,0.6)] text-white"
                  : "text-slate-400"
              }`}
            >
              <span className="material-icons">{step.icon}</span>
            </motion.div>
            <span
              className={`text-sm font-medium ${
                currentStep >= step.id ? "text-blue-400" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard className="min-h-[400px] flex flex-col justify-between overflow-visible">
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Apellido Paterno
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. García"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-blue-500/5 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                        value={formData.apellidoPaterno}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            apellidoPaterno: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Apellido Materno
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. López"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-blue-500/5 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                        value={formData.apellidoMaterno}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            apellidoMaterno: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Nombre(s)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Carlos"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-blue-500/5 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombre: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        CURP
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={18}
                          placeholder="18 caracteres"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-blue-500/5 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 uppercase"
                          value={formData.curp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              curp: e.target.value.toUpperCase(),
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCurp}
                          className={`px-4 rounded-xl text-xs font-black uppercase ${
                            formData.verifiedCurp
                              ? "bg-green-600 text-white"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {formData.verifiedCurp ? "Válido" : "Verificar"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Grupo
                      </label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.group}
                        onChange={(e) =>
                          setFormData({ ...formData, group: e.target.value })
                        }
                      >
                        <option value="Provisional">Provisional</option>
                        {GRUPOS.todos().map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.fechaNacimiento}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fechaNacimiento: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Género
                      </label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.genero}
                        onChange={(e) =>
                          setFormData({ ...formData, genero: e.target.value })
                        }
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="X">No especificar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Promedio Anterior
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.promedioAnterior}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            promedioAnterior: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Vive con
                      </label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.viveCon}
                        onChange={(e) =>
                          setFormData({ ...formData, viveCon: e.target.value })
                        }
                      >
                        <option value="ambos">Padre y Madre</option>
                        <option value="mama">Solo Madre</option>
                        <option value="papa">Solo Padre</option>
                        <option value="tutor">Tutor</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Teléfono de Emergencia
                      </label>
                      <input
                        type="tel"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.telEmergencia}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            telEmergencia: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Nombre del Padre
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.nombrePadre}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombrePadre: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Teléfono del Padre
                      </label>
                      <input
                        type="tel"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.telPadre}
                        onChange={(e) =>
                          setFormData({ ...formData, telPadre: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Nombre de la Madre
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.nombreMadre}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombreMadre: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Teléfono de la Madre
                      </label>
                      <input
                        type="tel"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.telMadre}
                        onChange={(e) =>
                          setFormData({ ...formData, telMadre: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Nombre del Tutor
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.nombreTutor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombreTutor: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Teléfono del Tutor
                      </label>
                      <input
                        type="tel"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.telTutor}
                        onChange={(e) =>
                          setFormData({ ...formData, telTutor: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Parentesco del Tutor
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.parentescoTutor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentescoTutor: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Persona que inscribe
                      </label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.personaInscribe}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personaInscribe: e.target.value,
                          })
                        }
                      >
                        <option value="padre">Padre</option>
                        <option value="madre">Madre</option>
                        <option value="tutor">Tutor</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Motivo de Alta
                      </label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.motivoAlta}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            motivoAlta: e.target.value,
                          })
                        }
                      >
                        <option value="nuevo_ingreso">Nuevo Ingreso</option>
                        <option value="reingreso">Reingreso</option>
                        <option value="cambio">Cambio de Escuela</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        UDEII
                      </label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-all duration-300"
                        value={formData.isUdeii ? "si" : "no"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isUdeii: e.target.value === "si",
                          })
                        }
                      >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Fotografía Estudiante
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                          onChange={(e) => handleFileChange(e, setFileStudent)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Fotografía Tutor
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                          onChange={(e) => handleFileChange(e, setFileGuardian)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(Object.keys(formData.docs) as Array<keyof typeof formData.docs>).map(
                        (docKey) => (
                          <label
                            key={docKey}
                            className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 text-slate-200"
                          >
                            <input
                              type="checkbox"
                              checked={formData.docs[docKey]}
                              onChange={() => handleCheckboxChange(docKey)}
                              className="size-4"
                            />
                            <span className="text-sm font-medium">
                              {docKey.replace(/([A-Z])/g, " $1")}
                            </span>
                          </label>
                        ),
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Situación de Riesgo / Salud
                        </label>
                        <textarea
                          className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                          value={formData.situacionRiesgo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              situacionRiesgo: e.target.value,
                            })
                          }
                          placeholder="Describe condiciones médicas o situación de riesgo"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Documento Médico (Opcional)
                        </label>
                        <input
                          type="file"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                          onChange={(e) => handleFileChange(e, setFile)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-slate-300">
                      Verifica los datos antes de finalizar la inscripción.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                          Alumno
                        </p>
                        <p className="text-slate-200 font-semibold">
                          {formData.nombre} {formData.apellidoPaterno}
                        </p>
                        <p className="text-slate-400 text-sm">{formData.curp}</p>
                      </div>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                          Grupo
                        </p>
                        <p className="text-slate-200 font-semibold">
                          {formData.group}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Promedio: {formData.promedioAnterior}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                          Contacto
                        </p>
                        <p className="text-slate-200 font-semibold">
                          {formData.nombrePadre ||
                            formData.nombreMadre ||
                            formData.nombreTutor ||
                            "No registrado"}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {formData.telPadre ||
                            formData.telMadre ||
                            formData.telTutor ||
                            formData.telEmergencia}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                currentStep === 1
                  ? "opacity-0 cursor-default"
                  : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
              }`}
            >
              Atrás
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type={currentStep === steps.length ? "submit" : "button"}
              onClick={currentStep === steps.length ? undefined : nextStep}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-blue-600 text-white font-medium shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all disabled:opacity-60"
            >
              {currentStep === steps.length
                ? isSubmitting
                  ? "Procesando..."
                  : "Finalizar Inscripción"
                : "Siguiente"}
              <span className="material-icons text-sm">
                {currentStep === steps.length ? "check" : "arrow_forward"}
              </span>
            </motion.button>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};
