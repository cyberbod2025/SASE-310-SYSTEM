import React, { useState } from "react";
import { supabase } from "../supabase/client";
import { GOD_MODE_CREDENTIALS } from "../utils/saseUtils";

interface LoginProps {
  onDemoEnter?: () => void;
  onDevEnter?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onDemoEnter, onDevEnter }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Check for God Mode (Parallel check)
    if (
      email === GOD_MODE_CREDENTIALS.email &&
      password === GOD_MODE_CREDENTIALS.password &&
      onDevEnter
    ) {
      onDevEnter();
      return;
    }

    if (error) {
      setError("Credenciales incorrectas. Verifique correo y contraseña.");
      setLoading(false);
    }
    // Success handled by AuthProvider
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Ingrese su correo para restablecer la contraseña.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetMessage("Enlace de recuperación enviado a su correo.");
      setError(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden font-sans">
      {/* Background Effects (Matching Splash Screen) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%] animate-grid-flow"
          style={{
            backgroundImage:
              "linear-gradient(#b8860b 1px, transparent 1px), linear-gradient(90deg, #b8860b 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            transform: "perspective(500px) rotateX(60deg)",
          }}
        ></div>
      </div>

      {/* Golden Horizon Beams */}
      <div className="absolute top-[28%] left-0 w-full h-[2px] z-0 pointer-events-none overflow-hidden">
        {/* Left Beam */}
        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-amber-400 to-white shadow-[0_0_20px_#fbbf24] blur-[1px] animate-horizon-scan origin-left"></div>
        {/* Right Beam */}
        <div className="absolute right-0 top-0 h-full bg-gradient-to-l from-transparent via-amber-400 to-white shadow-[0_0_20px_#fbbf24] blur-[1px] animate-horizon-scan origin-right"></div>
      </div>

      {/* Ambient Glow - Golden/Silver */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/15 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-1 mx-4 rounded-2xl overflow-hidden group">
        {/* Golden/Silver Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-400 to-gray-300 animate-border-spin opacity-60 group-hover:opacity-100 transition-opacity blur-md"></div>

        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl p-8 h-full w-full">
          {/* Header & Logo */}
          <div className="text-center mb-1">
            <div className="flex justify-center mb-1">
              <div className="relative group">
                <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <img
                  src="/assets/branding/SASE.png"
                  alt="SASE Logo"
                  style={{
                    filter:
                      "drop-shadow(0 0 30px rgba(218,165,32,0.6)) drop-shadow(0 0 60px rgba(192,192,192,0.4))",
                  }}
                  className="relative w-[350px] h-auto object-contain"
                />
              </div>
            </div>
            {/* Texto redundante eliminado */}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {resetMessage && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-start gap-3">
              <span className="material-symbols-outlined text-lg">
                check_circle
              </span>
              {resetMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@sase.mx"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold py-3.5 rounded-lg shadow-lg shadow-amber-900/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Iniciando...
                </>
              ) : (
                "Ingresar al Sistema"
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-6 text-center space-y-4">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-gray-400 hover:text-amber-400 transition-colors block w-full"
            >
              ¿Olvidaste tu contraseña?
            </button>

            {onDemoEnter && (
              <button
                type="button"
                onClick={onDemoEnter}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 rounded px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20"
              >
                ACCESO DEMOSTRATIVO (EVIDENCIA)
              </button>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed max-w-xs mx-auto">
          Acceso restringido únicamente a personal autorizado.
        </p>
      </div>
    </div>
  );
};
