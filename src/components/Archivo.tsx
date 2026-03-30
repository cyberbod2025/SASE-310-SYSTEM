import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import { CaseState, Solicitud, SolicitudPriority } from "../types";
import toast from "react-hot-toast";

import { useAuth } from "./AuthProvider";
import { PanelSolicitudes } from "./PanelSolicitudes";

export const Archivo: React.FC = () => {
  const { students } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "files" | "requests">(
    "students",
  );
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricula.includes(search),
  );

  useEffect(() => {
    if (activeTab === "files") {
      fetchFiles();
    }
  }, [activeTab]);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    setUploading(true);
    const file = event.target.files[0];
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    try {
      const { error } = await supabase.storage
        .from("documentos_salud")
        .upload(fileName, file);

      if (error) throw error;

      toast.success("Archivo sincronizado con la bóveda digital");
      fetchFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error.message);
      toast.error("Fallo en la sincronización: " + error.message);
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset input
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase.storage
      .from("documentos_salud")
      .list();
    if (error) {
      console.error("Error fetching files:", error);
    } else {
      setFiles(data || []);
    }
    setLoadingFiles(false);
  };

  const getStudentNameFromFileName = (fileName: string) => {
    const possibleId = fileName.split("_")[0];
    return students.find((s) => s.id === possibleId);
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("documentos_salud")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-32">
      {/* TACTICAL HEADER */}
      <div className="card-sase p-6 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-2xl">
            <span className="material-symbols-outlined text-4xl font-black">
              inventory_2
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
              EXPEDIENTE <span className="text-indigo-500">DIGITAL</span>
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">
              BÓVEDA CENTRAL DE DATOS // SASE-310
            </p>
          </div>
        </div>

        <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-xl">
          {[
            { id: "students", label: "EXPEDIENTES", icon: "badge" },
            { id: "files", label: "NUBE", icon: "cloud" },
            { id: "requests", label: "SOLICITUDES", icon: "mail" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "requests" ? (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PanelSolicitudes />
          </motion.div>
        ) : activeTab === "students" ? (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* SEARCH TACTICAL */}
            <div className="card-sase p-6 border-white/5 bg-white/[0.01]">
              <div className="relative group max-w-lg">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  search
                </span>
                <input
                  type="text"
                  placeholder="FILTRAR POR NOMBRE O MATRÍCULA..."
                  className="input-sase pl-14 h-14 text-[11px] font-black tracking-widest"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* DATA STREAM TERMINAL (TABLE) */}
            <div className="card-sase border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                    <th className="px-8 py-5"># IDENTIDAD // ALUMNO</th>
                    <th className="px-8 py-5">MATRÍCULA</th>
                    <th className="px-8 py-5">ZONA_GRUPO</th>
                    <th className="px-8 py-5">STATUS_CODE</th>
                    <th className="px-8 py-5 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredStudents.map((s, idx) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      key={s.id}
                      className="hover:bg-indigo-500/[0.02] transition-colors group/row"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-black text-xs italic tracking-tighter">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-white text-sm italic uppercase tracking-tighter group-hover/row:text-indigo-400 transition-colors">
                              {s.name}
                            </p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                              ID_{s.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-black text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          {s.matricula}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-[#0a0f18] border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {s.group}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${
                            s.caseState === CaseState.CERRADO
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : s.caseState === CaseState.OBSERVADO
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}
                        >
                          <div
                            className={`size-1.5 rounded-full ${
                              s.caseState === CaseState.CERRADO
                                ? "bg-emerald-500"
                                : s.caseState === CaseState.OBSERVADO
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                          ></div>
                          {s.caseState}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => toast("Cargando Expediente...")}
                          className="px-5 py-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                        >
                          Abrir Bóveda
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="p-20 text-center opacity-40">
                  <span className="material-symbols-outlined text-5xl mb-4">
                    search_off
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    No se encontraron expedientes
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-sase p-8 border-white/5 bg-white/[0.01] space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Repositorio <span className="text-amber-500">Cloud</span>
                </h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">
                  SUPABASE_STORAGE // BUCKET: DOCUMENTOS_SALUD
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                    title="Subir"
                  />
                  <button
                    disabled={uploading}
                    className={`px-8 py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all flex items-center gap-3 active:scale-95 ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      cloud_upload
                    </span>
                    {uploading ? "SINCRONIZANDO..." : "CARGAR ARCHIVO"}
                  </button>
                </div>

                <button
                  onClick={fetchFiles}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                </button>
              </div>
            </div>

            {loadingFiles ? (
              <div className="p-20 text-center flex flex-col items-center gap-6 opacity-40">
                <div className="size-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                  Descifrando stream de datos...
                </p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-6 border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                <span className="material-symbols-outlined text-6xl">
                  inventory
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  Repositorio vacío // Standby
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {files.map((file, idx) => {
                  const student = getStudentNameFromFileName(file.name);
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      key={file.id}
                      className="card-sase p-6 bg-white/[0.02] border-white/5 hover:border-amber-500/30 group relative overflow-hidden flex flex-col justify-between min-h-[180px]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl font-black">
                            {file.name.match(/\.(pdf|doc|docx)$/i)
                              ? "description"
                              : "image"}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-600 font-bold uppercase">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-6 mb-2">
                        <p
                          className="text-xs font-black text-white uppercase italic tracking-tight truncate mb-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-1.5 rounded-full ${student ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-slate-700"}`}
                          ></div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
                            {student ? student.name : "SIN_ASIGNAR"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-600 uppercase font-black">
                          {(file.metadata?.size / 1024).toFixed(1)} KB
                        </span>
                        <a
                          href={getFileUrl(file.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                        >
                          Ver Archivo
                          <span className="material-symbols-outlined text-sm">
                            open_in_new
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
