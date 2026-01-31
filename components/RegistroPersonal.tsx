import React, { useState } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

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
    id: "enfermeria",
    label: "Enfermería",
    icon: "medical_services",
    color: "bg-red-600",
  },
  { id: "udeii", label: "UDEII", icon: "diversity_3", color: "bg-teal-600" },
  {
    id: "direccion",
    label: "Dirección",
    icon: "admin_panel_settings",
    color: "bg-slate-900",
  },
];

const AVISO_PRIVACIDAD_TEXTO = `
  AVISO DE PRIVACIDAD SIMPLIFICADO - SASE-310
  
  La ESCUELA SECUNDARIA DIURNA No 310 "PRESIDENTES DE MEXICO" TURNO VESPERTINO, con CCT 09DES4310M y domicilio en CALLE JAIME NUÑO S/N, COL. PRESIDENTES DE MÉXICO, ALCALDÍA IZTAPALAPA, CDMX, es la responsable del tratamiento de los datos personales que nos proporcione.
  
  Los datos que se recaben (Nombre, CURP, Correo Institucional, Función Escolar) serán utilizados exclusivamente para:
  1. Identificación y autenticación en la plataforma institucional.
  2. Control de acceso y asignación de privilegios según su función.
  3. Auditoría de acciones en el sistema para garantizar la seguridad de la información institucional y la protección del alumnado.
  
  Usted podrá ejercer sus derechos ARCO directamente ante la dirección del plantel.
  Al marcar la casilla, usted manifiesta su consentimiento expreso para el tratamiento de sus datos bajo los lineamientos de la NEM.
`;

export const RegistroPersonal: React.FC<RegistroPersonalProps> = ({
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folioSolicitud, setFolioSolicitud] = useState("");
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  const [formData, setFormData] = useState({
    rol: "",
    turno: "vespertino",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    cct: "09DES4310M",
    correoInstitucional: "",
    password: "",
    confirmPassword: "",
    checkPrivacidad: false,
    checkEtica: false,
    checkAuditoria: false,
  });

  const validateCURP = (curp: string) => {
    const regex =
      /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
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
    if (formData.password !== formData.confirmPassword)
      return toast.error("Las contraseñas no coinciden");
    if (!validateCURP(formData.curp))
      return toast.error("El formato de CURP no es válido");

    setLoading(true);
    try {
      const randomNum = Math.floor(Math.random() * 1000);
      const folio = `REQ-${new Date().getFullYear()}-${String(randomNum).padStart(4, "0")}`;

      const { error } = await supabase
        .from("solicitudes_alta_personal")
        .insert({
          rol_solicitado: [formData.rol],
          turno: formData.turno,
          nombres: formData.nombres.toUpperCase(),
          apellido_paterno: formData.apellidoPaterno.toUpperCase(),
          apellido_materno: formData.apellidoMaterno.toUpperCase(),
          curp: formData.curp.toUpperCase(),
          correo_institucional: formData.correoInstitucional,
          acepta_privacidad: formData.checkPrivacidad,
          acepta_etica: formData.checkEtica,
          acepta_auditoria: formData.checkAuditoria,
          estado: "PENDIENTE",
          metadata: {
            folio_solicitud: folio,
            cct: formData.cct,
          },
        });

      if (error) throw error;
      setFolioSolicitud(folio);
      setSuccess(true);
      toast.success("Solicitud enviada correctamente");
    } catch (error: any) {
      console.error(error);
      toast.error("Error al procesar su solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0b0e14] font-['Inter',sans-serif]">
        <div className="w-full max-w-lg card-sase text-center relative overflow-hidden group">
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
            Solicitud <span className="text-emerald-500">Procesada</span>
          </h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
            Su registro ha sido encriptado y enviado a la coordinación. Presente
            su folio para la validación de identidad presencial.
          </p>

          <div className="bg-white/[0.03] border border-white/5 rounded-3xl py-8 px-6 mb-12 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/60 mb-3">
              Folio S.A.S.E. v3.10.0
            </p>
            <div className="inline-block font-mono text-3xl text-white font-black tracking-[0.3em] bg-blue-500/5 px-8 py-4 rounded-2xl border border-blue-500/10">
              {folioSolicitud}
            </div>
          </div>

          <button onClick={onBack} className="btn-sase-primary w-full">
            Regresar al Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0e14] text-slate-400 overflow-y-auto pb-24 font-['Inter',sans-serif] selection:bg-blue-500/30 custom-scrollbar">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] rounded-full blur-[200px]"></div>
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-600/[0.03] rounded-full blur-[200px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 animate-fade-in">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-slate-600 hover:text-white mb-12 transition-all text-[10px] font-black uppercase tracking-[0.5em]"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Portal de Identificación
        </button>

        <header className="mb-20 text-center md:text-left flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
          <div>
            <img
              src="/assets/branding/SASE.png"
              alt="SASE"
              className="w-48 mb-10 mx-auto md:mx-0 drop-shadow-2xl opacity-80"
            />
            <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
              Apertura de{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Expediente
              </span>
            </h1>
            <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] pl-1">
              Protocolo de Registro de Personal • ESD 310
            </p>
          </div>
          <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl backdrop-blur-md hidden md:block">
            <div className="flex items-center gap-3">
              <div className="status-glow-blue"></div>
              <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest">
                Canal Seguro Activo
              </span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* ROL SELECTION */}
          <div className="card-sase relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 group-hover:opacity-100 transition-opacity"></div>

            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-6">
              <span className="material-symbols-outlined text-blue-500">
                verified_user
              </span>
              01. Misión Institucional
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {AVAILABLE_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, rol: role.id })}
                  className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/btn ${
                    formData.rol === role.id
                      ? "bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.03]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-4xl mb-4 transition-transform duration-500 ${
                      formData.rol === role.id
                        ? "text-blue-400 scale-110"
                        : "text-slate-700 group-hover/btn:scale-110"
                    }`}
                  >
                    {role.icon}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.15em] text-center leading-tight transition-colors ${
                      formData.rol === role.id
                        ? "text-white"
                        : "text-slate-500 group-hover/btn:text-slate-300"
                    }`}
                  >
                    {role.label}
                  </span>
                  {formData.rol === role.id && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* IDENTIDAD */}
            <div className="card-sase space-y-10 group">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-6">
                <span className="material-symbols-outlined text-blue-500">
                  person
                </span>
                02. Datos de Identidad
              </h3>

              <div className="space-y-6">
                <InputGroupSase
                  id="reg-nombres"
                  name="given-name"
                  label="Nombre(s)"
                  value={formData.nombres}
                  placeholder="SEGÚN IDENTIFICACIÓN OFICIAL"
                  autoComplete="given-name"
                  onChange={(v: string) =>
                    setFormData({ ...formData, nombres: v.toUpperCase() })
                  }
                />
                <div className="grid grid-cols-2 gap-6">
                  <InputGroupSase
                    id="reg-paterno"
                    name="family-name"
                    label="Paterno"
                    value={formData.apellidoPaterno}
                    autoComplete="family-name"
                    onChange={(v: string) =>
                      setFormData({
                        ...formData,
                        apellidoPaterno: v.toUpperCase(),
                      })
                    }
                  />
                  <InputGroupSase
                    id="reg-materno"
                    name="additional-name"
                    label="Materno"
                    value={formData.apellidoMaterno}
                    autoComplete="additional-name"
                    onChange={(v: string) =>
                      setFormData({
                        ...formData,
                        apellidoMaterno: v.toUpperCase(),
                      })
                    }
                  />
                </div>
                <InputGroupSase
                  id="reg-curp"
                  name="curp"
                  label="CURP Institucional"
                  value={formData.curp}
                  isMono
                  placeholder="18 CARACTERES ALFANUMÉRICOS"
                  onChange={(v: string) =>
                    setFormData({ ...formData, curp: v.toUpperCase() })
                  }
                />
              </div>
            </div>

            {/* SECTOR ESCOLAR */}
            <div className="card-sase space-y-10 group">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-6">
                <span className="material-symbols-outlined text-purple-500">
                  hub
                </span>
                03. Sectorización
              </h3>

              <div className="space-y-6">
                <InputGroupSase
                  id="reg-cct"
                  name="organization"
                  label="Clave CCT (ESD-310)"
                  value={formData.cct}
                  isMono
                  readOnly
                  onChange={() => {}} // Bloqueado
                />

                <div className="space-y-2">
                  <label
                    htmlFor="reg-turno"
                    className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1"
                  >
                    Jornada Laboral
                  </label>
                  <select
                    id="reg-turno"
                    name="turno"
                    value={formData.turno}
                    disabled
                    onChange={() => {}}
                    className="input-sase appearance-none cursor-not-allowed opacity-60"
                  >
                    <option value="vespertino" className="bg-[#0b0e14]">
                      Turno Vespertino
                    </option>
                  </select>
                </div>

                <div className="pt-4 space-y-2">
                  <label
                    htmlFor="reg-correo"
                    className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest pl-1"
                  >
                    Correo Institucional (AEFCM)
                  </label>
                  <input
                    id="reg-correo"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.correoInstitucional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correoInstitucional: e.target.value,
                      })
                    }
                    className="input-sase"
                    placeholder="ejemplo@aefcm.gob.mx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CREDENCIALES Y TERMINOS */}
          <div className="card-sase relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-6">
              <span className="material-symbols-outlined text-rose-500">
                lock
              </span>
              04. Protocolo de Seguridad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroupSase
                    id="reg-password"
                    name="new-password"
                    label="Nueva Clave"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(v: string) =>
                      setFormData({ ...formData, password: v })
                    }
                  />
                  <InputGroupSase
                    id="reg-confirm-password"
                    name="confirm-password"
                    label="Revalidar"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(v: string) =>
                      setFormData({ ...formData, confirmPassword: v })
                    }
                  />
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
                    Su clave debe ser confidencial y personal. SASE nunca le
                    solicitará esta clave por correo.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <CheckboxSase
                  id="check1"
                  label="Declaro conocer el Aviso de Privacidad Institucional"
                  checked={formData.checkPrivacidad}
                  onChange={(v: boolean) =>
                    setFormData({ ...formData, checkPrivacidad: v })
                  }
                  onRead={() => setShowPrivacyNotice(!showPrivacyNotice)}
                />
                <CheckboxSase
                  id="check2"
                  label="Acepto lineamientos éticos de la Nueva Escuela Mexicana"
                  checked={formData.checkEtica}
                  onChange={(v: boolean) =>
                    setFormData({ ...formData, checkEtica: v })
                  }
                />
                <CheckboxSase
                  id="check3"
                  label="Consiento la auditoría sistemática de mis accesos"
                  checked={formData.checkAuditoria}
                  onChange={(v: boolean) =>
                    setFormData({ ...formData, checkAuditoria: v })
                  }
                />
              </div>
            </div>

            <div
              className={`mt-8 overflow-hidden transition-all duration-700 ${showPrivacyNotice ? "max-h-96" : "max-h-0"}`}
            >
              <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-[10px] text-slate-500 font-medium leading-relaxed whitespace-pre-wrap selection:bg-blue-500/20">
                {AVISO_PRIVACIDAD_TEXTO}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 pt-10">
            <button
              type="submit"
              disabled={loading}
              className="btn-sase-primary w-full md:w-auto min-w-[320px] flex items-center justify-center gap-4 group disabled:opacity-30 disabled:grayscale transition-all"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Encriptando Información...</span>
                </>
              ) : (
                <>
                  <span>Enviar Expediente SASE</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    send
                  </span>
                </>
              )}
            </button>
            <button type="button" onClick={onBack} className="btn-sase-glass">
              Cancelar Proceso
            </button>
          </div>
        </form>

        {/* Audit footer */}
        <div className="mt-20 text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em]">
            Secure Protocol v3.10.0 • Institutional Integrity
          </p>
        </div>
      </div>
    </div>
  );
};

/* REUSABLE MINI COMPONENTS */

const InputGroupSase = ({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  isMono = false,
  readonly = false,
  autoComplete = "off",
}: any) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1"
    >
      {label}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      required
      value={value}
      readOnly={readonly}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input-sase ${isMono ? "font-mono tracking-widest text-[13px]" : ""} ${readonly ? "cursor-not-allowed opacity-60" : ""}`}
    />
  </div>
);

const CheckboxSase = ({ id, label, checked, onChange, onRead }: any) => (
  <div
    className="flex items-center gap-4 group/box cursor-pointer select-none"
    onClick={() => onChange(!checked)}
  >
    <div
      className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
        checked
          ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          : "border-white/10 group-hover/box:border-white/20"
      }`}
    >
      {checked && (
        <span className="material-symbols-outlined text-white text-[14px] font-black">
          check
        </span>
      )}
    </div>
    <div className="flex-1 flex items-center justify-between">
      <span
        className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${checked ? "text-white" : "text-slate-500 group-hover/box:text-slate-400"}`}
      >
        {label}
      </span>
      {onRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRead();
          }}
          className="text-[9px] font-black text-blue-500 hover:text-white uppercase tracking-widest ml-4 transition-colors"
        >
          Info
        </button>
      )}
    </div>
  </div>
);
