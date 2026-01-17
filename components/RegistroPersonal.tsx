import React, { useState } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

interface RegistroPersonalProps {
  onBack: () => void;
}

// Textos legales
const AVISO_PRIVACIDAD = `SASE-310 recaba datos personales del personal escolar con fines de identificación, control de acceso, asignación de funciones y respaldo institucional. El acceso a datos sensibles está restringido por rol y auditado. Puedes ejercer derechos de rectificación u oposición mediante la Dirección del plantel.`;

const COMPROMISO_ETICO = `Me comprometo a usar SASE-310 únicamente con fines institucionales y educativos; a resguardar la confidencialidad; a no compartir credenciales; y a evitar la difusión indebida de información. Reconozco que el uso inadecuado puede derivar en medidas administrativas conforme a la normativa aplicable.`;

const TEXTO_AUDITORIA = `Todas las acciones relevantes (consulta, registro, edición, desbloqueo de identidad) quedan registradas con fecha, hora y usuario para fines de seguridad y trazabilidad.`;

export const RegistroPersonal: React.FC<RegistroPersonalProps> = ({
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folioSolicitud, setFolioSolicitud] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Bloque 1: Identidad
    rolesSeleccionados: [] as string[],
    turno: "vespertino",

    // Bloque 2: Datos sensibles
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    correoInstitucional: "",
    telefono: "",

    // Bloque 3: Info académica (dinámico)
    materias: [] as string[],
    grupos: [] as string[],
    esTutor: false,
    grupoTutor: "",
    areaCobertura: "",
    observaciones: "",

    // Bloque 4: Seguridad
    checkPrivacidad: false,
    checkEtica: false,
    checkAuditoria: false,
    password: "",
    confirmPassword: "",
  });

  const handleRolToggle = (rol: string) => {
    setFormData((prev) => ({
      ...prev,
      rolesSeleccionados: prev.rolesSeleccionados.includes(rol)
        ? prev.rolesSeleccionados.filter((r) => r !== rol)
        : [...prev.rolesSeleccionados, rol],
    }));
  };

  const handleArrayToggle = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.rolesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un rol");
      return;
    }

    if (
      !formData.checkPrivacidad ||
      !formData.checkEtica ||
      !formData.checkAuditoria
    ) {
      toast.error("Debes aceptar todos los términos institucionales");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.telefono && formData.telefono.length !== 10) {
      toast.error("El teléfono debe ser de 10 dígitos");
      return;
    }

    setLoading(true);

    try {
      // Generar matrícula temporal (se confirmará al aprobar)
      const randomNum = Math.floor(Math.random() * 1000);
      const matriculaTemp = `TEMP-${randomNum}`;

      // Insertar solicitud en la base de datos
      const { data, error } = await supabase
        .from("solicitudes_alta_personal")
        .insert({
          rol_solicitado: formData.rolesSeleccionados,
          turno: formData.turno,
          nombres: formData.nombres.toUpperCase(),
          apellido_paterno: formData.apellidoPaterno.toUpperCase(),
          apellido_materno: formData.apellidoMaterno.toUpperCase(),
          curp: formData.curp.toUpperCase(),
          correo_institucional: formData.correoInstitucional,
          telefono: formData.telefono || null,
          materias: formData.materias.length > 0 ? formData.materias : null,
          grupos: formData.grupos.length > 0 ? formData.grupos : null,
          es_tutor: formData.esTutor,
          grupo_tutor: formData.grupoTutor || null,
          area_cobertura: formData.areaCobertura || null,
          observaciones: formData.observaciones || null,
          acepta_privacidad: formData.checkPrivacidad,
          acepta_etica: formData.checkEtica,
          acepta_auditoria: formData.checkAuditoria,
          estado: "PENDIENTE",
          metadata: {
            folio_solicitud: matriculaTemp, // Guardar la referencia temporal en metadata
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Generar folio de seguimiento
      const folio = `REQ-${new Date().getFullYear()}-${String(
        randomNum
      ).padStart(4, "0")}`;
      setFolioSolicitud(folio);
      setSuccess(true);

      // Registrar en auditoría (sin auth aún)
      await supabase.from("auditoria").insert({
        email_usuario: formData.correoInstitucional,
        tipo_accion: "CREACION",
        descripcion_accion: `Solicitud de alta de personal enviada: ${folio}`,
        tabla_objetivo: "solicitudes_alta_personal",
        id_registro_objetivo: data.id,
        nuevos_valores: { folio, roles: formData.rolesSeleccionados },
      });
    } catch (error: any) {
      console.error("Error al enviar solicitud:", error);
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#020510] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-10 shadow-2xl">
          <div className="text-center">
            <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-emerald-500/30">
              <span className="material-symbols-outlined text-6xl text-emerald-400">
                verified
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Solicitud Enviada
            </h2>
            <p className="text-emerald-400 font-mono text-lg mb-6">
              Folio: {folioSolicitud}
            </p>

            <div className="bg-black/30 p-6 rounded-xl border border-white/5 mb-6 text-left">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">schedule</span>
                Estado Actual: PENDIENTE DE VALIDACIÓN
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Tu solicitud será revisada por la{" "}
                <strong>Dirección o Subdirección del Plantel</strong>. El
                proceso incluye:
              </p>
              <ol className="text-gray-400 text-sm space-y-2 ml-6 list-decimal">
                <li>Validación de identidad (CURP + Correo institucional)</li>
                <li>Asignación de Matrícula SASE oficial (ej. EMP-310-XXX)</li>
                <li>Configuración de alcances y permisos</li>
                <li>Activación de cuenta</li>
              </ol>
              <p className="text-orange-300 text-xs mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">email</span>
                Recibirás notificación en:{" "}
                <strong>{formData.correoInstitucional}</strong>
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen w-full relative font-sans text-slate-100 bg-black overflow-x-hidden">
      {/* 1. Nebula Background with Dynamic Pan */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center md:bg-right scale-110 animate-backgroundDrift pointer-events-none"
        style={{
          backgroundImage: 'url("/assets/branding/login_background_final.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        {/* Mask over the "LONGU" area in the top left */}
        <div className="absolute top-0 left-0 w-64 h-24 bg-black/60 blur-3xl z-10"></div>
      </div>

      <style>{`
        @keyframes backgroundDrift {
          0% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1.15) translate(-15px, -8px); }
          100% { transform: scale(1.1) translate(0, 0); }
        }
        .animate-backgroundDrift {
          animation: backgroundDrift 40s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto py-12 px-4">
        {/* HEADER - Futuristic Terminal Style */}
        <div className="bg-black/60 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 mb-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(146,64,14,0.3)] group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>

          <div className="relative z-10">
            <img
              src="/assets/branding/SASE.png"
              alt="Logo SASE"
              className="h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
            />
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-[1px] w-12 bg-orange-500/30"></div>
              <p className="text-orange-400 text-xs uppercase tracking-[0.5em] font-black">
                PROTOCOLOS INSTITUCIONALES 2026
              </p>
              <div className="h-[1px] w-12 bg-orange-500/30"></div>
            </div>
            <h1
              className="text-4xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: "0 0 15px rgba(255,255,255,0.2)" }}
            >
              ALTA DE PERSONAL{" "}
              <span className="text-orange-500 underline decoration-orange-500/30">
                SASE-310
              </span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-orange-300/40 text-[10px] font-bold tracking-widest uppercase mt-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              CCT 09DES4310M · TRANSMISIÓN CIFRADA · ACCESO AUDITADO
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BLOQUE 1: IDENTIDAD INSTITUCIONAL */}
          <div className="bg-black/40 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-2xl relative group hover:border-orange-500/40 transition-colors">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500/50 rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500/50 rounded-br-xl"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span className="material-symbols-outlined text-orange-400 text-2xl">
                  verified_user
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-wider">
                  01. IDENTIDAD INSTITUCIONAL
                </h2>
                <div className="h-0.5 w-16 bg-orange-600 rounded-full mt-1"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Matrícula auto */}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 mb-2 block flex items-center gap-2">
                  Matrícula SASE (generada automáticamente)
                  <span
                    className="material-symbols-outlined text-xs text-orange-400"
                    title="Identificador interno visible en el sistema"
                  >
                    info
                  </span>
                </label>
                <div className="h-12 bg-white/5 border border-white/10 rounded-lg flex items-center px-4 text-gray-400 font-mono text-sm">
                  EMP-310-XXX (se asignará al aprobar)
                </div>
              </div>

              {/* Roles (multi-select visual) */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Rol(es) Solicitado(s) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: "docente", label: "DOCENTE", icon: "school" },
                    {
                      id: "prefectura",
                      label: "PREFECTURA",
                      icon: "verified_user",
                    },
                    { id: "tutor", label: "TUTOR", icon: "groups" },
                    {
                      id: "orientacion",
                      label: "ORIENTACIÓN",
                      icon: "psychology",
                    },
                    {
                      id: "trabajo_social",
                      label: "TRABAJO SOCIAL",
                      icon: "volunteer_activism",
                    },
                    {
                      id: "subdireccion",
                      label: "SUBDIRECCIÓN",
                      icon: "manage_accounts",
                    },
                    {
                      id: "direccion",
                      label: "DIRECCIÓN",
                      icon: "admin_panel_settings",
                    },
                    { id: "udeii", label: "UDEII", icon: "psychology_alt" },
                  ].map((rol) => (
                    <button
                      key={rol.id}
                      type="button"
                      onClick={() => handleRolToggle(rol.id)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 text-[11px] font-black tracking-tighter ${
                        formData.rolesSeleccionados.includes(rol.id)
                          ? "bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-[1.02]"
                          : "bg-black/50 border-white/5 text-slate-400 hover:border-orange-500/30 hover:bg-black/80"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {rol.icon}
                      </span>
                      <span>{rol.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Turno */}
              <div className="md:col-span-1">
                <label className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3 block">
                  TURNO ASIGNADO
                </label>
                <div className="h-14 bg-orange-900/10 border border-orange-500/50 rounded-xl flex items-center px-5 text-orange-300 font-black tracking-widest uppercase">
                  VESPERTINO
                </div>
                <input type="hidden" name="turno" value="vespertino" />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: DATOS PERSONALES (SENSIBLES) */}
          <div className="bg-black/40 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 shadow-2xl relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">
                  fingerprint
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-wider">
                  02. DATOS DEL PERSONAL
                </h2>
                <div className="h-0.5 w-16 bg-emerald-600 rounded-full mt-1"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidoPaterno}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apellidoPaterno: e.target.value,
                    })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Apellido Materno *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidoMaterno}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apellidoMaterno: e.target.value,
                    })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  CURP (18 caracteres) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={18}
                  value={formData.curp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      curp: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-orange-500 focus:outline-none uppercase font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Correo Institucional *
                  <span className="text-orange-500 ml-2">
                    (@aefcm.gob.mx preferente)
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.correoInstitucional}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      correoInstitucional: e.target.value,
                    })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-300 mb-1 block">
                Teléfono Móvil (10 dígitos)
              </label>
              <input
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                value={formData.telefono}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, telefono: val });
                }}
                className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-orange-500 focus:outline-none font-mono tracking-wider"
                placeholder="5512345678"
              />
            </div>

            {/* Banner de privacidad */}
            <div className="bg-orange-900/10 border border-orange-500/20 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-orange-500 text-xl flex-shrink-0">
                lock
              </span>
              <p className="text-sm text-orange-200/90 leading-relaxed font-bold italic">
                Los datos personales se resguardan conforme a la LFPDPPP. En
                pantallas operativas se muestra <strong>matrícula SASE</strong>;
                nombres solo con permisos de Dirección.
              </p>
            </div>
          </div>

          {/* BLOQUE 3: INFORMACIÓN ACADÉMICA (Dinámico por rol) */}
          {(formData.rolesSeleccionados.includes("docente") ||
            formData.rolesSeleccionados.includes("promotoria_lectura")) && (
            <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
                  <span className="material-symbols-outlined text-orange-400">
                    school
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-400">
                    3. Información Académica
                  </h2>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
                    Asignaciones y cobertura
                  </p>
                </div>
              </div>

              {/* Materias */}
              <div className="mb-4">
                <label className="text-sm text-gray-300 mb-3 block">
                  Materias que imparte
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Matemáticas",
                    "Español",
                    "Inglés",
                    "Ciencias I (Bio.)",
                    "Ciencias II (Fís.)",
                    "Ciencias III (Quím.)",
                    "Historia",
                    "Geografía",
                    "Form. Cívica",
                    "Artes",
                    "Tecnología",
                    "Ed. Física",
                  ].map((materia) => (
                    <button
                      key={materia}
                      type="button"
                      onClick={() => handleArrayToggle("materias", materia)}
                      className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                        formData.materias.includes(materia)
                          ? "bg-orange-500/20 border-orange-500 text-orange-300"
                          : "bg-black/20 border-white/10 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      {materia}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grupos */}
              <div className="mb-4">
                <label className="text-sm text-gray-300 mb-3 block">
                  Grupos que atiende
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {[
                    "1A",
                    "1B",
                    "1C",
                    "1D",
                    "2A",
                    "2B",
                    "2C",
                    "2D",
                    "3A",
                    "3B",
                    "3C",
                    "3D",
                  ].map((grupo) => (
                    <button
                      key={grupo}
                      type="button"
                      onClick={() => handleArrayToggle("grupos", grupo)}
                      className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                        formData.grupos.includes(grupo)
                          ? "bg-orange-500/20 border-orange-500 text-orange-300"
                          : "bg-black/20 border-white/10 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      {grupo}
                    </button>
                  ))}
                </div>
              </div>

              {/* ¿Es tutor? */}
              <div className="bg-orange-900/10 border border-orange-500/10 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.esTutor}
                    onChange={(e) =>
                      setFormData({ ...formData, esTutor: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500"
                  />
                  <span className="text-sm font-medium text-orange-300">
                    ¿Es Tutor de Grupo?
                  </span>
                </label>

                {formData.esTutor && (
                  <div className="mt-4 ml-8 animate-fadeIn">
                    <label className="text-xs text-gray-400 mb-2 block">
                      Grupo de tutoría:
                    </label>
                    <select
                      value={formData.grupoTutor}
                      onChange={(e) =>
                        setFormData({ ...formData, grupoTutor: e.target.value })
                      }
                      className="w-full h-11 bg-black/50 border border-orange-400/30 rounded-lg px-3 text-white focus:border-orange-400 focus:outline-none"
                    >
                      <option value="">Seleccione...</option>
                      {[
                        "1A",
                        "1B",
                        "1C",
                        "1D",
                        "2A",
                        "2B",
                        "2C",
                        "2D",
                        "3A",
                        "3B",
                        "3C",
                        "3D",
                      ].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Para otros roles especializados */}
          {(formData.rolesSeleccionados.includes("orientacion") ||
            formData.rolesSeleccionados.includes("trabajo_social") ||
            formData.rolesSeleccionados.includes("enfermeria")) && (
            <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
              <label className="text-sm text-gray-300 mb-2 block">
                Área de cobertura
              </label>
              <input
                type="text"
                value={formData.areaCobertura}
                onChange={(e) =>
                  setFormData({ ...formData, areaCobertura: e.target.value })
                }
                className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Ej. Todos los grados, 1º y 2º, Casos específicos..."
              />
              <p className="text-xs text-purple-400 font-black uppercase mt-2 tracking-widest">
                * Acceso a datos sensibles sujeto a autorización
              </p>
            </div>
          )}

          {/* Observaciones generales */}
          <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-6">
            <label className="text-sm text-gray-300 mb-2 block">
              Observaciones (opcional)
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gray-400 focus:outline-none resize-none h-20 text-sm"
              placeholder="Alguna nota adicional para la Dirección..."
            />
          </div>

          {/* BLOQUE 4: SEGURIDAD Y RESPONSABILIDAD */}
          <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/30">
                <span className="material-symbols-outlined text-red-400">
                  security
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400">
                  4. Seguridad y Responsabilidad
                </h2>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
                  Compromisos institucionales
                </p>
              </div>
            </div>

            {/* Contraseña */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Contraseña de acceso *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">
                  Confirmar contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

            {/* Checkboxes legales */}
            <div className="space-y-4 mb-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={formData.checkPrivacidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      checkPrivacidad: e.target.checked,
                    })
                  }
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-500"
                />
                <span className="text-sm text-gray-300 leading-tight">
                  ☑ Acepto el <strong>Aviso de Privacidad</strong> para el
                  tratamiento de mis datos personales.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={formData.checkEtica}
                  onChange={(e) =>
                    setFormData({ ...formData, checkEtica: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-500"
                />
                <span className="text-sm text-gray-300 leading-tight">
                  ☑ Acepto el <strong>Compromiso Ético</strong> de uso
                  institucional y confidencialidad.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={formData.checkAuditoria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      checkAuditoria: e.target.checked,
                    })
                  }
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-500"
                />
                <span className="text-sm text-gray-300 leading-tight">
                  ☑ Entiendo que mis acciones quedan{" "}
                  <strong>registradas y auditadas</strong> permanentemente.
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-xs text-orange-400 hover:text-orange-300 underline"
            >
              Ver términos completos
            </button>
          </div>

          {/* BLOQUE 5: ENVÍO */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-5 rounded-xl shadow-2xl shadow-purple-900/50 transition-all transform active:scale-[0.99] disabled:opacity-50 flex flex-col items-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando solicitud cifrada...</span>
                </div>
              ) : (
                <>
                  <span className="text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">
                      rocket_launch
                    </span>
                    Enviar Solicitud para Validación Institucional
                  </span>
                  <span className="text-xs opacity-70 group-hover:opacity-100">
                    SASE protege a la comunidad escolar y respalda el trabajo
                    docente
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Cancelar y volver
            </button>
          </div>
        </form>

        {/* Modal de términos */}
        {showTerms && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-white/20 rounded-2xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6">
                Términos y Condiciones
              </h3>

              <div className="space-y-6 text-sm text-gray-300">
                <div>
                  <h4 className="font-bold text-orange-400 mb-2">
                    Aviso de Privacidad
                  </h4>
                  <p className="leading-relaxed">{AVISO_PRIVACIDAD}</p>
                </div>

                <div>
                  <h4 className="font-bold text-orange-400 mb-2">
                    Compromiso Ético
                  </h4>
                  <p className="leading-relaxed">{COMPROMISO_ETICO}</p>
                </div>

                <div>
                  <h4 className="font-bold text-red-400 mb-2">
                    Auditoría y Trazabilidad
                  </h4>
                  <p className="leading-relaxed">{TEXTO_AUDITORIA}</p>
                </div>
              </div>

              <button
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
