import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import { CaseState, CaseLabels, CaseLabels, Solicitud, SolicitudPriority } from "../types";
import toast from "react-hot-toast";

import { useAuth } from "./AuthProvider";
import { PanelSolicitudes } from "./PanelSolicitudes";
import { GlassCard } from "./ui/GlassCard";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      {/* ENCABEZADO Y ACCION PRINCIPAL */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Archivo Digital
          </h1>
          <p className="text-slate-400 text-sm">
            Gestion de expedientes, almacenamiento en nube y solicitudes.
          </p>
        </div>

        {activeTab === "files" && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
                title="Subir documento"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={uploading}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] font-medium text-sm ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="material-icons text-sm">cloud_upload</span>
                {uploading ? "Sincronizando..." : "Subir Documento"}
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchFiles}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <span className="material-icons text-sm">refresh</span>
              Actualizar
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* PANEL LATERAL */}
        <GlassCard className="lg:col-span-1 flex flex-col h-fit">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-icons text-blue-400 text-sm">folder_open</span>
            Categorias
          </h2>

          <div className="space-y-2">
            {[
              { id: "students", label: "Expedientes", icon: "badge" },
              { id: "files", label: "Nube", icon: "cloud" },
              { id: "requests", label: "Solicitudes", icon: "mail" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/10 text-slate-300 transition-colors cursor-pointer text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500/40 text-white"
                    : ""
                }`}
              >
                <span className="material-icons text-sm">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-2 flex items-center justify-between">
              <span>Almacenamiento</span>
              <span className="text-blue-400 font-medium">Seguro</span>
            </p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[60%] shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            </div>
          </div>
        </GlassCard>

        {/* AREA PRINCIPAL */}
        <GlassCard className="lg:col-span-3 flex flex-col h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "requests" ? (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1"
              >
                <PanelSolicitudes />
              </motion.div>
            ) : activeTab === "students" ? (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col h-full"
              >
                <div className="mb-4 pb-4 border-b border-white/10 flex gap-4">
                  <div className="flex-1 relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar expediente o matricula..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-4">Alumno</th>
                        <th className="px-6 py-4">Matricula</th>
                        <th className="px-6 py-4">Grupo</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] text-slate-300">
                      {filteredStudents.map((s, idx) => (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          key={s.id}
                          className="hover:bg-indigo-500/[0.02] transition-colors group/row"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-black text-xs">
                                {s.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm group-hover/row:text-indigo-400 transition-colors">
                                  {s.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                                  ID_{s.id.substring(0, 8).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                              {s.matricula}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-[#0a0f18] border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {s.group}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-[10px] font-bold border uppercase tracking-widest ${
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
                              {CaseLabels[s.caseState]}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => toast("Cargando expediente...")}
                              className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                            >
                              Abrir Boveda
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="p-10 text-center text-slate-500">
                      No se encontraron expedientes.
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
                className="flex flex-col h-full"
              >
                <div className="mb-4 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Repositorio en Nube
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Almacenamiento Supabase // Contenedor: documentos_salud
                    </p>
                  </div>
                </div>

                {loadingFiles ? (
                  <div className="p-10 text-center flex flex-col items-center gap-4 text-slate-500">
                    <div className="size-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    Cargando archivos...
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">
                    No hay archivos en el repositorio.
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                    {files.map((file, idx) => {
                      const student = getStudentNameFromFileName(file.name);
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={file.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-blue-500/30 hover:bg-white/5 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                              <span className="material-icons text-xl">
                                {file.name.match(/\.(pdf|doc|docx)$/i)
                                  ? "description"
                                  : "image"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                {student ? student.name : "Sin asignar"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">
                              {(file.metadata?.size / 1024).toFixed(1)} KB
                            </span>
                            <a
                              href={getFileUrl(file.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 group-hover:text-blue-400 transition-colors p-2 hover:bg-blue-500/10 rounded-2xl"
                            >
                              <span className="material-icons text-sm">
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
        </GlassCard>
      </div>
    </motion.div>
  );
};
