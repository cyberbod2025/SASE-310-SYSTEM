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
      {/* Video Background */}
      {/* Background - Static Dark Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-slate-900">
        <div className="absolute inset-0 bg-[url('/assets/branding/grid.png')] opacity-20 z-10 mix-blend-overlay"></div>
      </div>

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

          {/* Demo Access Button Removed */}
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed max-w-xs mx-auto">
          Acceso restringido únicamente a personal autorizado.
        </p>
      </div>
    </div>
  );
};
