import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { useApp } from '../store';
import { AppModule } from '../types';

export const Unauthorized = () => {
  const { setCurrentModule } = useApp();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-10 bg-slate-950 text-white">
      <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6 animate-pulse">
        <ShieldAlert className="text-red-500 size-10" />
      </div>
      
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Acceso Restringido</h1>
      <p className="text-slate-400 text-sm max-w-xs text-center mb-8 leading-relaxed">
        Tu perfil institucional no cuenta con los privilegios necesarios para acceder a este núcleo de datos.
      </p>

      <button
        onClick={() => setCurrentModule(AppModule.HOME)}
        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
      >
        <Home size={14} />
        Volver al inicio
      </button>
    </div>
  );
};

export default Unauthorized;
