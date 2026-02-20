// SASE Login - Institutional Portal (Futuristic & Seamless Transition)
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
      console.warn("Video timeout - forcing transition");
      triggerTransition();
    }, 8000); // 8s failsafe
    return () => clearTimeout(timeout);
  }, [showForm]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-['Inter',sans-serif] bg-black overflow-hidden perspective-[1000px]">
      {/* 1. SEAMLESS VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none">
        {/* Video Overlay Gradient (Cinematic) */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10 transition-opacity duration-1000 ${showForm ? "opacity-90" : "opacity-40"}`}
        ></div>
        <div
          className={`absolute inset-0 bg-blue-950/20 mix-blend-overlay z-10`}
        ></div>

        {!videoEnded ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onTimeUpdate={onTimeUpdate}
            onEnded={triggerTransition}
            onError={(e) => {
              console.error("Video error, skipping", e);
              triggerTransition();
              e.currentTarget.style.display = "none";
            }}
            className="w-full h-full object-cover"
          >
            <source src="/assets/videos/intro_sase_2026.mp4" type="video/mp4" />
          </video>
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ display: "block" }} // Freeze frame
          >
            <source src="/assets/videos/intro_sase_2026.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* SKIP BUTTON */}
      {!showForm && (
        <button
          onClick={triggerTransition}
          className="absolute top-8 right-8 z-50 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all animate-pulse"
        >
          [ Saltar Secuencia ]
        </button>
      )}

      {/* 2. LOGIN CARD CONTAINER */}
      <div
        className={`relative z-20 w-full max-w-[440px] transition-all duration-1000 ease-out transform ${
          showForm
            ? "opacity-100 translate-y-0 scale-100 rotate-x-0"
            : "opacity-0 translate-y-20 scale-95 rotate-x-12 pointer-events-none"
        }`}
      >
        {/* Holographic Glows */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl -z-10 animate-pulse-slow opacity-60"></div>

        {/* CARD */}
        <div className="bg-[#030712]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          {/* Top Light Source */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

          {/* Admin Bypass Indicator */}
          {showAdminPortal && (
            <div
              className="absolute top-4 right-6 text-cyan-500 cursor-pointer animate-pulse"
              onClick={handleAdminBypass}
              title="Acceso Super Admin"
            >
              <span className="material-symbols-outlined text-lg">
                admin_panel_settings
              </span>
            </div>
          )}

          {/* BRANDING */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 mb-4 relative">
              <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 animate-pulse"></div>
              <img
                src="/assets/branding/SASE.png"
                alt="Logo"
                className="w-full h-full object-contain relative z-10 drop-shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">
              SASE <span className="text-cyan-400">3.0</span>
            </h1>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em]">
              Plataforma de Control Institucional
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="group/input">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block group-focus-within/input:text-cyan-400 transition-colors">
                Identificador
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors text-[20px]">
                  badge
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b101b]/80 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 focus:bg-[#0b101b] transition-all text-sm font-medium placeholder:text-slate-700 font-mono shadow-inner"
                  placeholder="usuario@sase.edu.mx"
                />
                {/* Scanning Line Effect on Focus */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500 w-0 group-focus-within/input:w-full transition-all duration-500 ease-out"></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="group/input">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 group-focus-within/input:text-cyan-400 transition-colors">
                  Clave de Acceso
                </label>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors text-[20px]">
                  lock_open
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0b101b]/80 border border-slate-800 text-white rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-cyan-500/50 focus:bg-[#0b101b] transition-all text-sm font-medium placeholder:text-slate-700 font-mono shadow-inner"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg flex items-center gap-3 animate-shake">
                <span className="material-symbols-outlined text-rose-500 text-lg">
                  error
                </span>
                <p className="text-[10px] text-rose-200 font-bold uppercase tracking-wide leading-tight">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.3)] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group/btn hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Validando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">
                    login
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-bold text-slate-500">
            <button
              onClick={onRegisterClick}
              className="hover:text-cyan-400 uppercase tracking-widest transition-colors"
            >
              Solicitar Alta
            </button>
            <span className="uppercase tracking-widest opacity-50">
              V 3.1.0
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
