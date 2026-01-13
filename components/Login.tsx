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
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-[#020510] overflow-hidden">
      {/* 1. Subtle Institutional Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-black"></div>
      </div>

      {/* 3. Login Content Area */}
      <div className="relative z-10 w-full max-w-lg p-6 animate-fadeIn">
        <div className="flex flex-col items-center mb-10 text-center">
          <img
            src="/assets/branding/SASE.png"
            alt="SASE-310"
            className="h-16 md:h-20 mb-4 object-contain"
          />
          <div className="h-1 w-16 bg-blue-600 rounded-full mb-4"></div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Portal de Acceso Institucional
          </h1>
          <p className="text-blue-300/60 text-sm mt-2 max-w-xs">
            Sistema de Acompañamiento y Seguimiento Escolar
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl shadow-blue-900/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-400/60 uppercase tracking-wider ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:bg-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-600"
                  placeholder="ejemplo@sase.mx"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-400/60 uppercase tracking-wider ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white focus:bg-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end px-1">
              <button
                type="button"
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold transition-colors"
              >
                ¿Necesita ayuda con su acceso?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>INGRESAR AL SISTEMA</span>
                  <span className="material-symbols-outlined text-xl">
                    east
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={onRegisterClick}
            className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-sm">
              person_add
            </span>
            Solicitar Registro de Personal
          </button>

          <div className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
            Secretaría de Educación Pública | CCT 09DES4310M
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fadeOutDelay {
          animation: fadeOut 0.8s ease-in-out 5s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};
