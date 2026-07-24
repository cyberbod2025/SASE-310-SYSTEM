import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cleanCURP } from "../utils/stringUtils";
import {
  submitStaffAccessRequest,
  verifyOfficialStaff,
} from "./personal/registroPersonalPersistence";

interface RegistroPersonalProps {
  onBack: () => void;
}

const AVAILABLE_ROLES = [
  { id: "docente", label: "Docente", icon: "school", color: "bg-blue-600" },
  {
    id: "prefectura",
    label: "Prefectura",
    icon: "local_police",
    color: "bg-orange-500",
  },
  {
    id: "orientacion",
    label: "Orientación",
    icon: "psychology",
    color: "bg-emerald-600",
  },
  {
    id: "trabajo_social",
    label: "Trabajo Social",
    icon: "groups",
    color: "bg-indigo-600",
  },
  {
    id: "secretaria",
    label: "Secretaría",
    icon: "description",
    color: "bg-slate-600",
  },
  {
    id: "medico_escolar",
    label: "Enfermería",
    icon: "medical_services",
    color: "bg-red-600",
  },
  { id: "udeii", label: "UDEII", icon: "diversity_3", color: "bg-teal-600" },
  {
    id: "directivo",
    label: "Dirección",
    icon: "admin_panel_settings",
    color: "bg-slate-900",
  },
  {
    id: "subdireccion",
    label: "Subdirección",
    icon: "supervisor_account",
    color: "bg-slate-700",
  },
  {
    id: "promotora_lectura",
    label: "Promotoría de lectura",
    icon: "local_library",
    color: "bg-violet-600",
  },
];

const AVISO_PRIVACIDAD_TEXTO = `
  AVISO DE PRIVACIDAD SIMPLIFICADO - SASE-310

  La ESCUELA SECUNDARIA DIURNA No 310 "PRESIDENTES DE MEXICO" TURNO VESPERTINO, con CCT 09DES4310M y domicilio en CALLE JAIME NUÑO S/N, COL. PRESIDENTES DE MÉXICO, ALCALDÍA IZTAPALAPA, CDMX, es la responsable del tratamiento de los datos personales que nos proporcione.

  Los datos que se recaben (Nombre, CURP, Correo Institucional, Función Escolar, CCT y Turno) serán utilizados exclusivamente para:
  1. Verificar la adscripción en la nómina oficial.
  2. Tramitar y resolver la solicitud de acceso institucional.
  3. Conservar trazabilidad de la solicitud y, si se aprueba, asignar los permisos correspondientes.

  Este formulario no solicita contraseñas ni respuestas de recuperación. El envío de la solicitud no autoriza el acceso ni activa credenciales.

  Usted podrá ejercer sus derechos ARCO directamente ante la dirección del plantel.
  Al marcar la casilla, usted manifiesta su consentimiento expreso para el tratamiento de sus datos bajo los lineamientos de la NEM.
`;

/* --- REUSABLE COMPONENTS (MOVED TO TOP) --- */

const InputGroupSase = ({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  title = "",
  isMono = false,
  readonly = false,
  autoComplete = "off",
  onKeyDown,
  rightElement,
}: any) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1"
    >
      {label}
    </label>
    <div className="relative group">
      <input
        id={id}
        name={name}
        type={type}
        required
        value={value}
        readOnly={readonly}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        title={title || label}
        className={`
          w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
          text-white text-sm font-medium outline-none transition-all
          focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20
          placeholder:text-slate-500 uppercase
          ${isMono ? "font-mono tracking-widest" : ""}
          ${readonly ? "cursor-not-allowed opacity-60 bg-white/[0.02]" : ""}
          ${rightElement ? "pr-10" : ""}
        `}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-400 transition-colors">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

const CheckboxSase = ({ id, label, checked, onChange, onRead }: any) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center gap-4 group/box select-none outline-none">
      <div
        className="flex items-center gap-4 cursor-pointer outline-none flex-1 focus:ring-2 focus:ring-blue-500/20 rounded-lg p-1 -ml-1"
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        role="checkbox"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        tabIndex={0}
      >
        <div
          className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
            checked
              ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "border-white/10 group-hover/box:border-white/30 bg-white/5 group-focus-visible:border-blue-500/50"
          }`}
        >
          {checked && (
            <span className="material-symbols-outlined text-white text-[14px] font-black">
              check
            </span>
          )}
        </div>
        <span
          id={`${id}-label`}
          className={`flex-1 text-[11px] font-bold uppercase tracking-tight transition-colors ${checked ? "text-white" : "text-slate-400 group-hover/box:text-slate-300"}`}
        >
          {label}
        </span>
      </div>
      {onRead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRead();
          }}
          className="text-[9px] font-black text-blue-400 hover:text-white uppercase tracking-widest ml-4 transition-colors hover:underline"
          title={`Ver información sobre: ${label}`}
          aria-label={`Ver información detallada sobre ${label}`}
        >
          Info
        </button>
      )}
    </div>
  );
};

export const RegistroPersonal: React.FC<RegistroPersonalProps> = ({
  onBack,
}) => {
  // Step 0: Name, 1: Role, 2: Epic Welcome, 3: Form
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folioSolicitud, setFolioSolicitud] = useState("");
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Form Data
  const [formData, setFormData] = React.useState({
    rol: "",
    turno: "vespertino",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    cct: "09DES4310M",
    correoInstitucional: "",
    checkPrivacidad: false,
    checkEtica: false,
    checkAuditoria: false,
  });

  const selectedRoleData = AVAILABLE_ROLES.find((r) => r.id === formData.rol);

  const validateCURP = (curp: string) => {
    const regex = /^[A-Z]{4}[0-9]{6}[HM]{1}[A-Z]{5}[0-9A-Z]{1}[0-9]{1}$/;
    return regex.test(curp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rol)
      return toast.error("Seleccione su función institucional");
    if (
      !formData.checkPrivacidad ||
      !formData.checkEtica ||
      !formData.checkAuditoria
    )
      return toast.error("Debe aceptar todos los términos y avisos");
    if (!validateCURP(formData.curp))
      return toast.error("El formato de CURP no es válido");

    let verifiedRole: string | null = null;
    try {
      const verification = await verifyOfficialStaff(
        `${formData.nombres} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`,
        `${formData.apellidoPaterno} ${formData.apellidoMaterno} ${formData.nombres}`,
      );
      if (!verification.match) {
        return toast.error(
          "Su nombre no coincide con la nómina oficial del plantel 310. Verifique sus apellidos o acuda a Dirección.",
        );
      }

      verifiedRole = verification.role;
      if (verifiedRole !== formData.rol) {
        return toast.error(
          "La función seleccionada no coincide con la nómina oficial. Corrija la selección o acuda a Dirección.",
        );
      }
    } catch (error) {
      console.error(error);
      return toast.error(
        error instanceof Error
          ? error.message
          : "Error al validar la nómina oficial",
      );
    }

    setLoading(true);
    try {
      if (!verifiedRole) {
        throw new Error("La función institucional no pudo verificarse.");
      }

      const { folio } = await submitStaffAccessRequest(
        {
          rolDeclarado: formData.rol,
          turno: formData.turno,
          nombres: formData.nombres,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          curp: formData.curp,
          correoInstitucional: formData.correoInstitucional,
          cct: formData.cct,
          aceptaPrivacidad: formData.checkPrivacidad,
          aceptaEtica: formData.checkEtica,
          aceptaAuditoria: formData.checkAuditoria,
        },
      );
      setFolioSolicitud(folio);
      setSuccess(true);
      toast.success("Solicitud enviada correctamente");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar su solicitud",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- WIZARD STEPS ---

  /* STEP 0: ¿Cuál es tu nombre? */
  if (step === 0) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020408] overflow-hidden font-sans">
        {/* IMMERSIVE BACKGROUND SYSTEM (SYNCED WITH LOGIN) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#020408]"></div>
          <motion.div
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -150, 50, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -left-20 size-[500px] bg-blue-600/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -80, 120, 0],
              y: [0, 100, -100, 0],
              scale: [1, 0.8, 1.1, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 size-[600px] bg-indigo-600/10 rounded-full blur-[140px]"
          />
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent"></div>
        </div>

        <div className="w-full max-w-lg space-y-8 animate-fade-in-up relative z-10 p-8">
          {/* LOGO / BRANDING */}
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <span className="material-symbols-outlined text-4xl text-white">
                school
              </span>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]">
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-5xl font-black text-white tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50">
                ¡Hola!{" "}
                <span className="animate-wave inline-block origin-bottom-right">
                  👋
                </span>
              </h1>
              <p className="text-blue-200/80 font-medium text-lg tracking-wide">
                Bienvenido al{" "}
                <span className="text-white font-bold">
                  Portal de Acceso SASE 310
                </span>
              </p>
            </div>
            <div className="space-y-4 animate-fade-in-up delay-300">
              <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest pl-1">
                ¿Cómo te llamas? (Solo nombre de pila)
              </label>
              <input
                type="text"
                autoFocus
                title="Ingrese su nombre de pila"
                className="w-full bg-slate-900 border border-slate-700 text-white text-2xl font-bold rounded-2xl p-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 placeholder:font-normal"
                placeholder="Ej. Miguel, Luis, Hugo..."
                value={formData.nombres}
                onChange={(e) =>
                  setFormData({ ...formData, nombres: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.nombres.trim().length > 0) {
                    setStep(1);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                // onClick to cancel registration flow if user clicked by mistake
                onClick={onBack}
                className="px-6 py-4 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={formData.nombres.trim().length === 0}
                onClick={() => setStep(1)}
                className="btn-liquid w-auto min-w-[200px]"
              >
                <div className="btn-liquid-glass"></div>
                <div className="btn-liquid-inner gap-3">
                  Continuar{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* STEP 1: ¿Cuál es tu rol? */
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-[#020408]">
        {/* IMMERSIVE BACKGROUND SYSTEM (SYNCED WITH LOGIN) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#020408]"></div>
          <motion.div
            animate={{
              x: [0, 80, -30, 0],
              y: [0, -100, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-0 size-[400px] bg-blue-600/10 rounded-full blur-[100px]"
          />
          <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:60px_60px]"></div>
        </div>

        <div className="w-full max-w-4xl space-y-8 animate-fade-in-up relative z-10 p-4">
          <div className="text-center space-y-2 mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight animate-slide-up">
              Mucho gusto,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 capitalize">
                {formData.nombres}
              </span>
              .
            </h1>
            <p className="text-slate-400 font-medium text-xl animate-fade-in delay-200">
              ¿Cuál es tu función en el plantel?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVAILABLE_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setFormData({ ...formData, rol: role.id })}
                className={`
                  group relative overflow-hidden rounded-3xl p-6 transition-all duration-300
                  ${
                    formData.rol === role.id
                      ? "ring-2 ring-blue-500 scale-105 bg-white/10"
                      : "bg-white/5 hover:bg-white/10 hover:scale-[1.02]"
                  }
                  border border-white/5 backdrop-blur-md
                `}
              >
                <div
                  className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                  ${formData.rol === role.id ? role.color : "bg-white/10 text-white/50"}
                `}
                >
                  <span className="material-symbols-outlined text-3xl text-white">
                    {role.icon}
                  </span>
                </div>
                <div className="text-left">
                  <h3
                    className={`text-sm font-black uppercase tracking-wider ${formData.rol === role.id ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                  >
                    {role.label}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center mt-12 gap-6">
            <button
              // onClick to go back to previous step
              onClick={() => setStep(0)}
              className="px-6 py-4 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
            >
              Atrás
            </button>
            <button
              disabled={!formData.rol}
              onClick={() => setStep(2)}
              className="btn-liquid w-auto min-w-[200px]"
            >
              <div className="btn-liquid-glass"></div>
              <div className="btn-liquid-inner gap-3">
                Siguiente{" "}
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* STEP 2: The EPIC Reveal */
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans text-center p-4 bg-[#020408]">
        {/* IMMERSIVE BACKGROUND SYSTEM (REVEAL MODE) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#020408]"></div>
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-blue-500/20 rounded-full blur-[160px]"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-[0.05] animate-spin-slow [background-image:conic-gradient(from_0deg,transparent,white,transparent)]"></div>
        </div>

        <div className="relative z-10 max-w-2xl animate-scale-in">
          <div className="mb-8 inline-block p-6 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.3)] animate-float">
            <span className="material-symbols-outlined text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              {selectedRoleData?.icon}
            </span>
          </div>

          <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-none">
            <span className="block text-xl md:text-3xl font-bold text-blue-400 tracking-[0.2em] md:tracking-[0.3em] mb-4 uppercase opacity-80">
              Bienvenido
            </span>
            {selectedRoleData?.label}
          </h2>

          <p className="text-lg md:text-2xl text-slate-300 font-medium max-w-xl mx-auto leading-relaxed mb-12">
            Primero verificaremos tu adscripción y enviaremos la solicitud.
            <br />
            <span className="text-blue-400 font-bold">
              El acceso se habilita únicamente después de la aprobación.
            </span>
          </p>

          <div className="pt-8 flex justify-center w-full px-4">
            <button
              onClick={() => setStep(3)}
              className="btn-liquid w-full md:w-auto md:min-w-[350px]"
            >
              <div className="btn-liquid-glass"></div>
              <div className="btn-liquid-inner gap-4 text-xs md:text-sm">
                <span>Continuar con la solicitud</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </button>
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Solicitud sujeta a validación • SASE 310
          </p>
        </div>
      </div>
    );
  }

  /* STEP 3: FORMULARIO EXISTENTE (INTEGRADO) */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0e14] font-['Inter',sans-serif]">
        <div className="w-full max-w-lg card-sase text-center relative overflow-hidden group animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-50"></div>

          <div className="relative mb-10">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <div className="size-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 relative z-10 transition-transform group-hover:scale-110 duration-700">
              <span className="material-symbols-outlined text-5xl text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                verified
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
            Solicitud <span className="text-emerald-500">Enviada</span>
          </h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
            Dirección revisará la información y, si procede, enviará una
            invitación al correo institucional. Este folio no constituye una
            autorización de acceso.
          </p>

          <div className="bg-white/[0.03] border border-white/5 rounded-3xl py-8 px-6 mb-12 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/60 mb-3">
              Folio de solicitud SASE
            </p>
            <div className="inline-block font-mono text-3xl text-white font-black tracking-[0.3em] bg-blue-500/5 px-8 py-4 rounded-2xl border border-blue-500/10">
              {folioSolicitud}
            </div>
          </div>

          <button onClick={onBack} className="btn-liquid">
            <div className="btn-liquid-glass"></div>
            <div className="btn-liquid-inner">Regresar al Portal</div>
          </button>
        </div>
      </div>
    );
  }

  /* STEP 3: The Form */
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 font-sans relative bg-[#020408]">
      {/* BACKGROUND: Tactical Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#0f172a_0%,#020408_100%)]"></div>
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* LEFT PANEL: Context & Info */}
      <div className="hidden lg:flex lg:col-span-4 bg-[#0b0e14]/60 backdrop-blur-2xl border-r border-white/5 p-12 flex-col justify-between relative z-10 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-20%] w-full h-1/2 bg-blue-500/10 blur-[120px] pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-4 mb-20">
            <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
              <img
                src="/assets/branding/SASE.png"
                alt="SASE"
                className="h-8 brightness-0 invert opacity-80 relative z-10"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic">
                SASE <span className="text-blue-500 font-black italic">IA</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  Módulo de Alistamiento
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="animate-slide-right">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">
                Rol Seleccionado
              </p>
              <h2 className="text-5xl font-black text-white uppercase leading-none tracking-tighter mb-4">
                {selectedRoleData?.label}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Esta solicitud recaba únicamente los datos necesarios para
                verificar la adscripción y tramitar un posible acceso.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5">
              <h3 className="text-sm font-black text-white uppercase mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">
                  security
                </span>
                Protocolo de Seguridad
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El registro no solicita contraseñas ni respuestas de
                    recuperación.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dirección revisa y resuelve cada solicitud.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Toda aprobación queda registrada en la auditoría
                    institucional.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          ID DE SESIÓN: {new Date().getTime().toString(36).toUpperCase()}
        </div>
      </div>

      {/* RIGHT PANEL: The Form */}
      <div className="col-span-1 lg:col-span-8 p-6 lg:p-12 overflow-y-auto z-10 relative">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="flex justify-between items-center lg:hidden">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">
                school
              </span>
              <span className="text-white font-bold italic tracking-widest">
                SASE NUCLEUS
              </span>
            </div>
          </div>

          <button onClick={onBack} className="btn-liquid w-auto">
            <div className="btn-liquid-glass"></div>
            <div className="btn-liquid-inner w-auto px-6">
              Regresar al Portal
            </div>
          </button>

          {/* New Portal Form Container */}
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                Solicitud de Alta Personal
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                Captura los datos mínimos para que Dirección valide tu
                adscripción. No se crearán credenciales en este paso.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION: Personal Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <span className="w-8 h-[2px] bg-blue-500"></span>
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">
                    01. DATOS DE IDENTIDAD
                  </h3>
                  <span className="flex-1 h-[1px] bg-white/10"></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroupSase
                    id="reg-nombres"
                    name="nombres"
                    label="Nombre(s)"
                    title="Ingrese sus nombres oficiales"
                    value={formData.nombres}
                    onChange={(v: string) =>
                      setFormData({ ...formData, nombres: v.toUpperCase() })
                    }
                  />
                  <InputGroupSase
                    id="reg-paterno"
                    name="apellidoPaterno"
                    label="Apellido Paterno"
                    title="Ingrese su primer apellido"
                    value={formData.apellidoPaterno}
                    onChange={(v: string) =>
                      setFormData({
                        ...formData,
                        apellidoPaterno: v.toUpperCase(),
                      })
                    }
                  />
                  <InputGroupSase
                    id="reg-materno"
                    name="apellidoMaterno"
                    label="Apellido Materno"
                    title="Ingrese su segundo apellido"
                    value={formData.apellidoMaterno}
                    onChange={(v: string) =>
                      setFormData({
                        ...formData,
                        apellidoMaterno: v.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="space-y-6 mt-6">
                  <InputGroupSase
                    id="reg-curp"
                    name="curp"
                    label="CLAVE UNICA DE REGISTRO DE POBLACION CURP"
                    placeholder="18 Caracteres"
                    title="Ingrese su CURP de 18 caracteres"
                    isMono
                    value={formData.curp}
                    onChange={(v: string) => {
                      const cleaned = cleanCURP(v);
                      setFormData({ ...formData, curp: cleaned });
                      if (cleaned.length === 18) {
                        setTimeout(() => {
                          const nextInput =
                            document.getElementById("reg-correo");
                          if (nextInput)
                            (nextInput as HTMLInputElement).focus();
                        }, 100);
                      }
                    }}
                  />
                </div>
              </div>

              {/* SECTION: School Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <span className="w-8 h-[2px] bg-emerald-500"></span>
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                    Adscripción
                  </h3>
                  <span className="flex-1 h-[1px] bg-white/10"></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroupSase
                    id="reg-cct"
                    name="cct"
                    label="Clave de Centro de Trabajo (CCT)"
                    readonly
                    value={formData.cct}
                    onChange={() => {}}
                  />
                  <InputGroupSase
                    id="reg-correo"
                    name="correoInstitucional"
                    label="Correo Institucional"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre.apellido@sase.mx"
                    title="Ingrese su correo institucional @sase.mx"
                    value={formData.correoInstitucional}
                    onChange={(v: string) =>
                      setFormData({
                        ...formData,
                        correoInstitucional: v.toLowerCase(),
                      })
                    }
                  />
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">
                      Turno
                    </label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all uppercase appearance-none"
                      value={formData.turno}
                      title="Seleccionar turno de adscripción"
                      aria-label="Seleccionar turno de adscripción"
                      onChange={(e) =>
                        setFormData({ ...formData, turno: e.target.value })
                      }
                    >
                      <option value="matutino" className="bg-slate-800">
                        Matutino
                      </option>
                      <option value="vespertino" className="bg-slate-800">
                        Vespertino
                      </option>
                      <option value="mixto" className="bg-slate-800">
                        Mixto / Ambos
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <CheckboxSase
                  id="check1"
                  label="He leído el Aviso de Privacidad Simplificado"
                  checked={formData.checkPrivacidad}
                  onChange={(v: boolean) =>
                    setFormData({ ...formData, checkPrivacidad: v })
                  }
                  onRead={() => setShowPrivacyNotice(!showPrivacyNotice)}
                />

                <div
                  className={`overflow-hidden transition-all duration-700 ${showPrivacyNotice ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-[10px] text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                    {AVISO_PRIVACIDAD_TEXTO}
                  </div>
                </div>

                <CheckboxSase
                  id="check2"
                  label="Acepto el Código de Ética de la Función Pública"
                  checked={formData.checkEtica}
                  onChange={(v: boolean) =>
                    setFormData({ ...formData, checkEtica: v })
                  }
                />
                <CheckboxSase
                  id="check3"
                  label="Consiento el registro institucional de mis accesos"
                  checked={formData.checkAuditoria}
                  onChange={(v: boolean) =>
                    setFormData({ ...formData, checkAuditoria: v })
                  }
                />
              </div>

              <div className="pt-8 flex flex-col md:flex-row items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-liquid w-full md:w-auto min-w-[320px] disabled:opacity-50 disabled:grayscale"
                >
                  <div className="btn-liquid-glass"></div>
                  <div className="btn-liquid-inner gap-4">
                    {loading ? (
                      <>
                        <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Solicitud</span>
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                          send
                        </span>
                      </>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors px-6 py-4"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
