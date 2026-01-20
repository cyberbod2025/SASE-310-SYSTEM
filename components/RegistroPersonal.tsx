import React, { useState } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

interface RegistroPersonalProps {
  onBack: () => void;
}

// Textos legales (conservados)
const AVISO_PRIVACIDAD = `SASE-310 recaba datos personales del personal escolar con fines de identificación, control de acceso, asignación de funciones y respaldo institucional. El acceso a datos sensibles está restringido por rol y auditado. Puedes ejercer derechos de rectificación u oposición mediante la Dirección del plantel.`;
const COMPROMISO_ETICO = `Me comprometo a usar SASE-310 únicamente con fines institucionales y educativos; a resguardar la confidencialidad; a no compartir credenciales; y a evitar la difusión indebida de información. Reconozco que el uso inadecuado puede derivar en medidas administrativas conforme a la normativa aplicable.`;
const TEXTO_AUDITORIA = `Todas las acciones relevantes (consulta, registro, edición, desbloqueo de identidad) quedan registradas con fecha, hora y usuario para fines de seguridad y trazabilidad.`;

const AVAILABLE_ROLES = [
  { id: "docente", label: "Docente" },
  { id: "prefectura", label: "Prefectura" },
  { id: "orientacion", label: "Orientación" },
  { id: "trabajo_social", label: "Trabajo Social" },
  { id: "tutor", label: "Tutor Grupo" },
  { id: "subdireccion", label: "Subdirección" },
  { id: "direccion", label: "Dirección" },
  { id: "udeii", label: "UDEII" },
];

export const RegistroPersonal: React.FC<RegistroPersonalProps> = ({
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folioSolicitud, setFolioSolicitud] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    rolesSeleccionados: [] as string[],
    turno: "vespertino",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    correoInstitucional: "",
    telefono: "",
    materias: [] as string[],
    grupos: [] as string[],
    esTutor: false,
    grupoTutor: "",
    areaCobertura: "",
    observaciones: "",
    checkPrivacidad: false,
    checkEtica: false,
    checkAuditoria: false,
    password: "",
    confirmPassword: "",
  });

  // CURP Validation
  const validateCURP = (curp: string) => {
    const regex =
      /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
    return regex.test(curp);
  };

  const handleAddRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rol = e.target.value;
    if (rol && !formData.rolesSeleccionados.includes(rol)) {
      setFormData((prev) => ({
        ...prev,
        rolesSeleccionados: [...prev.rolesSeleccionados, rol],
      }));
    }
    e.target.value = ""; // Reset select
  };

  const handleRemoveRole = (rol: string) => {
    setFormData((prev) => ({
      ...prev,
      rolesSeleccionados: prev.rolesSeleccionados.filter((r) => r !== rol),
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

    if (!validateCURP(formData.curp)) {
      toast.error("El CURP no tiene un formato válido");
      return;
    }

    setLoading(true);

    try {
      const randomNum = Math.floor(Math.random() * 1000);
      const matriculaTemp = `TEMP-${randomNum}`;

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
            folio_solicitud: matriculaTemp,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;

      const folio = `REQ-${new Date().getFullYear()}-${String(randomNum).padStart(4, "0")}`;
      setFolioSolicitud(folio);
      setSuccess(true);

      await supabase.from("audit_log").insert({
        user_email: formData.correoInstitucional,
        action_type: "CREACION",
        action_description: `Solicitud de alta de personal enviada: ${folio}`,
        target_table: "solicitudes_alta_personal",
        target_record_id: data.id,
        new_values: { folio, roles: formData.rolesSeleccionados },
      });
    } catch (error: any) {
      console.error("Error al enviar solicitud:", error);
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
        <div className="w-full max-w-lg bg-[#0f172a] border border-emerald-500/30 rounded-3xl p-10 shadow-2xl relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/40">
              <span className="material-symbols-outlined text-4xl text-emerald-400">
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Solicitud Recibida
            </h2>
            <p className="text-emerald-400 font-mono text-lg mb-8 tracking-wider">
              {folioSolicitud}
            </p>

            <div className="space-y-4 text-left border-l-2 border-emerald-500/20 pl-4 mb-8">
              <p className="text-slate-400 text-sm">
                Tu solicitud pasará al proceso de validación administrativa.
              </p>
              <div className="text-xs text-slate-500 bg-white/5 p-3 rounded-lg">
                <strong className="text-slate-300 block mb-1">
                  Próximos pasos:
                </strong>
                1. Validación de identidad por Dirección.
                <br />
                2. Asignación de credenciales oficiales.
                <br />
                3. Notificación a tu correo institucional.
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium border border-white/5"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative font-sans text-slate-200 bg-[#050505]">
      {/* SOLID DARK BACKGROUND for absolute contrast safety */}
      <div className="fixed inset-0 z-0 bg-[#050505]"></div>

      <div className="relative z-10 max-w-2xl mx-auto py-12 px-6 pb-24">
        {/* Simple Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Alta de Personal
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">
            SASE-310 • Gestión Institucional
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. SELECCIÓN DE ROL */}
          <section className="bg-[#0f121a] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs ring-1 ring-blue-500/40">
                1
              </span>
              <h3 className="text-base font-bold text-white">
                Función Institucional
              </h3>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Seleccionar Función(es)
              </label>
              <div className="relative">
                <select
                  onChange={handleAddRole}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white appearance-none focus:border-blue-500/50 outline-none transition-colors text-sm cursor-pointer"
                >
                  <option value="">+ Agregar rol a la solicitud...</option>
                  {AVAILABLE_ROLES.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                      disabled={formData.rolesSeleccionados.includes(role.id)}
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">
                  expand_more
                </span>
              </div>

              {/* Selected Roles Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.rolesSeleccionados.length === 0 && (
                  <p className="text-xs text-slate-600 italic">
                    No has seleccionado ningún rol.
                  </p>
                )}
                {formData.rolesSeleccionados.map((rolId) => {
                  const rolLabel =
                    AVAILABLE_ROLES.find((r) => r.id === rolId)?.label || rolId;
                  return (
                    <div
                      key={rolId}
                      className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-full px-3 py-1 text-blue-200 text-xs font-medium animate-fadeIn"
                    >
                      <span>{rolLabel}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(rolId)}
                        className="hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2. DATOS GENERALES */}
          <section className="bg-[#0f121a] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs ring-1 ring-orange-500/40">
                2
              </span>
              <h3 className="text-base font-bold text-white">Identificación</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Nombre(s)
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Apellido Paterno
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
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Apellido Materno
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
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  CURP
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
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none transition-colors text-sm font-mono uppercase"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Correo Institucional
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
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none transition-colors text-sm"
                  placeholder="usuario@aefcm.gob.mx"
                />
              </div>
            </div>
          </section>

          {/* 3. SEGURIDAD */}
          <section className="bg-[#0f121a] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold text-xs ring-1 ring-red-500/40">
                3
              </span>
              <h3 className="text-base font-bold text-white">Acceso</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-red-500/50 outline-none transition-colors text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Confirmar
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
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-red-500/50 outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 space-y-3 border border-white/5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Compromisos
              </p>

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
                  className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-500"
                />
                <div className="text-xs text-slate-400">
                  Acepto el{" "}
                  <span className="font-bold text-slate-300">
                    Aviso de Privacidad
                  </span>
                  .
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={formData.checkEtica}
                  onChange={(e) =>
                    setFormData({ ...formData, checkEtica: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-500"
                />
                <div className="text-xs text-slate-400">
                  Acepto el{" "}
                  <span className="font-bold text-slate-300">
                    Compromiso Ético
                  </span>
                  .
                </div>
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
                  className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-500"
                />
                <div className="text-xs text-slate-400">
                  Acepto la{" "}
                  <span className="font-bold text-slate-300">
                    Auditoría de Acciones
                  </span>
                  .
                </div>
              </label>

              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[10px] text-blue-400/70 hover:text-blue-400 underline mt-1 block"
              >
                Ver términos legales completos
              </button>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="pt-2 flex flex-col gap-3 pb-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                "Enviar Solicitud"
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-slate-600 text-xs font-bold hover:text-slate-400 transition-colors uppercase tracking-widest"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Legal Modal */}
        {showTerms && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowTerms(false)}
          >
            <div
              className="bg-[#0f121a] border border-white/10 rounded-2xl p-8 max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-6">
                Marco Legal Institucional
              </h3>
              <div className="space-y-6 text-sm text-slate-400 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <strong className="text-slate-200 block mb-1">
                    Privacidad
                  </strong>
                  {AVISO_PRIVACIDAD}
                </div>
                <div>
                  <strong className="text-slate-200 block mb-1">Ética</strong>
                  {COMPROMISO_ETICO}
                </div>
                <div>
                  <strong className="text-slate-200 block mb-1">
                    Auditoría
                  </strong>
                  {TEXTO_AUDITORIA}
                </div>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
