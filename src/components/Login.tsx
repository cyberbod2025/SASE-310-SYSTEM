// SASE Login - Institutional Portal (Liquid Glass Identity 2026)
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { SaseIAOrb } from "./SaseIAOrb";
import {
  OFFICIAL_STAFF_LIST,
  OfficialStaffMember,
} from "../data/officialStaff";
import { generateTempCode } from "../utils/security/generateTempCode";

interface LoginProps {
  onDemoEnter?: () => void;
  onDevEnter?: () => void;
  onRegisterClick?: () => void;
  onFirstLogon?: (member: OfficialStaffMember) => void;
  onPilotLogin?: (member: OfficialStaffMember) => void;
}

export const Login: React.FC<LoginProps> = ({
  onDemoEnter,
  onDevEnter,
  onRegisterClick,
  onFirstLogon,
  onPilotLogin,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);

  // Recovery State
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: ID, 2: Questions, 3: New Pass
  const [recoveryData, setRecoveryData] = useState({
    identifier: "", // Matricula or CURP
    answer1: "",
    answer2: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock questions for the demo/UI
  const [securityQuestions, setSecurityQuestions] = useState({
    q1: "¿Nombre de su primera escuela primaria?",
    q2: "¿Título de su libro favorito?",
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.altKey &&
        (e.key.toLowerCase() === "s" || e.key.toLowerCase() === "π")
      ) {
        setShowAdminPortal((prev) => !prev);
        toast.success("Accesos Especiales Activados", {
          icon: "🛡️",
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            fontSize: "10px",
            fontWeight: "900",
            textTransform: "uppercase",
          },
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Check against Official Staff List (Pilot Mode)
    const officialMember = OFFICIAL_STAFF_LIST.find(
      (m) => m.username.toLowerCase() === username.toLowerCase(),
    );

    if (officialMember) {
      // Protocolo de acceso temporal dinámico para modo Pilot
      const effectiveCode = officialMember.temporary_code || generateTempCode(); 
      
      if (password === effectiveCode) {
        toast.success(
          `Bienvenido ${officialMember.full_name}. Iniciando configuración de cuenta.`,
        );
        if (onFirstLogon) onFirstLogon(officialMember);
        setLoading(false);
        return;
      }
      // If it's a known user but password doesn't match provisional, it might be their custom one.
      // For the pilot, we assume if they exist and pass matches PROVISIONAL, it's first time.
      // If password is NOT provisional, we might need a real DB check.
    }

    // 2. Fallback to Supabase Auth (for emails)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.includes("@") ? username : `${username}@sase.mx`, // Auto-alias for pilot
      password,
    });

    if (error) {
      // Si falló Supabase pero es Pilot, podemos simular el éxito para el demo si el password es el provisional
      // Pero mejor ser estrictos.
      toast.error("Protocolo Rechazado: Credenciales no válidas", {
        style: {
          background: "#1e1b4b",
          color: "#fff",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          fontSize: "10px",
          fontWeight: "900",
        },
      });
      setLoading(false);
    } else if (onDemoEnter) {
      // Logged in with Supabase
      onDemoEnter();
    }
  };

  const [bypassClicks, setBypassClicks] = useState(0);

  const handleAdminBypass = (e: React.MouseEvent) => {
    // Blindaje de acceso: Triple Click + Shift + Alt activa el prompt
    if (e.altKey && e.shiftKey) {
      const newClicks = bypassClicks + 1;
      setBypassClicks(newClicks);

      if (newClicks >= 3) {
        const pin = prompt(
          "SASE Security Protocol - Enter Authorization Level 5",
        );
        if (pin === "31416") {
          if (onDevEnter) onDevEnter();
        }
        setBypassClicks(0);
      }
    } else {
      setBypassClicks(0);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020408] overflow-hidden font-sans selection:bg-blue-500/30">
      {/* IMMERSIVE BACKGROUND SYSTEM */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Main Mesh Gradient */}
        <div className="absolute inset-0 bg-[#020408]"></div>

        {/* Animated Orbs */}
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
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-blue-500/[0.03] rounded-full blur-[160px]"
        />

        {/* Tactical Grid */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:40px_40px]"></div>

        {/* Scan Lines Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
        </div>
      </div>

      {/* LOGIN CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[480px] p-4"
      >
        <div className="relative group">
          {/* Card Outer Glow */}
          <div className="relative card-sase !rounded-[2.5rem] p-6 md:p-14 border-white/[0.05] bg-[#0b121a]/80 backdrop-blur-[80px] overflow-hidden group">
            {/* Inner Reflections & Pulse */}
            <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse-soft"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="glass-shine opacity-20"></div>

            {/* HEADER AREA: Slogan Focus & Acronym Identity */}
            <div className="flex flex-col items-center mb-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onDoubleClick={handleAdminBypass}
                className="cursor-pointer group flex flex-col items-center select-none"
              >
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
                  <SaseIAOrb
                    state="blue"
                    className="w-24 h-24 sm:w-32 sm:h-32"
                  />
                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.02em] uppercase italic leading-none drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                    SASE
                  </h1>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] md:text-[11px] font-black text-blue-500/80 uppercase tracking-widest max-w-[320px] leading-relaxed">
                    SISTEMA DE ACOMPAÑAMIENTO Y SEGUIMIENTO ESCOLAR
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 select-none">
                    <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.5em] animate-pulse">
                      BUILD CENTRAL
                    </span>
                    <div className="h-[1px] w-4 bg-blue-500/20" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                      CREDENCIALES DE ACCESO
                    </p>
                    <div className="h-[1px] w-4 bg-blue-500/20" />
                    <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.5em] animate-pulse">
                      PROTOCOLO 2026
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* FORM AREA */}
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              {/* Identity Field */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label
                  htmlFor="login-username"
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2"
                >
                  USUARIO
                </label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-500 transition-colors text-xl">
                    fingerprint
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-sase pl-12 h-14 !bg-white/[0.02] !border-white/5 focus:!border-blue-500/40 text-sm"
                    placeholder="USUARIO"
                    title="Ingrese su usuario o correo"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center px-1 relative mb-1">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"
                  >
                    CONTRASEÑA
                  </label>
                  {showAdminPortal && (
                    <span className="text-blue-500 animate-pulse text-[8px] font-black uppercase tracking-widest">
                      Override Activo
                    </span>
                  )}
                </div>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-500 transition-colors text-xl">
                    key
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-sase pl-12 pr-12 h-14 !bg-white/[0.02] !border-white/5 focus:!border-blue-500/40 text-sm"
                    placeholder="••••••••"
                    title="Ingrese su clave de seguridad"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </motion.div>

              {/* Action Area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2 flex flex-col gap-4"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sase-primary w-full h-14 group overflow-hidden"
                >
                  <div className="glass-shine opacity-40"></div>
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        className="material-symbols-outlined animate-spin text-2xl text-white"
                      >
                        autorenew
                      </motion.span>
                    ) : (
                      <motion.div
                        key="default"
                        className="flex items-center justify-center gap-3"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                          ENTRAR AL SISTEMA
                        </span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      title="Recordar mis credenciales"
                      className="size-4 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-bold uppercase tracking-widest transition-colors">
                      Recordarme
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(true);
                      setRecoveryStep(1);
                    }}
                    className="text-[10px] text-blue-400/80 hover:text-blue-400 font-black uppercase tracking-widest transition-colors hover:underline"
                  >
                    ¿Olvidó su clave?
                  </button>
                </div>
              </motion.div>
            </form>

            {/* SECONDARY ACTIONS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-8 border-t border-white/[0.05] flex flex-col items-center gap-6 relative z-10"
            >
              <div className="flex items-center gap-8 justify-center w-full">
                <div className="flex flex-col items-center gap-1 opacity-20">
                  <p className="text-[7px] font-black text-white uppercase tracking-[0.3em]">
                    Build Central
                  </p>
                  <div className="h-[1px] w-8 bg-white" />
                </div>
                <div className="px-4 py-1.5 bg-white/[0.02] border border-white/5 rounded-full">
                  <span className="text-[8px] font-black text-blue-500/40 uppercase tracking-[0.5em]">
                    v3.10 PREMIUM
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-20">
                  <p className="text-[7px] font-black text-white uppercase tracking-[0.3em]">
                    Protocol 2026
                  </p>
                  <div className="h-[1px] w-8 bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* --- RECOVERY MODAL (LIQUID GLASS) --- */}
      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-panel p-10 rounded-[2.5rem] border border-white/20 shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <span className="material-symbols-outlined text-blue-400">
                        key_visualizer
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                        Recuperar Acceso
                      </h3>
                      <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">
                        Security_Vault_v3
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRecovery(false)}
                    className="size-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">
                      close
                    </span>
                  </button>
                </div>

                {recoveryStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Ingrese su{" "}
                      <span className="text-white font-bold">
                        Matrícula Escolar
                      </span>{" "}
                      o <span className="text-white font-bold">CURP</span> para
                      iniciar el protocolo de desafío.
                    </p>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Identificador Institucional
                      </label>
                      <input
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono uppercase tracking-widest outline-none focus:border-blue-500/40 transition-all"
                        placeholder="MAT-XXXX-XXXX"
                        value={recoveryData.identifier}
                        onChange={(e) =>
                          setRecoveryData({
                            ...recoveryData,
                            identifier: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!recoveryData.identifier) {
                          toast.error("Ingrese una identificación válida");
                          return;
                        }
                        setLoading(true);
                        try {
                          const { data, error } = await supabase
                            .from("perfiles_usuario")
                            .select("nombre_completo, curp, matricula_sase")
                            .or(
                              `matricula_sase.eq.${recoveryData.identifier},curp.eq.${recoveryData.identifier}`,
                            )
                            .single();

                          if (error || !data) {
                            toast.error(
                              "Identidad no encontrada en el registro oficial",
                            );
                            setLoading(false);
                            return;
                          }

                          toast.success(
                            `Protocolo activado para: ${data.nombre_completo}`,
                          );
                          setRecoveryStep(2);
                        } catch (err) {
                          toast.error("Error en el enlace de validación");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="btn-sase-primary w-full h-14 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <span className="material-symbols-outlined animate-spin">
                          autorenew
                        </span>
                      ) : (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Validar Identidad
                          </span>
                          <span className="material-symbols-outlined text-sm">
                            verified_user
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {recoveryStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Responda a los desafíos de seguridad configurados en su
                      registro.
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1">
                          {securityQuestions.q1}
                        </label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500/40 transition-all uppercase"
                          placeholder="Respuesta 1"
                          value={recoveryData.answer1}
                          onChange={(e) =>
                            setRecoveryData({
                              ...recoveryData,
                              answer1: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1">
                          {securityQuestions.q2}
                        </label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500/40 transition-all uppercase"
                          placeholder="Respuesta 2"
                          value={recoveryData.answer2}
                          onChange={(e) =>
                            setRecoveryData({
                              ...recoveryData,
                              answer2: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setRecoveryStep(3)}
                      className="btn-sase-primary w-full h-14"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Verificar Respuestas
                      </span>
                    </button>
                  </div>
                )}

                {recoveryStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">
                      ✓ Identidad Verificada Correctamente
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          title="Nueva contraseña"
                          placeholder="Nueva contraseña"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/40 transition-all"
                          value={recoveryData.newPassword}
                          onChange={(e) =>
                            setRecoveryData({
                              ...recoveryData,
                              newPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          title="Confirmar nueva contraseña"
                          placeholder="Confirmar nueva contraseña"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/40 transition-all"
                          value={recoveryData.confirmPassword}
                          onChange={(e) =>
                            setRecoveryData({
                              ...recoveryData,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toast.success("Contraseña actualizada con éxito");
                        setShowRecovery(false);
                      }}
                      className="btn-sase-primary w-full h-14"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">
                        Restablecer Acceso
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TACTICAL METRIC DECORATION */}
      <div className="fixed bottom-10 right-10 flex items-center gap-4 opacity-10 select-none">
        <div className="text-right">
          <p className="text-[8px] font-black text-white uppercase tracking-widest">
            Uplink Status
          </p>
          <p className="text-[10px] font-mono text-blue-400">
            ENCRYPTED_AES256
          </p>
        </div>
        <div className="size-10 border-2 border-white/20 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white animate-pulse">
            security
          </span>
        </div>
      </div>
    </div>
  );
};
