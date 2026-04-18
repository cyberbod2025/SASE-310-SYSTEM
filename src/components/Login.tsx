import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { SaseSplineOrb } from "./SaseSplineOrb";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";

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

  const [orbPos, setOrbPos] = useState({ x: 0, y: 0 });

  const orbX = useMotionValue(0);
  const orbY = useMotionValue(0);
  const orbXSpring = useSpring(orbX, { stiffness: 120, damping: 18, mass: 0.6 });
  const orbYSpring = useSpring(orbY, { stiffness: 120, damping: 18, mass: 0.6 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setOrbPos({ x, y });
      orbX.set(x * 14);
      orbY.set(y * 14);
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
    q2: "¿Título de su libro favorito?",
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
        toast.error("Feedback guardado localmente");
        return;
      }
      toast.success("Feedback enviado");
      setFeedbackText("");
      setShowFeedback(false);
    } catch (err) {
      toast.error("Error al enviar feedback");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedUsername = username.toLowerCase().trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    if (!emailRegex.test(normalizedUsername)) {
      toast.error("Formato de correo inválido");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedUsername,
      password,
    });

    if (error) {
      toast.error("Credenciales no válidas");
      setLoading(false);
      return;
    }

    if (onDemoEnter) {
      onDemoEnter();
    }
    setLoading(false);
  };

  return (
    <div 
      className="sase-layout-light min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-cyan-500/15 animate-pulse-slow pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <GlassCard className="p-10 flex flex-col items-center !border-t-0 shadow-2xl !backdrop-blur-[32px] !bg-white/10 border-white/10 ring-1 ring-white/20">
          <motion.div 
            style={{ x: orbXSpring, y: orbYSpring }}
            className="mb-8"
          >
            <SaseSplineOrb state="rebooting" className="w-32 h-32" />
          </motion.div>

          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter text-center uppercase drop-shadow-md">SASE 310</h1>
          <p className="text-white/60 text-[10px] text-center mb-10 font-black uppercase tracking-[0.4em]">
            Gestión Institucional de Nueva Generación
          </p>

          <form className="w-full space-y-6" onSubmit={handleLogin}>
            <GlassInput
              label="Correo Institucional"
              type="email"
              placeholder="usuario@sase.mx"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon="alternate_email"
              required
            />

            <GlassInput
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon="lock"
              required
            />

            <div className="flex justify-between items-center px-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all"
              >
                {showPassword ? "Ocultar clave" : "Mostrar clave"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRecovery(true);
                  setRecoveryStep(1);
                }}
                className="text-[10px] font-black text-blue-600 hover:text-blue-500 uppercase tracking-widest transition-all"
              >
                ¿Olvidó su clave?
              </button>
            </div>

            <GlassButton
              type="submit"
              loading={loading}
              className="w-full mt-4"
              size="lg"
            >
              Entrar al Sistema
            </GlassButton>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-slate-200/50 w-full">
            <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">
              Secretaría de Educación Pública • SASE-310
            </p>
          </div>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white/90 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                      <span className="material-icons">key</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
                        Recuperar acceso
                      </h3>
                      <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase">
                        Bóveda de Seguridad Institucional
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRecovery(false)}
                    className="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>

                {recoveryStep === 1 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                       Ingresa tu <span className="text-slate-900 font-black">CURP</span> para iniciar el protocolo de validación.
                    </p>
                    <GlassInput
                      label="CURP Institucional"
                      placeholder="CURP EN MAYÚSCULAS"
                      value={recoveryData.identifier}
                      onChange={(e) => setRecoveryData({...recoveryData, identifier: e.target.value.toUpperCase()})}
                    />
                    <GlassButton
                      onClick={() => setRecoveryStep(2)}
                      className="w-full"
                      loading={loading}
                    >
                      Continuar Proceso
                    </GlassButton>
                  </div>
                )}

                {recoveryStep === 2 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Responda a los desafíos de seguridad configurados.
                    </p>
                    <GlassInput
                      label={securityQuestions.q1}
                      placeholder="Respuesta"
                      value={recoveryData.answer1}
                      onChange={(e) => setRecoveryData({...recoveryData, answer1: e.target.value})}
                    />
                    <GlassButton onClick={() => setRecoveryStep(3)} className="w-full">
                      Verificar Identidad
                    </GlassButton>
                  </div>
                )}

                {recoveryStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                      Identidad verificada correctamente
                    </p>
                    <GlassInput
                      label="Nueva Contraseña"
                      type="password"
                      value={recoveryData.newPassword}
                      onChange={(e) => setRecoveryData({...recoveryData, newPassword: e.target.value})}
                    />
                    <GlassButton
                      onClick={() => setShowRecovery(false)}
                      className="w-full"
                    >
                      Restablecer Clave
                    </GlassButton>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div 
        className="fixed bottom-10 left-10 flex items-center gap-4 group cursor-pointer" 
        onClick={() => setShowFeedback(true)}
      >
        <div className="size-10 border border-slate-200 rounded-2xl flex items-center justify-center bg-white shadow-xl group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
          <span className="material-icons text-slate-400 group-hover:text-blue-600">feedback</span>
        </div>
        <div className="text-left opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
          <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Feedback SASE</p>
          <p className="text-[10px] font-bold text-slate-400">Mejorar el sistema</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
