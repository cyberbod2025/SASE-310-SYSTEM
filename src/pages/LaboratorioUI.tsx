import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export const LaboratorioUI: React.FC = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [toggleIA, setToggleIA] = useState(true);
  const [nivelRiesgo, setNivelRiesgo] = useState("patron");
  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
    rol: "docente",
    comentario: "",
  });

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Formulario de prueba enviado");
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-6 md:p-10 space-y-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-500/10 blur-[110px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[90%] h-[70%] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_45%)]" />
      </div>
      <Toaster position="top-center" />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-black">
            Laboratorio SASE-310
          </p>
          <h1 className="text-2xl font-black">Componentes y efectos de prueba</h1>
          <p className="text-sm text-slate-400">
            Campos con id/name + label para validar accesibilidad.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => toast("Aviso neutro")}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold"
          >
            Toast info
          </button>
          <button
            onClick={() => setMostrarModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black shadow-lg shadow-blue-600/30"
          >
            Abrir modal
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent border border-blue-500/30 shadow-lg">
          <p className="text-[10px] uppercase tracking-[0.25em] text-blue-200 font-black">Riesgo</p>
          <h3 className="text-xl font-black">Semáforo</h3>
          <p className="text-slate-300 text-sm">Estado: Patrón detectado</p>
        </div>
        <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/5 shadow-inner">
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-black">Incidencias</p>
          <h3 className="text-xl font-black">Conducta</h3>
          <p className="text-slate-300 text-sm">Última: 14/03/2026</p>
        </div>
        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200 font-black">Seguimiento</p>
          <h3 className="text-xl font-black">Acompañamiento</h3>
          <p className="text-slate-200 text-sm">Orientación asignada</p>
        </div>
      </div>

      <form
        onSubmit={enviar}
        className="grid gap-4 bg-white/5/0 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: "rgba(15,20,35,0.65)" }}
      >
        <div className="space-y-2">
          <label htmlFor="lab-correo" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Correo institucional
          </label>
          <input
            id="lab-correo"
            name="correo"
            type="email"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            placeholder="usuario@sase.mx"
            autoComplete="email"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lab-contrasena" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Contraseña
          </label>
          <input
            id="lab-contrasena"
            name="contrasena"
            type="password"
            value={form.contrasena}
            onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lab-rol" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Rol
          </label>
          <select
            id="lab-rol"
            name="rol"
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none"
          >
            <option value="docente">Docente</option>
            <option value="prefectura">Prefectura</option>
            <option value="orientacion">Orientación</option>
            <option value="subdireccion">Subdirección</option>
            <option value="developer">Developer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="lab-comentario" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Comentario
          </label>
          <textarea
            id="lab-comentario"
            name="comentario"
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            placeholder="Escribe tu hallazgo o mejora..."
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none min-h-[120px]"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            IA SASE activa
          </label>
          <button
            type="button"
            onClick={() => setToggleIA(!toggleIA)}
            className={`px-4 py-2 rounded-full border text-sm font-bold ${
              toggleIA
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-100"
                : "bg-white/5 border-white/10 text-slate-200"
            }`}
            aria-pressed={toggleIA}
          >
            {toggleIA ? "Activa" : "Desactivada"}
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="lab-riesgo" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Riesgo
            </label>
            <select
              id="lab-riesgo"
              name="riesgo"
              value={nivelRiesgo}
              onChange={(e) => setNivelRiesgo(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm"
            >
              <option value="cerrado">CERRADO</option>
              <option value="observado">OBSERVADO</option>
              <option value="patron">PATRON_DETECTADO</option>
              <option value="analisis">EN_ANALISIS</option>
              <option value="intervencion">INTERVENCION</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-300 font-bold">
              Chips
            </span>
            {["Conducta", "Asistencia", "Académico", "Socioemocional"].map((chip) => (
              <span
                key={chip}
                className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold border border-white/10"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black shadow-lg shadow-blue-600/30"
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={() => toast.error("Ejemplo de error")}
            className="px-5 py-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-sm font-black"
          >
            Error
          </button>
          <button
            type="button"
            onClick={() => toast("Aviso amarillo", { icon: "⚠️" })}
            className="px-5 py-3 rounded-xl bg-amber-500/70 hover:bg-amber-500 text-sm font-black"
          >
            Alerta
          </button>
        </div>
      </form>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.25)]" style={{ backgroundColor: "rgba(15,20,35,0.6)" }}>
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-black mb-3">
          Lista scroll
        </p>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
            >
              <span className="text-sm font-semibold">Elemento #{i + 1}</span>
              <span className="text-[11px] text-slate-400">Detalle breve</span>
            </div>
          ))}
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0b0e14]/80 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-blue-300 font-black">Modal</p>
                <h4 className="text-lg font-black">Ejemplo de ventana</h4>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                aria-label="Cerrar modal"
                className="size-8 rounded-full border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-300">
              Aquí puedes probar foco, scroll y layout en móvil y escritorio.
            </p>
            <button
              onClick={() => setMostrarModal(false)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratorioUI;
