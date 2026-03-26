import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabase/client";
import { useApp } from "../../store";
import toast from "react-hot-toast";
import { SaseSplineOrb } from "../SaseSplineOrb";
import { generateSecureToken } from "../../utils/security";

/**
 * IA-SASE Intelligence Dashboard
 * Terminal de análisis biónico para el sistema SASE-310.
 */

// --- MICRO-COMPONENTS ---

const DataNode = ({ label, value, subValue, trend, icon, color = "indigo" }: any) => {
  const colorMap: any = {
    indigo: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
    rose: "border-rose-500/20 text-rose-400 bg-rose-500/5",
    amber: "border-amber-500/20 text-amber-400 bg-amber-500/5",
    emerald: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
    gold: "border-yellow-500/20 text-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]",
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-6 border rounded-3xl ${colorMap[color]} relative overflow-hidden group transition-all duration-500`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-md">{value}</h3>
        {trend && <span className="text-[10px] font-bold text-emerald-500">{trend}</span>}
      </div>
      {subValue && <p className="text-[10px] font-bold mt-1 opacity-40 uppercase tracking-widest">{subValue}</p>}
      
      {/* Laser line effect */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
    </motion.div>
  );
};

export const DashboardIntelligence = () => {
  const { students } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    criticalTime: "07:15 - 08:30",
    topIncidents: [],
    groupRisk: [],
    riskDistribution: { red: 0, gold: 0, yellow: 0, blue: 0, green: 0 }
  });

  useEffect(() => {
    const fetchIntelligenceData = async () => {
      try {
        setLoading(true);
        
        // 1. Calcular distribución de riesgo desde los datos de 'students' en el store
        const dist = { red: 0, gold: 0, yellow: 0, blue: 0, green: 0 };
        students.forEach((s: any) => {
          const st = s.estadoSemaforo || s.caseState;
          if (st === "INTERVENCION") dist.gold++;
          else if (st === "EN_ANALISIS") dist.red++;
          else if (st === "PATRON_DETECTADO") dist.yellow++;
          else if (st === "OBSERVADO") dist.blue++;
          else dist.green++;
        });

        // 2. Obtener grupos con mayor riesgo (promedio)
        const groupsMap: any = {};
        students.forEach((s: any) => {
          if (!groupsMap[s.group]) groupsMap[s.group] = { total: 0, count: 0, name: s.group };
          groupsMap[s.group].total += (s.puntajeRiesgo || 0);
          groupsMap[s.group].count++;
        });
        
        const groupRisk = Object.values(groupsMap)
          .map((g: any) => ({ ...g, avg: g.total / g.count }))
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 5);

        // 3. Obtener incidencias más frecuentes (desde v_data_engine)
        const { data: incidentStats, error: incError } = await supabase
          .from("v_data_engine" as any)
          .select("tipo_evento, dimension")
          .limit(100);

        const counts: any = {};
        incidentStats?.forEach((i: any) => {
          counts[i.tipo_evento] = (counts[i.tipo_evento] || 0) + 1;
        });

        const topIncidents = Object.entries(counts)
          .map(([type, count]) => ({ type, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        setStats({
          riskDistribution: dist,
          groupRisk,
          topIncidents,
          criticalTime: "07:15 - 08:30" // Placeholder for now or logic to detect most common hour
        });

      } catch (err) {
        console.error("Error fetching intelligence data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntelligenceData();
  }, [students]);

  const highRiskStudents = useMemo(() => {
    return [...students]
      .filter(s => (s.puntajeRiesgo || 0) > 30)
      .sort((a, b) => (b.puntajeRiesgo || 0) - (a.puntajeRiesgo || 0))
      .slice(0, 10);
  }, [students]);

  return (
    <div className="flex-1 min-h-screen p-8 bg-transparent relative overflow-hidden custom-scrollbar pb-32">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/[0.02] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-12 bg-gradient-to-r from-indigo-500 to-transparent"></span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">
                S.A.S.E BIOMETRIC INTELLIGENCE // UNIT_IA
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
              TERMINAL <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">IA</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Estado Operativo</p>
              <p className="text-xs font-black text-emerald-400 italic">ANALIZANDO_PATRONES</p>
            </div>
            <div className="size-10 rounded-full border border-indigo-500/20 flex items-center justify-center relative overflow-hidden bg-black/40">
              <SaseSplineOrb state="thinking" className="w-12 h-12 -m-1" />
            </div>
          </div>
        </div>

        {/* NUCLEO DE DATOS - KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DataNode 
            label="Casos Intervención" 
            value={stats.riskDistribution.gold} 
            subValue="Prioridad Máxima"
            icon="workspace_premium" 
            color="gold" 
          />
          <DataNode 
            label="Alerta Crítica" 
            value={stats.riskDistribution.red} 
            subValue="Atención Urgente"
            icon="emergency_home" 
            color="rose" 
          />
          <DataNode 
            label="Patrones Detectados" 
            value={stats.riskDistribution.yellow} 
            subValue="Seguimiento Preventivo"
            icon="analytics" 
            color="amber" 
          />
          <DataNode 
            label="Hora de Riesgo" 
            value={stats.criticalTime} 
            subValue="Pico de Incidencias"
            icon="schedule" 
            color="indigo" 
          />
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ZONA DE ALTA TENSIÓN (Top Risk Students) */}
          <div className="lg:col-span-8 card-sase p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <span className="material-symbols-outlined text-9xl">person_alert</span>
            </div>
            
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-2">
                <span className="size-2 bg-rose-500 rounded-full animate-pulse"></span>
                ZONA_DE_ALTA_TENSIÓN
              </h3>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Top 10 Riesgo Institucional</span>
            </div>

            <div className="space-y-3">
              {highRiskStudents.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">No se detectan alumnos en riesgo crítico</p>
                </div>
              ) : (
                highRiskStudents.map((s: any, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={s.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group/row"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center font-black text-white italic text-lg tracking-tighter">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight group-hover/row:text-indigo-400 transition-colors">{s.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.group} • {s.matricula}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, s.puntajeRiesgo)}%` }}
                            className={`h-full ${s.puntajeRiesgo > 50 ? 'bg-rose-500' : 'bg-amber-500'}`}
                          />
                        </div>
                        <span className="text-lg font-black text-white italic tabular-nums">{Math.round(s.puntajeRiesgo || 0)}</span>
                      </div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Puntaje Biométrico</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* MATRIZ DE RIESGO GRUPAL */}
          <div className="lg:col-span-4 space-y-8">
            
            <div className="card-sase p-8 border-indigo-500/10 bg-indigo-500/[0.01]">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] italic mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">groups</span>
                RIESGO_POR_GRUPO
              </h3>
              
              <div className="space-y-6">
                {stats.groupRisk.map((g: any, i: number) => (
                  <div key={g.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-white italic tracking-tighter">{g.name}</span>
                      <span className="text-xs font-black text-indigo-500 italic tabular-nums">{Math.round(g.avg)} pts</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, g.avg * 2)}%` }} // Escala para visualización
                        className="h-full bg-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-sase p-8 border-amber-500/10 bg-amber-500/[0.01]">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-[0.3em] italic mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                NODO_DE_INCIDENCIAS
              </h3>
              
              <div className="space-y-4">
                {stats.topIncidents.map((inc: any, i: number) => (
                  <div key={inc.type} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight line-clamp-1 flex-1">{inc.type}</span>
                    <span className="text-xs font-black text-amber-500 italic ml-4">{inc.count} evt</span>
                  </div>
                ))}
                {stats.topIncidents.length === 0 && (
                  <p className="text-[10px] uppercase font-black text-slate-700 text-center py-4">Sin datos históricos</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER SYSTEM INFO */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 italic">
            SASE ENGINE v4.0.1 // BIOMETRIC_RECONSTRUCTION_ACTIVE
          </p>
          <div className="flex gap-6">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CPU_LOAD: 12%</span>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">NETWORK: SECURE</span>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">HASH: {generateSecureToken(10)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
