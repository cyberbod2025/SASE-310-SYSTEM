import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { SASEIntroAnimation } from "./SASEIntroAnimation";
import { SaseIAOrb } from "./SaseIAOrb";

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
  const [showForm, setShowForm] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  // Safe check for intro seen
  useEffect(() => {
    try {
      const introSeen = sessionStorage.getItem("sase_login_intro_seen");
      if (introSeen) {
        setIntroFinished(true);
        setShowForm(true);
      }
    } catch (e) {
      console.warn("Session storage access failed", e);
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
      setError(
        "No pudimos validar sus datos. Por favor revise su correo y contraseña.",
      );
      setLoading(false);
    }
  };


  const onIntroComplete = () => {
    setIntroFinished(true);
    setTimeout(() => setShowForm(true), 100);
    try {
      sessionStorage.setItem("sase_login_intro_seen", "true");
    } catch (e) {}
  };

  const skipIntro = () => {
    onIntroComplete();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-[url('/assets/branding/login_background_final.png')] bg-cover bg-center bg-no-repeat overflow-hidden py-10">
      {/* 1. LEGENDARY SASE INTRO ANIMATION (Replaces old video) */}
      {!introFinished && <SASEIntroAnimation onComplete={onIntroComplete} />}

      {/* 2. OVERLAY TRANSITION (Dark 70-80% + Blur) */}
      <div
        className={`fixed inset-0 bg-[#0f1014]/60 backdrop-blur-md z-10 transition-opacity duration-1000 pointer-events-none ${
          showForm ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Skip Button Label */}
      {!introFinished && (
        <button
          onClick={skipIntro}
          className="fixed top-8 right-8 z-[200] text-white/20 hover:text-white/60 text-[10px] uppercase font-black tracking-[0.3em] transition-all bg-black/40 px-4 py-2 rounded-full border border-white/5"
        >
          Saltar Intro »
        </button>
      )}

      {/* 3. LOGIN CARD */}
      <div
        className={`relative z-20 w-full max-w-[480px] transition-all duration-1000 transform ${
          showForm
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Glow Container */}
        <div className="absolute -inset-4 bg-blue-500/5 rounded-[3rem] blur-3xl -z-10 animate-pulse-slow"></div>

        <div className="bg-[#0f172a]/40 backdrop-blur-md border border-white/10 rounded-[3rem] p-12 shadow-[0_0_150px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          {/* Pi Symbol */}
          <div
            className="absolute top-6 right-8 text-white/5 hover:text-white/40 cursor-pointer select-none transition-all text-[14px] font-bold z-30 p-2"
          >
            π
          </div>

          <div className="flex flex-col items-center">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <SaseIAOrb state="green" className="w-32 h-32 mb-6" />
              <h1 className="text-6xl font-black text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                SASE
              </h1>
            </div>
            {/* Form */}
            <form onSubmit={handleLogin} className="w-full space-y-6">
              {error && (
                <div className="bg-red-500/10 text-red-100 p-4 rounded-xl text-sm font-medium text-center border border-red-500/20 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-slate-400 pl-2">
                    Correo institucional
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="ejemplo@aefcm.gob.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0f1e]/50 border border-white/10 text-white rounded-xl py-4 px-6 outline-none focus:bg-[#0a0f1e]/80 focus:border-blue-500/40 transition-all text-base font-normal placeholder:text-white/10 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-slate-400 pl-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0a0f1e]/50 border border-white/10 text-white rounded-xl py-4 px-6 outline-none focus:bg-[#0a0f1e]/80 focus:border-blue-500/40 transition-all text-base font-normal placeholder:text-white/10 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="animate-pulse">
                        Verificando acceso...
                      </span>
                    </>
                  ) : (
                    "Ingresar al sistema"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] text-slate-500 font-medium tracking-widest select-none opacity-40">
          SASE v2.5.0 Pilot
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2 alternate;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes pulse-slow {
           0%, 100% { opacity: 0.3; }
           50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
