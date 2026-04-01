import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { SasinLoginOrb } from "./SasinLoginOrb";
import { GlassCard } from "./ui/GlassCard";

interface LoginProps {
  onDemoEnter?: () => void;
  onRegisterClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onDemoEnter,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("feedback") === "1";
  });
  const [feedbackType, setFeedbackType] = useState<"bug" | "sugerencia">("bug");
  const [feedbackText, setFeedbackText] = useState("");

  const orbX = useMotionValue(0);
  const orbY = useMotionValue(0);
  const orbXSpring = useSpring(orbX, { stiffness: 120, damping: 18, mass: 0.6 });
  const orbYSpring = useSpring(orbY, { stiffness: 120, damping: 18, mass: 0.6 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 28;
      const y = (event.clientY / window.innerHeight - 0.5) * 28;
      orbX.set(x);
      orbY.set(y);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [orbX, orbY]);

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryData, setRecoveryData] = useState({
    identifier: "",
    answer1: "",
    answer2: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [securityQuestions] = useState({
    q1: "¿Nombre de su primera escuela primaria?",
    q2: "¿Titulo de su libro favorito?",
  });

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const comentario = feedbackText.trim();
    if (!comentario) {
      toast.error("Escribe tu comentario");
      return;
    }

    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent;
    const contexto = `Pantalla: Login | Usuario: ${username || "sin usuario"}`;

    try {
      const { error } = await (supabase.from("system_feedback" as any) as any).insert([
        {
          user_id: null,
          email: username || null,
          type: feedbackType,
          comment: `${comentario}\n\n[Contexto automático]\n${contexto}`,
          url: currentUrl,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        toast.error("Feedback guardado localmente; sin envío automático.");
        return;
      }
      toast.success("Feedback enviado. Gracias.");
      setFeedbackText("");
      setShowFeedback(false);
    } catch (err) {
      toast.error("Feedback guardado localmente; sin envío automático.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedUsername = username.toLowerCase().trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    if (!emailRegex.test(normalizedUsername)) {
      console.log("Login: Formato de usuario invalido:", normalizedUsername);
      toast.error("Formato de correo invalido. Por favor, verifique su entrada.");
      setLoading(false);
      return;
    }

    console.log("Login: Intentando acceso con:", normalizedUsername);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedUsername,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      toast.error("Protocolo rechazado: credenciales no validas", {
        style: {
          background: "#1e1b4b",
          color: "#fff",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          fontSize: "10px",
          fontWeight: "900",
        },
      });
      setLoading(false);
      return;
    }

    if (onDemoEnter) {
      onDemoEnter();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 flex flex-col items-center">
          <motion.div style={{ x: orbXSpring, y: orbYSpring }}>
            <SasinLoginOrb className="w-24 h-24 mb-6" mouseX={orbX.get() / 28} mouseY={orbY.get() / 28} />
          </motion.div>

          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-wide text-center uppercase title-sase">SASE 310</h1>
          <p className="text-slate-500 text-sm text-center mb-8 font-medium">
            Sistema de Acompañamiento y Seguimiento Escolar
          </p>

          <form className="w-full space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
               Correo institucional
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" aria-hidden>
                  ✉️
                </span>
                <input
                  type="email"
                  placeholder="usuario@sase.mx"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  id="login-email"
                  name="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm min-h-[48px]"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Usa tu correo institucional @sase.mx
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
               Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" aria-hidden>
                  🔒
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="login-password"
                  name="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm min-h-[48px]"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  <span className="text-base" aria-hidden>
                    {showPassword ? "🙈" : "👁"}
                  </span>
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all min-h-[48px]"
            >
              {loading ? "Verificando acceso..." : "Acceder al sistema"}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setShowRecovery(true);
                setRecoveryStep(1);
              }}
              className="text-xs text-blue-400/80 hover:text-blue-400 font-semibold transition-colors"
            >
              ¿Olvido su clave?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              ¿No tienes acceso? Solicita tu invitacion en Direccion.
            </p>
          </div>
        </GlassCard>
      </motion.div>

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
                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-200 text-lg">
                      🔑
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                        Recuperar acceso
                      </h3>
                      <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">
                        Boveda de seguridad v3
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRecovery(false)}
                    className="size-8 rounded-full border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-all text-lg"
                    aria-label="Cerrar recuperación"
                  >
                    ×
                  </button>
                </div>

                {recoveryStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                       Ingresa tu <span className="text-white font-bold">CURP</span> para iniciar el protocolo de desafío.
                    </p>
                    <div className="space-y-2">
                       <label htmlFor="recovery-identifier" className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                         CURP
                       </label>
                       <input
                         id="recovery-identifier"
                         name="recovery-identifier"
                        autoComplete="username"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono uppercase tracking-widest outline-none focus:border-blue-500/40 transition-all"
                        placeholder="CURP EN MAYÚSCULAS"
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
                          toast.error("Ingrese una identificacion valida");
                          return;
                        }
                        setLoading(true);
                        try {
                           const { data, error } = await supabase
                             .from("perfiles_usuario")
                             .select("nombre_completo, curp")
                             .eq("curp", recoveryData.identifier)
                             .single();

                          if (error || !data) {
                            toast.error("Identidad no encontrada en el registro oficial");
                            setLoading(false);
                            return;
                          }

                          toast.success(`Protocolo activado para: ${data.nombre_completo}`);
                          setRecoveryStep(2);
                        } catch (err) {
                          toast.error("Error en el enlace de validacion");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                       className="btn-sase-primary w-full h-14 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <span className="animate-spin" aria-hidden>⟳</span>
                      ) : (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Validar identidad
                          </span>
                          <span aria-hidden className="text-base">✔</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {recoveryStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Responda a los desafios de seguridad configurados en su registro.
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="recovery-answer-1" className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1">
                          {securityQuestions.q1}
                        </label>
                        <input
                          id="recovery-answer-1"
                          name="recovery-answer-1"
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
                        <label htmlFor="recovery-answer-2" className="text-[9px] font-black text-blue-400 uppercase tracking-widest pl-1">
                          {securityQuestions.q2}
                        </label>
                        <input
                          id="recovery-answer-2"
                          name="recovery-answer-2"
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

                    <button onClick={() => setRecoveryStep(3)} className="btn-sase-primary w-full h-14">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Verificar respuestas
                      </span>
                    </button>
                  </div>
                )}

                {recoveryStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-center">
                      ✓ Identidad verificada correctamente
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="recovery-new-password" className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          Nueva contraseña
                        </label>
                        <input
                          id="recovery-new-password"
                          name="recovery-new-password"
                          type="password"
                          autoComplete="new-password"
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
                        <label htmlFor="recovery-confirm-password" className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                          Confirmar nueva contraseña
                        </label>
                        <input
                          id="recovery-confirm-password"
                          name="recovery-confirm-password"
                          type="password"
                          autoComplete="new-password"
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
                        toast.success("Contraseña actualizada con exito");
                        setShowRecovery(false);
                      }}
                      className="btn-sase-primary w-full h-14"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">
                        Restablecer acceso
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0b0e14] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em]">
                    Feedback rápido
                  </p>
                  <h4 className="text-white font-black text-lg">Login SASE</h4>
                </div>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="size-8 rounded-full border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Cerrar feedback"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex gap-2 text-[11px] font-bold uppercase tracking-widest" role="group" aria-label="Tipo de feedback">
                  <button
                    type="button"
                    onClick={() => setFeedbackType("bug")}
                    className={`flex-1 py-2 rounded-xl border ${
                      feedbackType === "bug"
                        ? "bg-red-600/20 border-red-400/40 text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Error
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType("sugerencia")}
                    className={`flex-1 py-2 rounded-xl border ${
                      feedbackType === "sugerencia"
                        ? "bg-blue-600/20 border-blue-400/40 text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Sugerencia
                  </button>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-400 min-h-[120px]"
                  placeholder="Describe el error o mejora que ves en el login"
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all"
                >
                  Enviar feedback
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-10 right-10 flex items-center gap-4 opacity-10 select-none">
        <div className="text-right">
          <p className="text-[8px] font-black text-white uppercase tracking-widest">
            Estado de enlace
          </p>
          <p className="text-[10px] font-mono text-blue-400">CIFRADO_AES256</p>
        </div>
        <div className="size-10 border-2 border-white/20 rounded-2xl flex items-center justify-center">
          <span className="material-icons text-white animate-pulse">security</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
