// SASE Login - Institutional Portal (Metro Lab Identity 2026)
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase/client";

interface LoginProps {
  onDemoEnter?: () => void;
  onDevEnter?: () => void;
  onRegisterClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onDemoEnter,
  onDevEnter,
  onRegisterClick,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transition State
  const [showForm, setShowForm] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Admin Portal State
  const [showAdminPortal, setShowAdminPortal] = useState(false);

  // --- EFFECT: Check if Intro Seen ---
  useEffect(() => {
    try {
      const introSeen = sessionStorage.getItem("sase_login_intro_seen");
      if (introSeen) {
        setVideoEnded(true);
        setShowForm(true);
      }
    } catch (e) {
      console.warn("Session storage access failed", e);
    }
  }, []);

  // --- EFFECT: Admin Shortcode (Alt + S) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.altKey &&
        (e.key.toLowerCase() === "s" || e.key.toLowerCase() === "π")
      ) {
        setShowAdminPortal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales no reconocidas por el Protocolo Central.");
      setLoading(false);
    }
  };

  const handleAdminBypass = () => {
    const pin = prompt("Protocolo de Acceso Administrativo (S.A.S.E.)");
    if (pin === "31416") {
      if (onDevEnter) onDevEnter();
    }
  };

  const triggerTransition = () => {
    if (videoEnded) return;

    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (err) {
        /* ignore */
      }
    }

    setVideoEnded(true);
    setShowForm(true);
    try {
      sessionStorage.setItem("sase_login_intro_seen", "true");
    } catch (e) {}
  };

  const onTimeUpdate = () => {
    if (!videoRef.current || videoEnded) return;
    const { currentTime, duration } = videoRef.current;
    if (duration && !isNaN(duration) && duration > 0) {
      if (currentTime > duration - 1.2) {
        triggerTransition();
      }
    }
  };

  // Failsafe
  useEffect(() => {
    if (showForm) return;
    const timeout = setTimeout(() => {
      triggerTransition();
    }, 8000);
    return () => clearTimeout(timeout);
  }, [showForm]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* 1. SEAMLESS VIDEO BACKGROUND (Institutional Polish) */}
      <div className="absolute inset-0 z-0 select-none">
        {/* White Overlay Transition */}
        <div
          className={`absolute inset-0 bg-white z-10 transition-opacity duration-1000 ${showForm ? "opacity-95" : "opacity-0"}`}
        ></div>

        {!videoEnded && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onTimeUpdate={onTimeUpdate}
            onEnded={triggerTransition}
            onError={() => triggerTransition()}
            className="w-full h-full object-cover grayscale opacity-30"
          >
            <source src="/assets/videos/intro_sase_2026.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* SKIP BUTTON */}
      {!showForm && (
        <button
          onClick={triggerTransition}
          className="absolute top-8 right-8 z-50 text-slate-800/40 hover:text-slate-800 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
        >
          [ Saltar Secuencia ]
        </button>
      )}

      {/* 2. LOGIN CARD CONTAINER */}
      <div
        className={`relative z-20 w-full max-w-[440px] px-6 transition-all duration-700 ease-out transform ${
          showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="card-sase-direccion bg-white p-10 relative overflow-hidden group">
          {/* Admin Bypass Indicator */}
          {showAdminPortal && (
            <div
              className="absolute top-4 right-6 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
              onClick={handleAdminBypass}
              title="Acceso Super Admin"
            >
              <span className="material-symbols-outlined text-lg">
                admin_panel_settings
              </span>
            </div>
          )}

          {/* BRANDING */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 mb-4">
              <img
                src="/assets/branding/SASE_LOGO.png"
                alt="Logo SASE"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">
              SASE <span className="text-slate-400 font-normal">310</span>
            </h1>
            <p className="slogan-sase text-[11px] uppercase tracking-[0.2em] text-slate-500">
              CONECTAMOS CONTIGO
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="label-sase font-black">
                Identificador Institucional
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  badge
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-sase pl-12"
                  placeholder="usuario@aefcm.gob.mx"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="label-sase font-black">Clave de Acceso</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-sase pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 flex items-start gap-3 animate-sase-fade">
                <span className="material-symbols-outlined text-red-600">
                  report
                </span>
                <p className="text-xs font-bold leading-tight uppercase">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-sase-secondary w-full py-4 text-sm"
            >
              {loading ? "Verificando Protocolos..." : "Entrar al Sistema"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 tracking-widest uppercase">
            <button
              onClick={onRegisterClick}
              className="hover:text-blue-600 transition-colors"
            >
              Registro de Personal
            </button>
            <span className="opacity-40">SASE ESD 310</span>
          </div>
        </div>
      </div>
    </div>
  );
};
