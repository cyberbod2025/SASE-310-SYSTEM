import React, { useState } from "react";
import { motion } from "framer-motion";

interface FirstLogonSetupProps {
  userFullName: string;
  userEmail: string;
  onComplete: () => void;
}

export const FirstLogonSetup: React.FC<FirstLogonSetupProps> = ({
  userFullName,
  userEmail,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    q1: "",
    q2: "",
    q3: "",
    curp: "",
    phone: "",
    dob: "",
  });

  const securityQuestions = [
    "¿Nombre de su primera escuela primaria?",
    "¿Título de su libro favorito?",
    "¿Nombre de su mejor amigo de la infancia?",
    "¿Ciudad donde nació su madre?",
    "¿Nombre de su primera mascota?",
  ];

  const handleNext = () => {
    if (step === 1) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }
      if (formData.newPassword.length < 8) {
        alert("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Finalize setup
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#0B0E14] border border-blue-500/30 rounded-3xl shadow-2xl p-8 overflow-hidden my-auto"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 animate-pulse"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-6">
          <div className="flex gap-4 items-center">
            <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center p-1">
              <img
                src="/assets/branding/SASE_ICON.png"
                alt="SASE IA"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Configuración Inicial
              </h1>
              <p className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase mt-1">
                Protocolo SASE de Seguridad y Privacidad
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-right w-full sm:w-auto">
            <p className="text-xs text-slate-300 font-bold uppercase truncate max-w-[200px]">
              {userFullName}
            </p>
            <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* STEP 1: PASSWORD */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-4">
                <span className="material-icons text-yellow-500 text-2xl">
                  warning
                </span>
                <div>
                  <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-1">
                    Cambio de Contraseña Obligatorio
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Ha ingresado con una contraseña provisional. Por protocolos
                    de seguridad, debe asignar una clave personal intransferible
                    para desbloquear las funciones de la plataforma.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="setup-new-password" className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1 block">
                    Nueva Contraseña
                  </label>
                  <input
                    id="setup-new-password"
                    name="setup-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="setup-confirm-password" className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1 block">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="setup-confirm-password"
                    name="setup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repita la nueva contraseña"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SECURITY QUESTIONS */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4">
                <span className="material-icons text-blue-500 text-2xl">
                  security
                </span>
                <div>
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">
                    Recuperación de Cuenta
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Configure las preguntas de desafío. Estas le permitirán
                    recuperar su cuenta sin necesidad de intervención de soporte
                    técnico si olvida su contraseña.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="setup-q1" className="text-[10px] font-black text-white uppercase tracking-widest pl-1 block">
                    Pregunta 1: {securityQuestions[0]}
                  </label>
                  <input
                    id="setup-q1"
                    name="setup-q1"
                    type="text"
                    value={formData.q1}
                    onChange={(e) =>
                      setFormData({ ...formData, q1: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="setup-q2" className="text-[10px] font-black text-white uppercase tracking-widest pl-1 block">
                    Pregunta 2: {securityQuestions[2]}
                  </label>
                  <input
                    id="setup-q2"
                    name="setup-q2"
                    type="text"
                    value={formData.q2}
                    onChange={(e) =>
                      setFormData({ ...formData, q2: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="setup-q3" className="text-[10px] font-black text-white uppercase tracking-widest pl-1 block">
                    Pregunta 3: {securityQuestions[3]}
                  </label>
                  <input
                    id="setup-q3"
                    name="setup-q3"
                    type="text"
                    value={formData.q3}
                    onChange={(e) =>
                      setFormData({ ...formData, q3: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all uppercase"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PERSONAL DATA & READ ONLY DATA */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-4 mb-6">
                <span className="material-icons text-emerald-500 text-2xl">
                  verified_user
                </span>
                <div>
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">
                    Cotejo de Identidad
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Complete sus datos personales restantes. Los datos
                    institucionales ya fueron pre-cargados y bloqueados por la
                    Dirección.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Editable Data */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    Datos Personales Faltantes
                  </h4>

                  <div className="space-y-2">
                    <label htmlFor="setup-curp" className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1 block">
                      CURP (Requerido)
                    </label>
                    <input
                      id="setup-curp"
                      name="setup-curp"
                      type="text"
                      autoComplete="off"
                      maxLength={18}
                      value={formData.curp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          curp: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="Ej. ABCD123456XXXXXX00"
                      className="w-full bg-black/40 border border-yellow-500/40 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-yellow-500 uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="setup-phone" className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1 block">
                      Teléfono Celular
                    </label>
                    <input
                      id="setup-phone"
                      name="setup-phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="10 dígitos"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="setup-dob" className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1 block">
                      Fecha de Nacimiento
                    </label>
                    <input
                      id="setup-dob"
                      name="setup-dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Read-only Data (Instantiated by Directivo) */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Asignación Directiva (Solo Lectura)
                  </h4>

                  <div className="space-y-2 opacity-60">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      Matrícula SASE
                    </label>
                    <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm font-mono cursor-not-allowed flex justify-between">
                      SE-DOC-8409
                      <span className="material-icons text-sm">
                        lock
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 opacity-60">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      RFC
                    </label>
                    <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm font-mono cursor-not-allowed flex justify-between">
                      XXX-XXXXXX-XXX
                      <span className="material-icons text-sm">
                        lock
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 opacity-60">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                      CCT Escuela y Turno
                    </label>
                    <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm font-mono cursor-not-allowed flex justify-between relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                      15DES0310H / M
                      <span className="material-icons text-sm">
                        lock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NAVIGATION FOOTER */}
          <div className="flex justify-between items-center pt-8 border-t border-white/10 mt-8">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    s === step
                      ? "w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                      : s < step
                        ? "w-4 bg-blue-500/40"
                        : "w-2 bg-white/10"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={
                (step === 1 &&
                  (!formData.newPassword || !formData.confirmPassword)) ||
                (step === 2 &&
                  (!formData.q1 || !formData.q2 || !formData.q3)) ||
                (step === 3 &&
                  (!formData.curp || !formData.phone || !formData.dob))
              }
              className={`px-8 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                (step === 1 &&
                  (!formData.newPassword || !formData.confirmPassword)) ||
                (step === 2 &&
                  (!formData.q1 || !formData.q2 || !formData.q3)) ||
                (step === 3 &&
                  (!formData.curp || !formData.phone || !formData.dob))
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              }`}
            >
              {step === 3 ? "Guardar y Entrar al Sistema" : "Siguiente"}
              <span className="material-icons text-sm">
                {step === 3 ? "check_circle" : "arrow_forward"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
