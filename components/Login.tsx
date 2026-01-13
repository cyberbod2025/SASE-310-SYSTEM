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
      {/* Precisely aligned with the blue digital panel in the video frame */}
      <div className="relative z-10 w-full max-w-lg md:ml-[5%] lg:ml-[2%] translate-x-[-15%] md:translate-x-[-22%] flex flex-col items-center animate-fadeInQuick">
        {/* Transparent container to hold inputs, aligned with the video's UI panel */}
        <div className="w-full max-w-[340px] space-y-6 pt-12">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-600/80 border border-red-400 p-3 rounded text-white text-[10px] font-bold flex items-center gap-2 animate-shake shadow-lg">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                E-MAIL INSTITUCIONAL
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-blue-400/50 rounded-sm py-3 px-4 text-white focus:bg-black/80 focus:border-blue-300 outline-none transition-all placeholder:text-white/20 text-sm font-mono shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]"
                  placeholder="USUARIO@SASE.MX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                CLAVE DE ACCESO
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-blue-400/50 rounded-sm py-3 px-4 text-white focus:bg-black/80 focus:border-blue-300 outline-none transition-all placeholder:text-white/20 text-sm font-mono shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-blue-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-blue-300/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="tracking-[0.4em] text-[11px]">
                      INICIAR SESIÓN
                    </span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 flex flex-col items-center">
            <button
              onClick={onRegisterClick}
              className="text-[10px] text-blue-200/60 hover:text-white transition-colors uppercase tracking-[0.2em] font-bold"
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
        @keyframes fadeInQuick {
          0% { opacity: 0; transform: translateY(5px); }
          80% { opacity: 0; }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
        .animate-fadeInQuick {
          animation: fadeInQuick 1.2s ease-in-out forwards;
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
