import React from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";

interface HomeMinimalProps {
  user: User | null;
  onLogout: () => void;
}

export const HomeMinimal: React.FC<HomeMinimalProps> = ({ user, onLogout }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center space-y-8">
        <div className="h-20 flex items-center justify-center">
          <span className="material-icons text-6xl text-green-400">
            check_circle
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white uppercase italic tracking-tighter">
            Bienvenido a SASE IA NUCLEUS
          </h1>
          <p className="text-sm text-slate-400 uppercase tracking-widest font-mono">
            Modo Rescate • Solo Autenticación
          </p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 text-left">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">
            Usuario Autenticado
          </p>
          <p className="text-blue-300 font-mono text-sm break-all">
            {user?.email || "Sin email detectado"}
          </p>
          <p className="text-xs text-slate-600 mt-2">ID: {user?.id}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 px-6 rounded-xl border border-red-500/20 transition-all text-sm uppercase tracking-wide"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
