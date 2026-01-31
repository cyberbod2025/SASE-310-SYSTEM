// SASE Login - Institutional Portal (Direct Access)
import React, { useState } from "react";
import { supabase } from "../supabase/client";

interface LoginProps {
  onDemoEnter?: () => void;
  onDevEnter?: () => void; // Kept for logic but removed from UI button
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

  const [showAdminPortal, setShowAdminPortal] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret combo: Alt + S (SASE Entrance)
      if (e.altKey && e.key.toLowerCase() === "s") {
        setShowAdminPortal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAdminBypass = () => {
    const pin = prompt("Protocolo de Acceso Administrativo (S.A.S.E.)");
    if (pin === "31416") {
      if (onDevEnter) onDevEnter();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-['Inter',sans-serif] bg-[#0b0e14] overflow-hidden selection:bg-blue-500/30">
      {/* BACKGROUND ATMOSPHERE - Narrative Continuation */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover grayscale contrast-125 brightness-50"
        >
          <source
            src="/assets/videos/intro_sase_parallax.mp4"
            type="video/mp4"
          />
        </video>
        {/* MASKING GRADIENT - Stronger at bottom to hide video errors */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/90 via-transparent via-70% to-[#0b0e14]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] p-6 animate-fade-in">
        {/* TOP BRANDING */}
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <div className="relative group mb-6 animate-float">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img
              src="/assets/branding/SASE.png"
              alt="SASE"
              className="w-[200px] relative z-10 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            />
          </div>
          <h1 className="text-white font-black text-[10px] uppercase tracking-[0.5em] opacity-40">
            Sincronización Institucional
          </h1>
        </div>

        {/* LOGIN CONTAINER */}
        <div className="card-sase relative group overflow-hidden">
          {/* Neon Border Top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000"></div>

          {/* Secret Bypass Holder - Only visible after Alt+S */}
          {showAdminPortal && (
            <div
              className="absolute top-4 right-6 text-blue-500/20 hover:text-blue-500/50 cursor-pointer select-none transition-all text-xs z-30 font-serif p-2"
              onDoubleClick={handleAdminBypass}
            >
              •
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-black text-blue-400/70 uppercase tracking-[0.2em] pl-1"
                  >
                    Credencial Digital (Correo)
                  </label>
                  <div className="status-glow-blue opacity-[0.05]"></div>
                </div>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[20px] group-focus-within/input:text-blue-500 transition-colors">
                    person
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-sase pl-12"
                    placeholder="usuario@aefcm.gob.mx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-black text-blue-400/70 uppercase tracking-[0.2em] pl-1"
                  >
                    Clave de Acceso
                  </label>
                  <button
                    type="button"
                    className="text-[9px] font-bold text-slate-600 hover:text-white transition-colors"
                  >
                    ¿Olvido su clave?
                  </button>
                </div>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[20px] group-focus-within/input:text-blue-500 transition-colors">
                    lock
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-sase pl-12"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-[11px] font-bold text-rose-400 flex items-center gap-3 animate-shake">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-sase-primary w-full flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Iniciando Secure-Link...</span>
                </>
              ) : (
                <>
                  <span>Establecer Conexión</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    login
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Quick Actions Footer */}
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <button
              onClick={onRegisterClick}
              className="text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-3 transition-all"
            >
              <span className="material-symbols-outlined text-sm">
                how_to_reg
              </span>
              Alta de Personal
            </button>

            <a
              href="/docs/SASE_Manual_Integral.html"
              target="_blank"
              className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 transition-colors underline decoration-white/5 hover:decoration-white/20 underline-offset-4"
            >
              <span className="material-symbols-outlined text-sm">
                description
              </span>
              Manual SASE
            </a>
          </div>
        </div>

        {/* SECURITY FOOTER */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 bg-blue-500/5 border border-blue-500/10 py-3 px-6 rounded-2xl backdrop-blur-md">
            <div className="status-glow-blue opacity-[0.05]"></div>
            <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.4em]">
              Nivel de Seguridad: Institucional
            </p>
          </div>
          <div className="opacity-40 space-y-2">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">
              S.A.S.E v3.10.0 • ESD-310 "Presidentes de México"
            </p>
            <p className="text-[8px] text-slate-600 font-medium uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
              Toda actividad es auditada y reportada a los servidores centrales
              bajo protocolos NEM.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-shake { animation: shake 0.3s ease-in-out infinite; animation-iteration-count: 2; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
