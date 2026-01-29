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
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-[#020617] overflow-hidden px-4">
      {/* 1. Deep Space Tech Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* Subtle Nebula Background */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-screen"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022&auto=format&fit=crop")',
          }}
        ></div>

        {/* perspective Grid Floor */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.2) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
            perspective: "1200px",
            transform: "rotateX(65deg) translateY(30%) scale(2.5)",
            transformOrigin: "bottom",
          }}
        ></div>

        {/* Global Network Lines (Constellations) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(34, 211, 238, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 0 100 L 400 300 L 800 100"
            stroke="url(#lineGrad)"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M 200 0 L 600 500 L 1000 200"
            stroke="url(#lineGrad)"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M 100 600 L 500 200 L 900 600"
            stroke="url(#lineGrad)"
            strokeWidth="0.5"
            fill="none"
          />
          <circle
            cx="400"
            cy="300"
            r="1.5"
            fill="rgba(34, 211, 238, 0.8)"
            className="animate-pulse"
          />
          <circle
            cx="600"
            cy="500"
            r="1.5"
            fill="rgba(34, 211, 238, 0.8)"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="500"
            cy="200"
            r="1.5"
            fill="rgba(34, 211, 238, 0.8)"
            className="animate-pulse"
            style={{ animationDelay: "2.5s" }}
          />
        </svg>

        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[150px]"></div>
      </div>

      {/* 2. Central Glass UI Container */}
      <div className="relative z-10 w-full max-w-[420px] animate-fadeIn">
        <div className="bg-[#0f172a]/40 backdrop-blur-[30px] border border-white/10 rounded-[2.5rem] p-12 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-14 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
              <span className="material-symbols-outlined text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                verified_user
              </span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              SASE
            </h1>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.4em] mt-3">
              Educational Support and Monitoring System
            </p>
          </div>

          {/* Minimal Form */}
          <form onSubmit={handleLogin} className="w-full space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-200 text-[10px] font-black uppercase text-center animate-shake tracking-wider">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="email"
                required
                placeholder="Institutional email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 px-6 text-white outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50 focus:bg-white/[0.06] text-sm font-medium"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 px-6 text-white outline-none transition-all placeholder:text-white/20 focus:border-cyan-400/50 focus:bg-white/[0.06] text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d4ed8] hover:bg-blue-600 text-white font-black py-4.5 rounded-full transition-all flex items-center justify-center shadow-[0_10px_30px_rgba(29,78,216,0.3)] active:scale-[0.98] mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-[13px] uppercase tracking-[0.2em]">
                  Access the System
                </span>
              )}
            </button>
          </form>

          {/* Simple Link Bar */}
          <div className="mt-14 flex items-center gap-6">
            <button
              onClick={onDemoEnter}
              className="text-white/30 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Demo Access
            </button>
            <div className="w-px h-3 bg-white/10"></div>
            <button
              onClick={onRegisterClick}
              className="text-white/30 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Solicitar Registro
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2 alternate;
        }
        input::placeholder {
          font-weight: 400;
          text-transform: none;
          letter-spacing: normal;
        }
      `}</style>
    </div>
  );
};
