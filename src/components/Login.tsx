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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#05070a] overflow-hidden">
      {/* 1. CINEMATIC VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onTimeUpdate={onTimeUpdate}
          onEnded={triggerTransition}
          onError={() => triggerTransition()}
          className="w-full h-full object-cover opacity-40 grayscale"
        >
          <source src="/assets/videos/intro_sase_2026.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a]"></div>
      </div>

      {/* 2. LOGIN CARD - RECONSTRUCTED */}
      <div
        className={`relative z-20 w-full max-w-[480px] px-6 transition-all duration-1000 ${
          showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="card-sase-blue m-auto">
          {/* LOGO INSTITUCIONAL - FIXED PATH */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/assets/branding/SASE.png"
              alt="SASE"
              className="w-48 h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-4"
            />
            <div className="space-y-1 text-center">
              <h1 className="h1-sase text-3xl">
                SASE <span className="text-blue-500">310</span>
              </h1>
              <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-[0.5em]">
                CONECTAMOS CONTIGO
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                Identificador Institucional
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  person
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-sase pl-12"
                  placeholder="usuario@sase.edu.mx"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                Clave de Acceso
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-sase pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-sase-primary w-full py-4 text-sm"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
              ) : (
                <>
                  Entrar al Sistema
                  <span className="material-symbols-outlined mr-[-4px]">
                    arrow_right_alt
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Card info */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-slate-600 uppercase tracking-widest">
            <button onClick={onRegisterClick} className="hover:text-blue-500">
              Registro de Personal
            </button>
            <span>SASE ESD 310</span>
          </div>
        </div>
      </div>
    </div>
  );
};
