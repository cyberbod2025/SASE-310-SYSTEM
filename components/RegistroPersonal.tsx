import React, { useState } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

interface RegistroPersonalProps {
  onBack: () => void;
}

// Textos legales (conservados)
const AVISO_PRIVACIDAD = `SASE-310 recaba datos personales del personal escolar con fines de identificación, control de acceso, asignación de funciones y respaldo institucional...`;
const COMPROMISO_ETICO = `Me comprometo a usar SASE-310 únicamente con fines institucionales...`;
const TEXTO_AUDITORIA = `Todas las acciones relevantes quedan registradas con fecha y hora...`;

const AVAILABLE_ROLES = [
  { id: "docente", label: "Docente" },
  { id: "prefectura", label: "Prefectura" },
  { id: "orientacion", label: "Orientación" },
  { id: "trabajo_social", label: "Trabajo Social" },
  { id: "secretaria", label: "Secretaría" },
  { id: "enfermeria", label: "Enfermería / Doctora" },
  { id: "udeii", label: "UDEII" },
  { id: "direccion", label: "Dirección / Subdirección" },
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
    rol: "", // Cambiado a string único
    turno: "vespertino",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    cct: "", // Clave de Centro de Trabajo
    correoInstitucional: "",
    password: "",
    confirmPassword: "",
    checkPrivacidad: false,
    checkEtica: false,
    checkAuditoria: false,
  });

  // CURP Validation
  const validateCURP = (curp: string) => {
    // Regex estándar para CURP mexicano
    const regex =
      /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
    return regex.test(curp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rol)
      return toast.error("Selecciona una función institucional");
    if (
      !formData.checkPrivacidad ||
      !formData.checkEtica ||
      !formData.checkAuditoria
    )
      return toast.error("Debes aceptar los términos");
    if (formData.password !== formData.confirmPassword)
      return toast.error("Las contraseñas no coinciden");
    if (!validateCURP(formData.curp))
      return toast.error("Formato de CURP inválido");

    setLoading(true);
    try {
      const randomNum = Math.floor(Math.random() * 1000);
      const folio = `REQ-${new Date().getFullYear()}-${String(randomNum).padStart(4, "0")}`;

      const { error } = await supabase
        .from("solicitudes_alta_personal")
        .insert({
          rol_solicitado: [formData.rol], // Backwards compatibility: sends array with 1 item
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
    } catch (error: any) {
      console.error(error);
      toast.error("Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] font-sans">
        <div className="w-full max-w-lg bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-[2rem] blur opacity-50 -z-10"></div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Solicitud Enviada
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Tu folio de seguimiento es:
            </p>
            <div className="bg-[#020617] border border-white/10 rounded-xl py-3 px-6 inline-block mb-8">
              <span className="font-mono text-xl text-[#FF9605] tracking-widest">
                {folioSolicitud}
              </span>
            </div>
            <button
              onClick={onBack}
              className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 transition-all"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a1930] text-slate-200 overflow-y-auto pb-20 selection:bg-blue-500 selection:text-white font-sans">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-white/30 hover:text-white mb-8 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Volver al Inicio
        </button>

        <header className="mb-12 text-center md:text-left">
          <img
            src="/assets/branding/SASE.png"
            alt="SASE"
            className="h-16 mb-6 mx-auto md:mx-0 drop-shadow-xl"
          />
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            Solicitar <span className="text-blue-500">Registro</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest pl-1">
            Plataforma Institucional • Prueba Piloto
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. FUNCIÓN (Premium Card) */}
          <div className="bg-[#1e2d45]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
              <span className="w-12 h-px bg-white/10"></span>
              Seleccione su Función
              <span className="flex-1 h-px bg-white/10"></span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RoleSelectButton
                label="Docente"
                icon="school"
                active={formData.rol === "docente"}
                onClick={() => setFormData({ ...formData, rol: "docente" })}
                color="bg-blue-600"
              />
              <RoleSelectButton
                label="Prefectura"
                icon="local_police"
                active={formData.rol === "prefectura"}
                onClick={() => setFormData({ ...formData, rol: "prefectura" })}
                color="bg-orange-500"
              />
              <RoleSelectButton
                label="Orientación"
                icon="psychology"
                active={formData.rol === "orientacion"}
                onClick={() => setFormData({ ...formData, rol: "orientacion" })}
                color="bg-emerald-600"
              />
            </div>

            {/* Other Roles Dropdown if needed or just more buttons */}
            {!["docente", "prefectura", "orientacion"].includes(formData.rol) &&
              formData.rol !== "" && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    Rol Seleccionado: {formData.rol}
                  </span>
                </div>
              )}
          </div>

          {/* 2. IDENTIFICACIÓN (Glass Card) */}
          <div className="bg-[#0B1220]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FF9605]/20 flex items-center justify-center text-[#FF9605] text-sm">
                2
              </span>
              Datos Personales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Nombre(s)
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10"
                  placeholder="Ej. Juan Carlos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
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
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
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
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  CURP
                </label>
                <input
                  type="text"
                  maxLength={18}
                  required
                  value={formData.curp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      curp: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[#0a1930] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-mono uppercase"
                  placeholder="18 CARACTERES"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  CCT (Clave de Centro de Trabajo)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={formData.cct}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cct: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[#0a1930] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-mono uppercase"
                  placeholder="9 DIGITOS + LETRA"
                />
              </div>
            </div>
          </div>

          {/* 3. CREDENCIALES (Glass Card) */}
          <div className="bg-[#0B1220]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
                3
              </span>
              Acceso Seguro
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
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
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all"
                  placeholder="usuario@sase.edu.mx"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Min. 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
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
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.checkPrivacidad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkPrivacidad: e.target.checked,
                      })
                    }
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-transparent text-[#FF9605] focus:ring-0"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300">
                    Acepto el{" "}
                    <span className="font-bold text-white">
                      Aviso de Privacidad
                    </span>{" "}
                    y el tratamiento de mis datos personales para fines
                    institucionales.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.checkEtica}
                    onChange={(e) =>
                      setFormData({ ...formData, checkEtica: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-transparent text-[#FF9605] focus:ring-0"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300">
                    Me comprometo a respetar el{" "}
                    <span className="font-bold text-white">Código Ético</span> y
                    no compartir mis credenciales de acceso.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.checkAuditoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checkAuditoria: e.target.checked,
                      })
                    }
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-transparent text-[#FF9605] focus:ring-0"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300">
                    Entiendo que todas mis acciones en el sistema serán{" "}
                    <span className="font-bold text-white">auditadas</span> por
                    seguridad.
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] active:scale-[0.98] transition-all uppercase tracking-widest text-sm relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? "Validando..." : "Enviar Solicitud Institucional"}
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
            </button>
          </div>
        </form>
      </div>
      <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
       `}</style>
    </div>
  );
};

const RoleSelectButton: React.FC<{
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  color: string;
}> = ({ label, icon, active, onClick, color }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 ${
      active
        ? `${color} border-white/50 shadow-2xl scale-105`
        : "bg-white/5 border-white/5 hover:bg-white/10 grayscale opacity-60"
    }`}
  >
    <div
      className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${active ? "bg-white/20" : "bg-white/10"}`}
    >
      <span className="material-symbols-outlined text-white text-3xl">
        {icon}
      </span>
    </div>
    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
      {label}
    </span>
    {active && (
      <div className="mt-2 text-white">
        <span className="material-symbols-outlined text-sm">check_circle</span>
      </div>
    )}
  </button>
);
