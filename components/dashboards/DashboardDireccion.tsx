import React, { useState, useEffect } from "react";
import { useApp } from "../../store";
import { CaseState, AppModule } from "../../types";
import { printContent } from "../PrintButtons";

export const DashboardDireccion = () => {
  const { students, setCurrentModule } = useApp();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    riskCases: 0,
    attendanceRate: 92,
  });

  const [groupRisk, setGroupRisk] = useState<
    { group: string; count: number; tutor: string }[]
  >([]);

  useEffect(() => {
    const risk = students.filter(
      (s) =>
        s.caseState === CaseState.PATRON_DETECTADO ||
        s.caseState === CaseState.INTERVENCION
    ).length;

    const incidents = students.reduce((acc, s) => acc + s.incidents.length, 0);

    setStats((prev) => ({
      ...prev,
      totalIncidents: incidents,
      riskCases: risk,
    }));

    const groups: Record<string, number> = {};
    students.forEach((s) => {
      if (s.incidents.length > 0) {
        groups[s.group] = (groups[s.group] || 0) + s.incidents.length;
      }
    });

    const sortedGroups = Object.entries(groups)
      .map(([group, count]) => ({ group, count, tutor: "Tutor Asignado" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    setGroupRisk(sortedGroups);
  }, [students]);

  const [checklist, setChecklist] = useState({
    actas: false,
    insumos: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-600"></div>
            <img
              src="/assets/branding/DIRECION.png"
              alt="Dirección"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Dirección de Plantel
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Estado Operativo: Activo
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Resumen de Gestión Escolar</span>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            printContent(
              "Resumen Ejecutivo",
              `<h1>Resumen de Gestión</h1><p>Fecha: ${new Date().toLocaleDateString()}</p>`
            )
          }
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">
            description
          </span>
          EXPORTAR INFORME OFICIAL
        </button>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPIDrawer
          label="Asistencia Global"
          value={`${stats.attendanceRate}%`}
          desc="+1.2% este periodo"
          icon="groups"
          color="blue"
        />
        <KPIDrawer
          label="Casos en Riesgo"
          value={stats.riskCases}
          desc="Requieren atención"
          icon="warning"
          color="red"
        />
        <KPIDrawer
          label="Incidencias Registradas"
          value={stats.totalIncidents}
          desc="Acumulado mensual"
          icon="history_edu"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600">
              assessment
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex-1">
              Focos de Atención por Grupo
            </h3>
          </div>
          <div className="space-y-3">
            {groupRisk.map((g, idx) => (
              <div
                key={g.group}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-800 shadow-sm">
                    {g.group}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {g.group}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                      {g.tutor}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-slate-800">
                    {g.count}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Eventos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <span className="material-symbols-outlined text-amber-600">
              rule
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex-1">
              Pendientes de Dirección
            </h3>
          </div>
          <div className="space-y-4">
            <TaskItem
              label="Firmar actas de consejo técnico"
              date="Vence: Viernes 12"
              checked={checklist.actas}
              onToggle={() => toggleCheck("actas")}
            />
            <TaskItem
              label="Autorizar compra de insumos (Enfermería)"
              date="Expediente #4492"
              checked={checklist.insumos}
              onToggle={() => toggleCheck("insumos")}
            />
          </div>
        </div>
      </div>

      {/* Admin Quick Modules */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Gestión Administrativa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentModule(AppModule.APROBACIONES_PERSONAL)}
            className="flex items-center gap-5 p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
          >
            <div className="size-14 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-3xl text-blue-600">
                how_to_reg
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">
                Aprobaciones de Personal
              </h4>
              <p className="text-xs text-slate-500">
                Validar solicitudes de registro institucional
              </p>
            </div>
          </button>

          <div className="flex items-center gap-5 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl opacity-60">
            <div className="size-14 bg-white rounded-xl flex items-center justify-center border border-slate-100">
              <span className="material-symbols-outlined text-3xl text-slate-300">
                more_horiz
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-400">
                Próximos Módulos
              </h4>
              <p className="text-xs text-slate-400">
                En desarrollo institucional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPIDrawer = ({ label, value, desc, icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    red: "text-red-700 bg-red-50 border-red-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
  };
  return (
    <div
      className={`p-6 rounded-2xl border-2 ${colors[color]} shadow-sm relative overflow-hidden flex flex-col items-center text-center`}
    >
      <span className="material-symbols-outlined text-3xl mb-3 opacity-40">
        {icon}
      </span>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">
        {label}
      </p>
      <p className="text-5xl font-black tracking-tight mb-2 text-slate-800">
        {value}
      </p>
      <p className="text-xs font-bold opacity-60">{desc}</p>
    </div>
  );
};

const TaskItem = ({ label, date, checked, onToggle }: any) => (
  <div
    className={`p-4 border rounded-xl flex items-start gap-4 transition-all ${
      checked ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200"
    }`}
  >
    <button
      onClick={onToggle}
      className={`size-6 rounded border-2 flex items-center justify-center transition-all ${
        checked
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-slate-300"
      }`}
    >
      {checked && (
        <span className="material-symbols-outlined text-xs font-bold">
          check
        </span>
      )}
    </button>
    <div className={checked ? "opacity-40" : ""}>
      <p
        className={`text-sm font-bold text-slate-800 ${
          checked ? "line-through" : ""
        }`}
      >
        {label}
      </p>
      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
        {date}
      </p>
    </div>
  </div>
);
