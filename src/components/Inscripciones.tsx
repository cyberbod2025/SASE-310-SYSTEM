import React, { useState } from "react";
import { useApp } from "../store";
import { Student, CaseState } from "../types";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

export const Inscripciones: React.FC = () => {
  const { importStudents } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    verificationCode: "",
    verifyingPhone: null as "mama" | "papa" | "tutor" | null,
    verifiedPhones: { mama: false, papa: false, tutor: false },
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

  const startVerification = (type: "mama" | "papa" | "tutor") => {
    setFormData({ ...formData, verifyingPhone: type, verificationCode: "" });
    toast.success(`Código enviado al ${type} (Simulación: 1234)`);
  };

  const verifyCode = () => {
    if (formData.verificationCode === "1234") {
      setFormData({
        ...formData,
        verifiedPhones: {
          ...formData.verifiedPhones,
          [formData.verifyingPhone!]: true,
        },
        verifyingPhone: null,
      });
      toast.success("Teléfono verificado");
    } else {
      toast.error("Código incorrecto");
    }
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
    <div className="flex-1 w-full space-y-8 animate-fade-in pb-20">
      <header className="flex items-center gap-5 pb-6 border-b border-slate-200">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-cyan-600"></div>
          <span className="material-symbols-outlined text-4xl text-cyan-700">
            person_add
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Control de Inscripciones
          </h2>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">
            Control Escolar • Ciclo 2024-2025
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <Section title="01. Datos del Alumno" icon="person">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField label="Apellido Paterno" required>
              <input
                type="text"
                className="inst-input"
                required
                value={formData.apellidoPaterno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apellidoPaterno: e.target.value.toUpperCase(),
                  })
                }
              />
            </FormField>
            <FormField label="Apellido Materno">
              <input
                type="text"
                className="inst-input"
                value={formData.apellidoMaterno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apellidoMaterno: e.target.value.toUpperCase(),
                  })
                }
              />
            </FormField>
            <FormField label="Nombre(s)" required>
              <input
                type="text"
                className="inst-input"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value.toUpperCase(),
                  })
                }
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <FormField label="CURP" required>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={18}
                  className={`inst-input ${
                    formData.verifiedCurp ? "bg-green-50 border-green-200" : ""
                  }`}
                  required
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
                      : "bg-slate-100 text-slate-600 shadow-sm"
                  }`}
                >
                  {formData.verifiedCurp ? "Válido" : "Verificar"}
                </button>
              </div>
            </FormField>
            <FormField label="Grupo">
              <select
                className="inst-input"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
              >
                <option value="Provisional">Provisional</option>
                {["1º A", "1º B", "2º A", "2º B", "3º A", "3º B"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </FormField>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="udeii"
                className="size-5 rounded border-slate-300 text-cyan-600"
                checked={formData.isUdeii}
                onChange={(e) =>
                  setFormData({ ...formData, isUdeii: e.target.checked })
                }
              />
              <label
                htmlFor="udeii"
                className="text-xs font-black text-slate-700 uppercase tracking-widest cursor-pointer"
              >
                Alumno UDEII
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <FormField label="Nacimiento">
              <input
                type="date"
                required
                className="inst-input"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fechaNacimiento: e.target.value })
                }
              />
            </FormField>
            <FormField label="Género">
              <select
                className="inst-input"
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="X">Otro</option>
              </select>
            </FormField>
            <FormField label="Promedio">
              <input
                type="number"
                step="0.1"
                className="inst-input"
                value={formData.promedioAnterior}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promedioAnterior: Number(e.target.value),
                  })
                }
              />
            </FormField>
          </div>
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FormField label="Fotografía Estudiante">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFileStudent)}
                className="text-xs file:bg-white file:border file:border-slate-200 file:rounded-xl file:px-4 file:py-2.5 file:mr-4 file:font-black file:uppercase file:text-slate-600 file:shadow-sm"
              />
            </FormField>
          </div>
        </Section>

        <Section title="02. Datos Familiares" icon="family_restroom">
          <div className="mb-8 space-y-4">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">
              Residencia del Alumno:
            </label>
            <div className="flex flex-wrap gap-3">
              {["ambos", "mama", "papa", "tutor"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData({ ...formData, viveCon: v })}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shadow-sm ${
                    formData.viveCon === v
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ParentCard
              role="Madre"
              name={formData.nombreMadre}
              phone={formData.telMadre}
              verified={formData.verifiedPhones.mama}
              disabled={
                formData.viveCon === "papa" || formData.viveCon === "tutor"
              }
              onName={(v) => setFormData({ ...formData, nombreMadre: v })}
              onPhone={(v) => setFormData({ ...formData, telMadre: v })}
              onVerify={() => startVerification("mama")}
            />
            <ParentCard
              role="Padre"
              name={formData.nombrePadre}
              phone={formData.telPadre}
              verified={formData.verifiedPhones.papa}
              disabled={
                formData.viveCon === "mama" || formData.viveCon === "tutor"
              }
              onName={(v) => setFormData({ ...formData, nombrePadre: v })}
              onPhone={(v) => setFormData({ ...formData, telPadre: v })}
              onVerify={() => startVerification("papa")}
            />
          </div>
          {formData.verifyingPhone && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-800 uppercase italic">
                    Verificar Línea
                  </h3>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  className="w-full text-center text-4xl font-black py-4 bg-slate-50 rounded-2xl border"
                  value={formData.verificationCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verificationCode: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={verifyCode}
                  className="w-full py-4 bg-cyan-700 text-white rounded-2xl font-black text-[10px] uppercase"
                >
                  Confirmar Identidad
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, verifyingPhone: null })
                  }
                  className="w-full text-[10px] font-black text-slate-400 uppercase"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section title="03. Salud" icon="medical_services">
            <textarea
              className="inst-input h-32 resize-none"
              placeholder="Situación médica..."
              value={formData.situacionRiesgo}
              onChange={(e) =>
                setFormData({ ...formData, situacionRiesgo: e.target.value })
              }
            />
            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="mDoc"
                className="size-5 rounded border-slate-300 text-cyan-600"
                checked={formData.hasMedicalDoc}
                onChange={(e) =>
                  setFormData({ ...formData, hasMedicalDoc: e.target.checked })
                }
              />
              <label
                htmlFor="mDoc"
                className="text-xs font-black text-slate-700 uppercase tracking-widest"
              >
                Anexar Expediente Médico
              </label>
            </div>
            {formData.hasMedicalDoc && (
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setFile)}
                className="mt-4 text-xs"
              />
            )}
          </Section>

          <Section title="04. Documentos" icon="fact_check">
            <div className="space-y-3">
              {[
                "actaNacimiento",
                "curpDoc",
                "comprobanteDomicilio",
                "boletaPrimaria",
                "boletaSecundaria",
              ].map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={d}
                    className="size-5 rounded border-slate-300"
                    checked={(formData.docs as any)[d]}
                    onChange={() => handleCheckboxChange(d as any)}
                  />
                  <label
                    htmlFor={d}
                    className="text-xs font-bold text-slate-600 uppercase italic"
                  >
                    {(d as string).replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-cyan-900/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">
            {isSubmitting ? "sync" : "save"}
          </span>
          {isSubmitting ? "Procesando..." : "Finalizar Inscripción Oficial"}
        </button>
      </form>
    </div>
  );
};

const Section = ({ title, icon, children }: any) => (
  <section className="space-y-6">
    <div className="flex items-center gap-3 text-slate-800">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <h2 className="text-sm font-black uppercase tracking-widest italic">
        {title}
      </h2>
    </div>
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      {children}
    </div>
  </section>
);

const FormField = ({ label, required, children }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const ParentCard = ({
  role,
  name,
  phone,
  verified,
  disabled,
  onName,
  onPhone,
  onVerify,
}: any) => (
  <div
    className={`p-6 rounded-2xl border transition-all ${
      disabled
        ? "bg-slate-50 opacity-40 grayscale"
        : "bg-white border-slate-200 shadow-sm"
    }`}
  >
    <div className="flex items-center gap-2 mb-4 font-black text-slate-800 text-[11px] uppercase tracking-widest border-b pb-2">
      {role}
    </div>
    <div className="space-y-4">
      <FormField label="Nombre">
        <input
          type="text"
          disabled={disabled}
          className="inst-input"
          value={name}
          onChange={(e) => onName(e.target.value)}
        />
      </FormField>
      <FormField label="Teléfono">
        <div className="flex gap-2">
          <input
            type="tel"
            disabled={disabled || verified}
            className={`inst-input ${
              verified ? "bg-green-50 border-green-200" : ""
            }`}
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
          />
          {!disabled && (
            <button
              type="button"
              onClick={onVerify}
              disabled={verified}
              className={`px-3 rounded-xl text-xs font-black uppercase ${
                verified
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-600 shadow-sm"
              }`}
            >
              {verified ? "OK" : "VERIFICAR"}
            </button>
          )}
        </div>
      </FormField>
    </div>
  </div>
);
