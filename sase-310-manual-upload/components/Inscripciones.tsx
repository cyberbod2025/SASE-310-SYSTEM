import React, { useState } from "react";
import { useApp } from "../store";
import { Student, CaseState } from "../types";
import { supabase } from "../supabase/client";

export const Inscripciones: React.FC = () => {
  const { importStudents } = useApp();

  // -- Local State for the Complex Form --
  const [formData, setFormData] = useState({
    // Student Core
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombre: "",
    curp: "",
    verifiedCurp: false,
    fechaNacimiento: "",
    genero: "M",
    promedioAnterior: 0,
    group: "Provisional",

    // Family & Guardian
    nombrePadre: "",
    telPadre: "",

    nombreMadre: "",
    telMadre: "",

    nombreTutor: "",
    telTutor: "",
    parentescoTutor: "", // Abuelo, Tío, Hermano, etc.

    viveCon: "ambos", // ambos, mama, papa, tutor, otro
    telEmergencia: "",

    // Enrollment Details
    motivoAlta: "nuevo_ingreso", // nuevo_ingreso, cambio_escuela
    isUdeii: false,
    personaInscribe: "padre", // padre, madre, tutor

    // Health
    situacionRiesgo: "",
    hasMedicalDoc: false,
    detallePersonaInscribe: "", // For "Otro"

    // UI Verification State
    verificationCode: "",
    verifyingPhone: null as "mama" | "papa" | "tutor" | null,
    verifiedPhones: { mama: false, papa: false, tutor: false },

    // Documents Checklist
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleVerifyCurp = () => {
    // Simulation of external validation
    if (formData.curp.length < 18) {
      alert("El CURP debe tener 18 caracteres.");
      return;
    }
    // Open RENAPO in new tab just for "realism" or simulate verification
    const confirm = window.confirm(
      "¿Desea verificar este CURP en el portal oficial de RENAPO?\n(Esto abrirá una nueva ventana)"
    );
    if (confirm) {
      window.open("https://www.gob.mx/curp/", "_blank");
    }
    setFormData({ ...formData, verifiedCurp: true });
  };

  const handleCheckboxChange = (doc: keyof typeof formData.docs) => {
    setFormData({
      ...formData,
      docs: { ...formData.docs, [doc]: !formData.docs[doc] },
    });
  };

  /* -- PHONE VERIFICATION LOGIC (MOCK) -- */
  const [verifyingPhone, setVerifyingPhone] = useState<
    "mama" | "papa" | "tutor" | null
  >(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedPhones, setVerifiedPhones] = useState({
    mama: false,
    papa: false,
    tutor: false,
  });

  const startVerification = (type: "mama" | "papa" | "tutor") => {
    setVerifyingPhone(type);
    setVerificationCode("");
    alert(`[SIMULACIÓN SMS] Enviando código 1234 al número registrado...`);
  };

  const verifyCode = () => {
    if (verificationCode === "1234") {
      setVerifiedPhones({ ...verifiedPhones, [verifyingPhone!]: true });
      setVerifyingPhone(null);
      alert("¡Teléfono verificado exitosamente!");
    } else {
      alert("Código incorrecto (Use 1234)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct Full Name
    const fullName =
      `${formData.apellidoPaterno} ${formData.apellidoMaterno} ${formData.nombre}`.trim();

    // Determine Guardian Info based on "Persona que Inscribe" or "Vive Con" logic
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

    try {
      const { data: newStudentData, error: studentError } = await supabase
        .from("alumnos")
        .insert([
          {
            nombre: fullName,
            curp: formData.curp,
            grado: formData.group.split(" ")[0] || "1º", // Extract grade from "1º A"
            grupo: formData.group,
            estado_caso: CaseState.OBSERVADO, // Default state
            fecha_nacimiento: formData.fechaNacimiento || null,
            genero: formData.genero,
            promedio_anterior: formData.promedioAnterior,
            avatar_url: `https://i.pravatar.cc/150?u=${Math.random()}`,
            guardian_info: {
              name: primaryContactName || "No registrado",
              relationship: primaryContactRel,
              phonePrimary: primaryContactPhone || formData.telEmergencia,
              address: "Dirección pendiente de registro",
              details: {
                vive_con: formData.viveCon,
                persona_inscribe: formData.personaInscribe,
                detalle_persona_inscribe: formData.detallePersonaInscribe,
              },
            },
            last_modified_by: "Secretaría (Web)", // Should ideally be current user
            last_modified_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      if (newStudentData && formData.situacionRiesgo) {
        let docUrl = null;
        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${newStudentData.id}_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("documentos_salud")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            alert(
              "Error al subir el documento, pero el alumno fue registrado."
            );
          } else {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("documentos_salud")
              .getPublicUrl(fileName);
            docUrl = publicUrl;
          }
        }

        const { error: healthError } = await supabase.from("salud").insert([
          {
            alumno_id: newStudentData.id,
            padecimiento: formData.situacionRiesgo,
            documento_url: docUrl,
            // alerts: ...
          },
        ]);
        if (healthError)
          console.error("Error saving health info:", healthError);
      }

      // Also update local store for immediate feedback
      if (newStudentData) {
        const mappedStudent: Student = {
          id: newStudentData.id,
          matricula: newStudentData.curp || "PENDIENTE", // Fallback
          name: newStudentData.nombre,
          group: newStudentData.grupo,
          avatar: newStudentData.avatar_url,
          caseState: newStudentData.estado_caso as CaseState,
          incidents: [],
          justificantes: [],
          guardianInfo: newStudentData.guardian_info as any,
          // ... map other fields if needed
        };
        importStudents([mappedStudent]);
      }

      alert(
        `Alumno ${fullName} inscrito correctamente en SUPABASE.\nExpediente Digital 2024 Abierto.`
      );

      // Reset Form
      setFormData({
        apellidoPaterno: "",
        apellidoMaterno: "",
        nombre: "",
        curp: "",
        verifiedCurp: false,
        group: "Provisional",
        fechaNacimiento: "",
        genero: "M",
        promedioAnterior: 0,
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
        verifyingPhone: null,
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
      setFile(null);
    } catch (err: any) {
      console.error("Error registering student:", err);
      alert("Error al registrar alumno: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            Ficha de Inscripción
          </h2>
          <p className="text-text-secondary">Ciclo Escolar 2024-2025</p>
        </div>
        <div className="text-right text-xs text-text-secondary">
          <p>Fecha: {new Date().toLocaleDateString()}</p>
          <p>Hora: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: DATOS DEL ALUMNO */}
        <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
          <h3 className="font-bold text-lg text-primary mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">person</span> Datos del
            Alumno
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Apellido Paterno
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                required
                value={formData.apellidoPaterno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apellidoPaterno: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Apellido Materno
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={formData.apellidoMaterno}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apellidoMaterno: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Nombre(s)
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                CURP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={`w-full border p-2 rounded uppercase ${
                    formData.verifiedCurp ? "border-green-500 bg-green-50" : ""
                  }`}
                  required
                  maxLength={18}
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
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    formData.verifiedCurp
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {formData.verifiedCurp ? "VALIDADO" : "VERIFICAR"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Grupo Asignado
              </label>
              <select
                className="w-full border p-2 rounded"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
              >
                <option value="Provisional">Provisional (Nuevo Ingreso)</option>
                {["1º A", "1º B", "2º A", "2º B", "3º A", "3º B"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="udeii"
                className="size-5 text-primary focus:ring-primary rounded"
                checked={formData.isUdeii}
                onChange={(e) =>
                  setFormData({ ...formData, isUdeii: e.target.checked })
                }
              />
              <label
                htmlFor="udeii"
                className="font-bold text-gray-700 cursor-pointer"
              >
                ¿Es alumno UDEII?
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                required
                className="w-full border p-2 rounded"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fechaNacimiento: e.target.value })
                }
              />
              <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">
                  cake
                </span>
                Genera alerta de cumpleaños automática
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Género
              </label>
              <select
                className="w-full border p-2 rounded"
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="X">No binario / Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Promedio Grado Anterior
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="w-full border p-2 rounded"
                placeholder="Ej. 8.5"
                value={formData.promedioAnterior}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promedioAnterior: Number(e.target.value),
                  })
                }
              />
              <p className="text-[10px] text-text-secondary mt-1">
                Dato crucial para la IA de balanceo de grupos
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATOS FAMILIARES */}
        <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
          <h3 className="font-bold text-lg text-primary mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">family_restroom</span>{" "}
            Datos Familiares
          </h3>

          {/* Living Situation */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">
              Vive Con:
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                { val: "ambos", label: "Ambos Padres" },
                { val: "mama", label: "Solo Mamá" },
                { val: "papa", label: "Solo Papá" },
                { val: "tutor", label: "Tutor / Familiar" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    formData.viveCon === opt.val
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="viveCon"
                    className="hidden"
                    value={opt.val}
                    checked={formData.viveCon === opt.val}
                    onChange={(e) =>
                      setFormData({ ...formData, viveCon: e.target.value })
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Nombre de la Madre
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                  value={formData.nombreMadre}
                  disabled={
                    formData.viveCon === "papa" || formData.viveCon === "tutor"
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, nombreMadre: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Celular Madre
                </label>
                <input
                  type="tel"
                  className={`w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400 ${
                    verifiedPhones.mama ? "border-green-500 bg-green-50" : ""
                  }`}
                  value={formData.telMadre}
                  disabled={
                    formData.viveCon === "papa" ||
                    formData.viveCon === "tutor" ||
                    verifiedPhones.mama
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, telMadre: e.target.value })
                  }
                />
                {!(
                  formData.viveCon === "papa" || formData.viveCon === "tutor"
                ) &&
                  formData.telMadre.length >= 10 &&
                  !verifiedPhones.mama && (
                    <div className="mt-2 text-right">
                      {verifyingPhone === "mama" ? (
                        <div className="flex gap-2 justify-end items-center animate-fade-in">
                          <span className="text-xs text-text-secondary">
                            Código (1234):
                          </span>
                          <input
                            type="text"
                            maxLength={4}
                            className="w-16 border rounded p-1 text-center text-sm"
                            value={verificationCode}
                            onChange={(e) =>
                              setVerificationCode(e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={verifyCode}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setVerifyingPhone(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <span className="material-symbols-outlined text-sm">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startVerification("mama")}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto"
                        >
                          <span className="material-symbols-outlined text-sm">
                            sms
                          </span>{" "}
                          Verificar Celular
                        </button>
                      )}
                    </div>
                  )}
                {verifiedPhones.mama && (
                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>{" "}
                    Verificado{" "}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Nombre del Padre
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                  value={formData.nombrePadre}
                  disabled={
                    formData.viveCon === "mama" || formData.viveCon === "tutor"
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, nombrePadre: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Celular Padre
                </label>
                <input
                  type="tel"
                  className={`w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400 ${
                    verifiedPhones.papa ? "border-green-500 bg-green-50" : ""
                  }`}
                  value={formData.telPadre}
                  disabled={
                    formData.viveCon === "mama" ||
                    formData.viveCon === "tutor" ||
                    verifiedPhones.papa
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, telPadre: e.target.value })
                  }
                />
                {!(
                  formData.viveCon === "mama" || formData.viveCon === "tutor"
                ) &&
                  formData.telPadre.length >= 10 &&
                  !verifiedPhones.papa && (
                    <div className="mt-2 text-right">
                      {verifyingPhone === "papa" ? (
                        <div className="flex gap-2 justify-end items-center animate-fade-in">
                          <span className="text-xs text-text-secondary">
                            Código (1234):
                          </span>
                          <input
                            type="text"
                            maxLength={4}
                            className="w-16 border rounded p-1 text-center text-sm"
                            value={verificationCode}
                            onChange={(e) =>
                              setVerificationCode(e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={verifyCode}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setVerifyingPhone(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <span className="material-symbols-outlined text-sm">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startVerification("papa")}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto"
                        >
                          <span className="material-symbols-outlined text-sm">
                            sms
                          </span>{" "}
                          Verificar Celular
                        </button>
                      )}
                    </div>
                  )}
                {verifiedPhones.papa && (
                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>{" "}
                    Verificado{" "}
                  </p>
                )}
              </div>
            </div>

            {formData.viveCon === "tutor" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Nombre del Tutor
                  </label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.nombreTutor}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreTutor: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Parentesco
                  </label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.parentescoTutor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentescoTutor: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione...</option>
                    <option value="Abuelo">Abuelo(a)</option>
                    <option value="Tio">Tío(a)</option>
                    <option value="Hermano">Hermano(a)</option>
                    <option value="Padrastro">Padrastro/Madrastra</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Celular Tutor
                  </label>
                  <input
                    type="tel"
                    className={`w-full border p-2 rounded ${
                      verifiedPhones.tutor ? "border-green-500 bg-green-50" : ""
                    }`}
                    value={formData.telTutor}
                    onChange={(e) =>
                      setFormData({ ...formData, telTutor: e.target.value })
                    }
                    disabled={verifiedPhones.tutor}
                  />
                  {formData.telTutor.length >= 10 && !verifiedPhones.tutor && (
                    <div className="mt-2 text-right">
                      {verifyingPhone === "tutor" ? (
                        <div className="flex gap-2 justify-end items-center animate-fade-in">
                          <span className="text-xs text-text-secondary">
                            Código (1234):
                          </span>
                          <input
                            type="text"
                            maxLength={4}
                            className="w-16 border rounded p-1 text-center text-sm"
                            value={verificationCode}
                            onChange={(e) =>
                              setVerificationCode(e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={verifyCode}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setVerifyingPhone(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <span className="material-symbols-outlined text-sm">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startVerification("tutor")}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto"
                        >
                          <span className="material-symbols-outlined text-sm">
                            sms
                          </span>{" "}
                          Verificar Celular
                        </button>
                      )}
                    </div>
                  )}
                  {verifiedPhones.tutor && (
                    <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>{" "}
                      Verificado{" "}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Teléfono de Emergencia Adicional
              </label>
              <input
                type="tel"
                className="w-full md:w-1/3 border p-2 rounded"
                placeholder="Ej. Vecino, Oficina, etc."
                value={formData.telEmergencia}
                onChange={(e) =>
                  setFormData({ ...formData, telEmergencia: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SALUD Y CHECKLIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4 border-b border-gray-100 pb-2">
              Salud
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Situación Médica de Riesgo
              </label>
              <textarea
                className="w-full border p-2 rounded h-20 text-sm"
                placeholder="Alergias, Padecimientos crónicos, etc."
                value={formData.situacionRiesgo}
                onChange={(e) =>
                  setFormData({ ...formData, situacionRiesgo: e.target.value })
                }
              ></textarea>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="doc_medico"
                className="rounded text-primary focus:ring-primary"
                checked={formData.hasMedicalDoc}
                onChange={(e) =>
                  setFormData({ ...formData, hasMedicalDoc: e.target.checked })
                }
              />
              <label htmlFor="doc_medico" className="text-sm font-medium">
                Presenta documento médico probatorio
              </label>
            </div>
            {formData.hasMedicalDoc && (
              <div className="relative mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-3xl text-gray-400">
                  add_a_photo
                </span>
                <p className="text-sm text-gray-500 font-medium">
                  {file ? file.name : "Subir foto del documento"}
                </p>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4 border-b border-gray-100 pb-2">
              Documentación Entregada
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docs.actaNacimiento}
                  onChange={() => handleCheckboxChange("actaNacimiento")}
                  className="rounded text-primary size-5"
                />
                <span className="text-sm">Acta de Nacimiento</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docs.curpDoc}
                  onChange={() => handleCheckboxChange("curpDoc")}
                  className="rounded text-primary size-5"
                />
                <span className="text-sm">CURP Impresa</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docs.comprobanteDomicilio}
                  onChange={() => handleCheckboxChange("comprobanteDomicilio")}
                  className="rounded text-primary size-5"
                />
                <span className="text-sm">Comprobante de Domicilio</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docs.boletaPrimaria}
                  onChange={() => handleCheckboxChange("boletaPrimaria")}
                  className="rounded text-primary size-5"
                />
                <span className="text-sm">Boleta Primaria (Solo 1º)</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docs.boletaSecundaria}
                  onChange={() => handleCheckboxChange("boletaSecundaria")}
                  className="rounded text-primary size-5"
                />
                <span className="text-sm">Boleta Grado Anterior</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 4: DETALLES DE ALTA */}
        <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Motivo de Alta
              </label>
              <select
                className="w-full border p-2 rounded bg-gray-50"
                value={formData.motivoAlta}
                onChange={(e) =>
                  setFormData({ ...formData, motivoAlta: e.target.value })
                }
              >
                <option value="nuevo_ingreso">
                  Nuevo Ingreso (Inscripción Ordinaria)
                </option>
                <option value="cambio_escuela">
                  Traslado / Cambio de Escuela
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                Quién realiza el trámite
              </label>
              <select
                className="w-full border p-2 rounded"
                value={formData.personaInscribe}
                onChange={(e) =>
                  setFormData({ ...formData, personaInscribe: e.target.value })
                }
              >
                <option value="padre">Padre</option>
                <option value="madre">Madre</option>
                <option value="tutor">Tutor</option>
                <option value="otro">Otro Familiar</option>
              </select>
              {formData.personaInscribe === "otro" && (
                <input
                  type="text"
                  placeholder="¿Quién?"
                  className="w-full border p-2 rounded mt-2 text-sm bg-yellow-50"
                  value={formData.detallePersonaInscribe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detallePersonaInscribe: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-primary text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:bg-primary-hover transform active:scale-95 transition-all text-lg flex items-center gap-2"
          >
            <span className="material-symbols-outlined">save</span>
            Guardar Expediente
          </button>
        </div>
      </form>
    </div>
  );
};
