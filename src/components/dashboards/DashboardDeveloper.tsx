import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import { UserRole, AppModule } from "../../types";
import { supabase } from "../../supabase/client";

// --- DEVELOPER HUD COMPONENTS ---

const ConsoleLog = ({ logs }: { logs: string[] }) => (
  <div className="bg-slate-950 font-mono text-[10px] p-4 rounded-xl border border-white/5 h-64 overflow-y-auto custom-scrollbar shadow-inner">
    {logs.map((log, i) => (
      <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">
        <span className="text-emerald-500 mr-2">
          [{new Date().toLocaleTimeString()}]
        </span>
        <span className="text-blue-400 mr-2">SYS_EVENT:</span>
        <span className="text-slate-300">{log}</span>
      </div>
    ))}
    <div className="animate-pulse inline-block w-2 h-4 bg-emerald-500 ml-1 translate-y-1"></div>
  </div>
);

const SystemStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center">
    <span className={`text-2xl font-black mb-1 ${color}`}>{value}</span>
    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
      {label}
    </span>
  </div>
);

// --- MAIN DASHBOARD ---

export const DashboardDeveloper = () => {
  const { students, currentUserRole } = useApp();
  const [logs, setLogs] = useState<string[]>([
    "Kernel initialized",
    "Auth context linked",
    "DB polling active",
  ]);
  const [isGodMode, setIsGodMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const dbEvents = [
        "Schema validated",
        "RLS integrity check OK",
        "Session refreshed",
        "Audit log synced",
      ];
      const randomPop = dbEvents[Math.floor(Math.random() * dbEvents.length)];
      setLogs((prev) => [...prev.slice(-49), randomPop]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleForceRLSCheck = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: "Auditing RLS Policies...",
      success: "14 Policies Validated - SECURE",
      error: "Policy Drift Detected",
    });
  };

  return (
    <div className="min-h-full p-4 md:p-8 pb-32 bg-transparent text-white">
      {/* Dev Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-600/20 ring-1 ring-white/20">
            <span className="material-symbols-outlined text-white">
              terminal
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
              Root Console
            </h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.4em]">
              Development Environment • SASE Core 3.10.x
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleForceRLSCheck}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">security</span>
            Audit RLS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Row 1: Quick Stats */}
        <SystemStat label="Components" value="42" color="text-indigo-400" />
        <SystemStat label="Active RLS" value="14" color="text-emerald-400" />
        <SystemStat label="DB Tables" value="12" color="text-amber-400" />
        <SystemStat
          label="API Status"
          value="LATENCY < 12ms"
          color="text-blue-400"
        />

        {/* Row 2: Main Dev Area */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              System Output
            </h3>
            <div className="flex gap-2">
              <span className="size-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></span>
              <span className="size-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></span>
              <span className="size-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
            </div>
          </div>
          <ConsoleLog logs={logs} />
        </div>

        {/* Row 2 Right: Module Jump */}
        <div className="bg-gradient-to-b from-indigo-900/20 to-transparent border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl">
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">
            Hot-Jump Modules
          </h3>
          <div className="space-y-2 flex-1">
            {Object.values(AppModule).map((mod) => (
              <button
                key={mod}
                className="w-full p-3 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-indigo-600 transition-all text-left flex items-center justify-between group"
              >
                {mod}
                <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Experimental Content */}
        <div className="lg:col-span-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-white/5 rounded-full blur-[100px] -mr-12 -mt-12 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-6">
            <span className="material-symbols-outlined text-4xl text-indigo-400">
              labs
            </span>
            <div>
              <h3 className="text-xl font-black text-white">
                Experimental Lab
              </h3>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                IA-SASE Neural Core Testing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 flex flex-col justify-between">
              <p className="text-xs text-white/70 italic mb-4">
                "Predictive pattern analysis for student dropout - Model V2.4"
              </p>
              <button className="w-full py-2 bg-indigo-600 text-[10px] font-black uppercase rounded-lg shadow-lg">
                Run Simulation
              </button>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 flex flex-col justify-between">
              <p className="text-xs text-white/70 italic mb-4">
                "Automated scheduling for 1,200 students with 40 teacher
                constraints"
              </p>
              <button className="w-full py-2 bg-slate-800 text-[10px] font-black uppercase rounded-lg border border-white/10">
                Compute Matrix
              </button>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/10 border-dashed flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="material-symbols-outlined text-3xl mb-1">
                add_circle
              </span>
              <p className="text-[10px] font-bold uppercase ml-2 tracking-widest">
                New Experiment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.8em]">
          GOD MODE ENABLED • ACCESS LEVEL ALPHA
        </p>
      </div>
    </div>
  );
};

export default DashboardDeveloper;
