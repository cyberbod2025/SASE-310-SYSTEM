import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { SaseSplineOrb } from "./SaseSplineOrb";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";
import { useApp } from "../store";

interface LoginProps {
  onDemoEnter?: () => void;
  onRegisterClick?: () => void;
}

const LOGIN_ERROR_MESSAGE = "No se pudo iniciar sesión. Verifica correo y contraseña.";

const getSafeAuthErrorDetail = (message: unknown) => {
  const normalized = typeof message === "string" ? message.toLowerCase() : "";

  if (normalized.includes("invalid login credentials")) {
    return "Credenciales no válidas.";
  }

  if (normalized.includes("email not confirmed")) {
    return "El correo institucional aún no está confirmado.";
  }

  if (normalized.includes("too many") || normalized.includes("rate limit")) {
    return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "No se pudo conectar con el servicio de autenticación.";
  }

  return "El servicio de autenticación no permitió completar el acceso.";
};

export const Login: React.FC<LoginProps> = ({
  onDemoEnter,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<{
    message: string;
    detail?: string;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("feedback") === "1";
  });
  const [feedbackType, setFeedbackType] = useState<"bug" | "sugerencia">("bug");
  const [feedbackText, setFeedbackText] = useState("");

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

  const { logEvent } = useApp();

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
    setLoginError(null);

    const normalizedUsername = username.toLowerCase().trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    if (!emailRegex.test(normalizedUsername)) {
      toast.error("Formato de correo inválido");
      setLoginError({
        message: LOGIN_ERROR_MESSAGE,
        detail: "Ingresa un correo institucional válido.",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedUsername,
        password,
      });
      
      if (signInError) {
        toast.error("Credenciales no válidas");
        setLoginError({
          message: LOGIN_ERROR_MESSAGE,
          detail: getSafeAuthErrorDetail(signInError.message),
        });
        await logEvent("AUTH", "LOGIN", "FAILURE", { email: normalizedUsername, error: signInError.message });
        setLoading(false);
        return;
      }

      // Verificar estado de seguridad en el perfil
      const { data: perfil, error: perfilError } = await (supabase
        .from("perfiles_usuario" as any)
        .select("seguridad_status, blocked_until, risk_score")
        .eq("id", user?.id)
        .single() as any);

      if (perfil) {
        const now = new Date();
        const blockedUntil = perfil.blocked_until ? new Date(perfil.blocked_until) : null;

        if (perfil.seguridad_status === 'blocked') {
          toast.error("Acceso denegado: Usuario bloqueado por seguridad institucional.");
          await logEvent("SECURITY", "LOGIN_BLOCKED", "FAILURE", { email: normalizedUsername, reason: 'blocked_status' });
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (blockedUntil && now < blockedUntil) {
          const minutesLeft = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000);
          toast.error(`Acceso restringido temporalmente. Intente en ${minutesLeft} minutos.`);
          await logEvent("SECURITY", "LOGIN_BLOCKED", "FAILURE", { email: normalizedUsername, reason: 'temporary_block', minutes_left: minutesLeft });
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        if (perfil.seguridad_status === 'restricted') {
          toast.success("Ingreso exitoso (Modo Restringido)");
        }
      }

      if (perfilError) {
        console.warn("Profile security check returned an error:", perfilError.message);
      }

      await logEvent("AUTH", "LOGIN", "SUCCESS", { email: normalizedUsername, risk_score: perfil?.risk_score });

      if (onDemoEnter) {
        onDemoEnter();
      }
      setLoading(false);
    } catch (err) {
      console.error("Unexpected login error:", err);
      toast.error("No se pudo iniciar sesión");
      setLoginError({
        message: LOGIN_ERROR_MESSAGE,
        detail: getSafeAuthErrorDetail(err instanceof Error ? err.message : undefined),
      });
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--sase-bg)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(125,114,147,0.12),transparent_28%),radial-gradient(circle_at_50%_85%,rgba(34,197,94,0.06),transparent_26%)] animate-pulse-slow pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,rgba(18,16,23,0.25)_58%,rgba(18,16,23,0.7)_100%)] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <GlassCard className="p-10 md:p-12 flex flex-col items-center !backdrop-blur-[40px] !bg-[rgba(121,118,124,0.1)] !border-[rgba(227,221,236,0.14)] shadow-[0_38px_100px_rgba(18,16,23,0.38)]">
          <div className="mb-6 self-center">
            <SaseSplineOrb state="normal" className="w-52 h-52" showAura={true} showGlow={true} />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-[-0.04em] text-center">SASE 310</h1>
          <p className="text-[var(--sase-text-muted)] text-[10px] text-center mb-10 font-semibold uppercase tracking-[0.32em] max-w-sm">
            Sistema de Acompañamiento y Seguimiento Escolar
          </p>

          <form className="w-full space-y-6" onSubmit={handleLogin}>
            <GlassInput
              id="email"
              name="email"
              label="Correo Institucional"
              type="email"
              autoComplete="username"
              placeholder="usuario@sase.mx"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon="alternate_email"
              required
            />

            <GlassInput
              id="password"
              name="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
                className="text-[10px] font-semibold text-[var(--sase-text-muted)] hover:text-[var(--sase-accent)] uppercase tracking-[0.22em] transition-all"
              >
                {showPassword ? "Ocultar clave" : "Mostrar clave"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRecovery(true);
                  setRecoveryStep(1);
                }}
                className="text-[10px] font-semibold text-[var(--sase-primary)] hover:text-[#9a89c2] uppercase tracking-[0.22em] transition-all"
              >
                ¿Olvidó su clave?
              </button>
            </div>

            <GlassButton
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full mt-4"
              size="lg"
            >
              {loading ? "Autenticando..." : "Entrar al Sistema"}
            </GlassButton>
          </form>

          {loginError && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-5 w-full rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-left"
            >
              <p className="text-xs font-bold text-rose-100">
                {loginError.message}
              </p>
              {loginError.detail && (
                <p className="mt-1 text-[11px] font-medium leading-5 text-rose-100/70">
                  {loginError.detail}
                </p>
              )}
            </div>
          )}

          <div className="mt-12 text-center pt-8 w-full">
            <p className="text-[10px] text-[var(--sase-text-muted)] font-semibold tracking-[0.22em] uppercase">
              Gestión Institucional de Nueva Generación • SASE-310
            </p>
          </div>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[rgba(18,16,23,0.45)] backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[rgba(121,118,124,0.18)] backdrop-blur-[32px] p-10 rounded-[2.5rem] border border-[rgba(227,221,236,0.16)] shadow-[0_38px_100px_rgba(18,16,23,0.4)] relative overflow-hidden"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[rgba(175,166,60,0.12)] flex items-center justify-center border border-[rgba(175,166,60,0.2)] text-[var(--sase-tertiary)]">
                      <span className="material-icons">key</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--sase-text-head)] tracking-tight uppercase">
                        Recuperar acceso
                      </h3>
                        <p className="text-[9px] font-semibold text-[var(--sase-text-muted)] tracking-[0.24em] uppercase">
                        Bóveda de Seguridad Institucional
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRecovery(false)}
                    className="size-8 rounded-full border border-[rgba(227,221,236,0.14)] flex items-center justify-center text-[var(--sase-text-muted)] hover:text-white transition-all"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>

                {recoveryStep === 1 && (
                  <div className="space-y-6">
                      <p className="text-sm text-[var(--sase-text-main)] font-medium leading-relaxed">
                         Ingresa tu <span className="text-[var(--sase-text-head)] font-semibold">CURP</span> para iniciar el protocolo de validación.
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
                      <p className="text-sm text-[var(--sase-text-main)] font-medium leading-relaxed">
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
                    <p className="text-xs text-[#d7d09a] font-semibold uppercase tracking-[0.22em] bg-[rgba(175,166,60,0.12)] p-4 rounded-2xl border border-[rgba(175,166,60,0.2)] text-center">
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
