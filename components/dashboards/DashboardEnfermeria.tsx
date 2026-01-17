import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { IncidentType, AppModule, Protocol } from "../../types";
import { supabase } from "../../supabase/client";
import { ProtocolDetailModal } from "../Protocols/ProtocolDetailModal";

export const DashboardEnfermeria = () => {
  const { students, setQuickRegisterOpen, setCurrentModule } = useApp();
  const [supportProtocol, setSupportProtocol] = useState<Protocol | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);

  useEffect(() => {
    const fetchProtocol = async () => {
      const { data } = await supabase
        .from("protocolos" as any)
        .select("*")
        .ilike("titulo", "%Primeros Auxilios%")
        .single();
      if (data) setSupportProtocol(data as any);
    };
    fetchProtocol();
  }, []);
  const todayStr = new Date().toISOString().split("T")[0];

  const healthIncidents = students
    .flatMap((s) =>
      s.incidents.map((i) => ({
        ...i,
        studentId: s.id,
        studentName: s.name,
        group: s.group,
      }))
    )
    .filter((i) => i.type === IncidentType.SALUD);

  const visitsToday = healthIncidents.filter((i) =>
    i.date.startsWith(todayStr)
  ).length;

  const pendingMeds = 5;

  const activeAlertsCount = students.filter(
    (s) => s.medicalAlerts && s.medicalAlerts.length > 0
  ).length;

  const recentVisits = [...healthIncidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-600"></div>
            <img
              src="/assets/branding/ENFERMERIA.png"
              alt="Enfermería"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Salud y Enfermería
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-red-700">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                Servicio Médico Activo
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">
                Gestión de Expedientes de Salud
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-right">
          <p className="text-sm font-bold text-slate-800 capitalize">
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
            Calendario Escolar
          </p>
        </div>
      </div>

      {/* Urgent Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-2xl transform transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-2.5 rounded-xl">
            <span className="material-symbols-outlined text-red-600">
              emergency
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-red-800 uppercase tracking-widest mb-0.5">
              Alertas Médicas Críticas
            </p>
            <p className="text-sm text-red-700 font-medium leading-tight">
              Se han detectado{" "}
              <span className="font-bold underline">
                {activeAlertsCount} expedientes
              </span>{" "}
              con condiciones que requieren seguimiento inmediato.
            </p>
          </div>
          <button
            onClick={() => setCurrentModule(AppModule.REPORTES)}
            className="px-4 py-2 bg-white text-red-700 font-bold text-xs rounded-lg border border-red-200 shadow-sm hover:bg-red-50 transition-colors"
          >
            REVISAR EXPEDIENTES
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthStat
          label="Consultas Hoy"
          value={visitsToday}
          desc="Atención recibida"
          icon="clinical_notes"
          color="blue"
        />
        <HealthStat
          label="Medicamentos"
          value={pendingMeds}
          desc="Administraciones"
          icon="medication"
          color="amber"
        />
        <HealthStat
          label="Casos Críticos"
          value={activeAlertsCount}
          desc="En seguimiento"
          icon="medical_services"
          color="red"
        />
        <button
          onClick={() => setQuickRegisterOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 p-6 rounded-2xl shadow-md transition-all group text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
          <span className="material-symbols-outlined text-white text-3xl mb-4 p-2 bg-white/20 rounded-xl">
            add_circle
          </span>
          <h3 className="text-white font-black text-lg leading-tight">
            Nueva
            <br />
            Consulta
          </h3>
          <p className="text-blue-100 text-xs font-black uppercase tracking-widest mt-2 bg-blue-500/30 px-2 py-1 rounded inline-block">
            Registrar Síntomas
          </p>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Log */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600">
                history
              </span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Bitácora de Atención Médica
              </h3>
            </div>
            <button
              onClick={() => setCurrentModule(AppModule.REPORTES)}
              className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest"
            >
              Ver Todo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-black border-b border-slate-200">
                  <th className="px-6 py-4 tracking-widest">Horario</th>
                  <th className="px-6 py-4 tracking-widest">
                    Nombre del Alumno
                  </th>
                  <th className="px-6 py-4 tracking-widest">Grado/Grupo</th>
                  <th className="px-6 py-4 tracking-widest">Motivo</th>
                  <th className="px-6 py-4 text-right tracking-widest">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentVisits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <p className="text-slate-400 font-bold text-sm uppercase italic">
                        No hay registros para este periodo
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5 text-slate-600 font-black text-xs font-mono tracking-tighter">
                        {new Date(visit.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors uppercase italic">
                          {visit.studentName}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                          {visit.group}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                          {visit.type}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-black text-xs uppercase">
                          Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Quick Search */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">
                person_search
              </span>
              Búsqueda de Alumno
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Matrícula o Nombre..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-10"
              />
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-400 text-[20px]">
                search
              </span>
            </div>
          </div>

          {/* Protocol Widget */}
          {supportProtocol && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group mb-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl">
                  medical_services
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">
                    Material de Apoyo
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-tight mb-2">
                  {supportProtocol.titulo}
                </h3>
                <p className="text-purple-100 text-xs mb-4 line-clamp-2">
                  {supportProtocol.objetivo}
                </p>
                <button
                  onClick={() => setShowProtocol(true)}
                  className="w-full py-2.5 bg-white text-purple-700 font-bold text-sm rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    menu_book
                  </span>
                  Consultar Protocolo
                </button>
              </div>
            </div>
          )}

          {/* Inventory */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  inventory_2
                </span>
                Control de Insumos
              </h3>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <span className="material-symbols-outlined text-[18px]">
                  sync
                </span>
              </button>
            </div>

            <InventoryList />

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => toast("Solicitud enviada", { icon: "🚚" })}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                  local_shipping
                </span>
                Solicitar Suministros
              </button>
            </div>
          </div>
        </div>
      </div>
      {showProtocol && supportProtocol && (
        <ProtocolDetailModal
          protocol={supportProtocol}
          onClose={() => setShowProtocol(false)}
        />
      )}
    </div>
  );
};

const HealthStat = ({ label, value, desc, icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    red: "text-red-700 bg-red-50 border-red-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
  };
  return (
    <div
      className={`p-6 rounded-2xl border-2 ${colors[color]} shadow-sm group hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="material-symbols-outlined text-2xl opacity-60 group-hover:scale-110 transition-transform">
          {icon}
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
          {label}
        </span>
      </div>
      <div>
        <p className="text-4xl font-black text-slate-800 mb-1">{value}</p>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1 flex items-center gap-1.5">
          <span className="size-1.5 bg-slate-400 rounded-full"></span>
          {desc}
        </p>
      </div>
    </div>
  );
};

const InventoryList = () => {
  const [items, setItems] = React.useState([
    { id: 1, name: "Paracetamol 500mg", quantity: 12, max: 20 },
    { id: 2, name: "Vendas elásticas", quantity: 4, max: 20 },
    { id: 3, name: "Alcohol Etílico", quantity: 18, max: 20 },
    { id: 4, name: "Gasas estériles", quantity: 8, max: 50 },
  ]);

  const updateStock = (id: number, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const percentage = (item.quantity / item.max) * 100;
        const isLow = percentage < 30;
        return (
          <div key={item.id} className="group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase">
                {item.name}
              </span>
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => updateStock(item.id, -1)}
                  className="size-6 flex items-center justify-center hover:bg-white rounded text-slate-400"
                >
                  -
                </button>
                <span
                  className={`text-xs font-black w-20 text-center ${
                    isLow ? "text-red-700 bg-red-50" : "text-slate-800 bg-white"
                  } p-1 rounded border border-slate-100 shadow-sm`}
                >
                  {item.quantity} / {item.max}
                </span>
                <button
                  onClick={() => updateStock(item.id, 1)}
                  className="size-6 flex items-center justify-center hover:bg-white rounded text-slate-400"
                >
                  +
                </button>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isLow ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
