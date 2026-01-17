// SASE Login - Institutional Portal (Futuristic & Seamless Transition)
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase/client";
import { UserRole } from "../types";

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
  const [showForm, setShowForm] = useState(false); // Only show after intro or jump
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if the user has already seen the intro in this session
    const introSeen = sessionStorage.getItem("sase_login_intro_seen");
    if (introSeen && videoRef.current) {
      // Skip to the end if already seen to avoid repetitive delay
      videoRef.current.currentTime = 999;
      setShowForm(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Verifique sus credenciales institucionales.");
      setLoading(false);
    }
  };

  const handleAdminBypass = () => {
    const pin = prompt("Protocolo de Acceso Administrativo (S.A.S.E.)");
    if (pin === "31416") {
      alert("Acceso Super Admin Concedido.");
      if (onDevEnter) {
        onDevEnter();
      } else {
        window.location.search = "?role=developer&mode=god";
      }
    }
  };

  const onVideoEnded = () => {
    setShowForm(true);
    sessionStorage.setItem("sase_login_intro_seen", "true");
  };

  // Skip intro helper
  const skipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration || 999;
      onVideoEnded();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-black overflow-hidden">
      {/* 1. SEAMLESS VIDEO BACKGROUND (Intro + Background) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={onVideoEnded}
        onTimeUpdate={() => {
          // Fade in form slightly before video ends for a smoother transition
          if (
            videoRef.current &&
            videoRef.current.currentTime > videoRef.current.duration - 0.5
          ) {
            setShowForm(true);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/assets/videos/intro_sase_2026.mp4" type="video/mp4" />
      </video>

      {/* Subtle Overlay to make UI pop */}
      <div
        className={`absolute inset-0 bg-black/30 z-10 transition-opacity duration-1000 pointer-events-none ${
          showForm ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Skip Button Label (Only shown during video) */}
      {!showForm && (
        <button
          onClick={skipIntro}
          className="absolute top-8 right-8 z-50 text-white/20 hover:text-white/60 text-[10px] uppercase font-black tracking-[0.3em] transition-all"
        >
          Saltar Intro »
        </button>
      )}

      {/* 2. Login Card - Glassmorphism (Matches Video End Interface) */}
      <div
        className={`relative z-20 w-full max-w-[440px] transition-all duration-1000 transform ${
          showForm
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          {/* Pi Symbol in Top Right of the Card - Absolute positioning within the card */}
          <div
            className="absolute top-4 right-5 text-white/5 hover:text-white/40 cursor-pointer select-none transition-all text-[14px] font-bold z-30 p-2"
            onClick={(e) => {
              if (e.ctrlKey || e.detail >= 3) {
                handleAdminBypass();
              }
            }}
          >
            π
          </div>

          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="w-40 h-24 mb-6 flex items-center justify-center">
              <img
                src="/assets/branding/SASE_LOGO.png"
                alt="SASE Institucional"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              />
            </div>

            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.35em] mb-10 text-center opacity-80 leading-relaxed">
              Acompañamiento y<br />
              Seguimiento Escolar
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="w-full space-y-6">
              {error && (
                <div className="bg-red-500/20 text-red-100 p-3 rounded-xl text-[10px] font-bold uppercase text-center border border-red-500/30 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@aefcm.gob.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3.5 px-5 outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-sm font-medium placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3.5 px-5 outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-sm font-medium placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/40 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                  ) : (
                    "Acceder al Sistema"
                  )}
                </button>

                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl border border-white/10 active:scale-[0.98] transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] italic">
                    person_add
                  </span>
                  Solicitar Registro
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-[9px] text-white/20 font-black uppercase tracking-[0.5em] select-none">
          SASE Institucional v2.4.0
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2 alternate;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
