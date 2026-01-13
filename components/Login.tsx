// SASE Login - Institutional Portal
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase/client";
import { GOD_MODE_CREDENTIALS } from "../utils/saseUtils";

interface LoginProps {
  onDemoEnter?: () => void;
  onDevEnter?: () => void;
  onRegisterClick?: () => void;
}

const INTRO_SEEN_KEY = "sase_intro_seen_v2"; // Force refresh for new style

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (
      email === GOD_MODE_CREDENTIALS.email &&
      password === GOD_MODE_CREDENTIALS.password
    ) {
      if (onDevEnter) onDevEnter();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Verifique sus credenciales institucionales.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-black overflow-hidden px-4">
      {/* 1. Final Frame Background Integration */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center md:bg-right scale-100 animate-fadeIn"
        style={{
          backgroundImage: 'url("/assets/branding/login_background_final.png")',
        }}
      >
        {/* Subtle Overlay to make text more readable without losing the background */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* 2. Overlaid Interactive Login Area */}
      {/* We position this relative to where the blue frame is in the background image */}
      <div className="relative z-10 w-full max-w-lg md:mr-[30%] flex flex-col items-center animate-fadeInSlow">
        {/* We reuse the SASE branding headers but keep them minimal since they are in the background */}
        <div className="w-full flex flex-col items-center mb-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          {/* These are invisible by default to let the background shine, but can be functional if needed */}
        </div>

        {/* This container will hold the ACTUAL inputs, positioned where the user expects them */}
        <div className="bg-black/20 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/60 border border-red-500/50 p-3 rounded-lg text-red-100 text-[10px] flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">
                E-MAIL INSTITUCIONAL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-blue-500/30 rounded-lg py-3 px-4 text-white focus:bg-black/60 focus:border-blue-400 outline-none transition-all placeholder:text-blue-200/20 text-sm font-mono"
                placeholder="USUARIO@SASE.MX"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">
                CLAVE DE ACCESO
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/30 rounded-lg py-3 px-4 text-white focus:bg-black/60 focus:border-blue-400 outline-none transition-all placeholder:text-blue-200/20 text-sm font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/40 hover:text-blue-400"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600/80 hover:bg-blue-500 text-white font-black py-4 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="tracking-[0.3em] text-[10px]">
                  INICIAR SESIÓN
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={onRegisterClick}
              className="text-[9px] text-blue-200/40 hover:text-blue-300 transition-colors uppercase tracking-widest font-black"
            >
              SOLICITAR REGISTRO
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInSlow {
          0% { opacity: 0; transform: translateY(10px); }
          50% { opacity: 0; }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out forwards;
        }
        .animate-fadeInSlow {
          animation: fadeInSlow 2.5s ease-in-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2 alternate;
        }
      `}</style>
    </div>
  );
};
