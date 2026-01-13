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
      {/* 1. Futuristic Robot & Space Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center md:bg-right scale-105 animate-slow-drift"
        style={{ backgroundImage: 'url("/assets/branding/login_robot_bg.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
      </div>

      {/* 3. Login Content Area with Futuristic Frame */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center md:flex-row md:justify-start">
        
        {/* THE GLOWING NEON FRAME */}
        <div className="relative w-full max-w-xl p-0.5 rounded-2xl animate-fadeIn">
          {/* Neon Border Accents */}
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-blue-400 rounded-tl-xl shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"></div>
          <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-blue-400 rounded-tr-xl shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-blue-400 rounded-bl-xl shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-blue-400 rounded-br-xl shadow-[0_0_15px_rgba(96,165,250,0.8)] z-20"></div>

          {/* Institutional Label in corner (Like the image) */}
          <div className="absolute top-6 left-8 z-30 flex items-center gap-2 opacity-80">
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,1)]"></div>
             <span className="text-xs font-black text-white tracking-[0.3em] uppercase">LONGU</span>
          </div>

          <div className="bg-black/60 backdrop-blur-2xl border border-blue-400/30 rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(30,58,138,0.5)] overflow-hidden relative">
            
            {/* Inner frame scanlines effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] [background-size:100%_4px,3px_100%] opacity-20"></div>

            <div className="flex flex-col mb-10 text-left relative z-10">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest mb-2" style={{ textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
                SASE
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-white/90 leading-tight mb-4 border-l-4 border-blue-600 pl-4 py-1">
                SASE - Sistema de Acompañamiento y Seguimiento Educativo
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">Conectamos contigo</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-400/50 to-transparent"></div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              {error && (
                <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-xl text-red-200 text-xs flex items-center gap-3 animate-shake">
                  <span className="material-symbols-outlined text-sm">report</span>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em] ml-1">
                  Acceso Institucional (E-mail)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-blue-400/50 group-focus-within:text-blue-400 transition-colors">
                    alternate_email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-white/20 font-mono text-sm"
                    placeholder="INSTITUCION@SASE.MX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.2em] ml-1">
                  Código de Seguridad
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-blue-400/50 group-focus-within:text-blue-400 transition-colors">
                    key
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-white/20 font-mono text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/40 hover:text-blue-400 transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></div>
                
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="tracking-[0.2em] text-xs">AUTENTICAR EN EL SISTEMA</span>
                    <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                      login
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4 relative z-10">
              <button
                onClick={onRegisterClick}
                className="text-[10px] text-white/40 hover:text-blue-400 transition-colors flex items-center gap-2 font-black uppercase tracking-widest"
              >
                SOLICITAR REGISTRO DE PERSONAL
              </button>
              <div className="text-[10px] text-blue-400/30 text-center uppercase tracking-[0.4em] font-black mt-2">
                SASE-310 | SEC. EDUC. PÚBLICA
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes slow-drift {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }
        .animate-slow-drift {
          animation: slow-drift 30s ease-in-out infinite;
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
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
