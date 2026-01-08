import React from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";

export const DashboardUDEII = () => {
  const { students } = useApp();
  const studentsWithBAP = students.filter((s) => s.bapInfo?.hasBAP);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <img
            src="/assets/branding/UDEII.png"
            alt="UDEII Logo"
            className="w-24 h-24 object-contain drop-shadow-2xl animate-float"
            style={{
              clipPath: "circle(48%)",
              filter:
                "brightness(1.1) contrast(1.2) drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))",
            }}
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(168,85,247,0.6)" }}
            >
              Inclusión (UDEII)
            </h1>
            <p className="text-purple-200 text-lg font-medium tracking-wide">
              Gestión de Barreras para el Aprendizaje y la Participación
            </p>
          </div>
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-white">
          Estudiantes en Seguimiento
        </h3>
        {studentsWithBAP.length === 0 ? (
          <p>No hay estudiantes registrados con BAP.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentsWithBAP.map((s) => (
              <div
                key={s.id}
                className="bg-purple-900/10 border border-l-4 border-l-purple-500 border-white/10 rounded-xl p-5 hover:bg-white/5 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-lg">{s.name}</h4>
                    <p className="text-xs text-purple-200 mb-2 font-medium">
                      {s.group}
                    </p>
                  </div>
                  <span className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase shadow-sm">
                    Expediente UDEII
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Diagnóstico (Privado)
                  </p>
                  <p className="text-sm bg-black/40 text-gray-200 p-2 rounded border border-white/10 mt-1">
                    {s.bapInfo?.diagnosisPrivate}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ajustes Razonables (Visible a Docentes)
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                    {s.bapInfo?.accommodations.map((acc, i) => (
                      <li key={i}>{acc}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      const newAdj = prompt(
                        "Ingrese nuevo ajuste razonable (Simulación):",
                        "Tiempo extendido en exámenes"
                      );
                      if (newAdj) toast.success(`Ajuste registrado: ${newAdj}`);
                    }}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Editar Ajustes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
