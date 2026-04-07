import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import { CaseState, CaseLabels, Solicitud, SolicitudPriority } from "../types";
import toast from "react-hot-toast";

import { useAuth } from "./AuthProvider";
import { PanelSolicitudes } from "./PanelSolicitudes";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">Archivo Digital</h1>
          <p className="text-slate-500 font-medium tracking-tight">Gestión de expedientes y repositorio institucional seguro.</p>
        </div>

        {activeTab === "files" && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploading}
              />
              <GlassButton
                loading={uploading}
                size="sm"
                className="px-6"
              >
                <span className="material-icons mr-2 text-sm">cloud_upload</span>
                {uploading ? "Subiendo..." : "Subir Documento"}
              </GlassButton>
            </div>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={fetchFiles}
              className="px-4"
            >
              <span className="material-icons text-sm">refresh</span>
            </GlassButton>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <GlassCard className="p-4" title="Categorías" icon="folder_open">
            <div className="space-y-1 mt-4">
              {[
                { id: "students", label: "Expedientes", icon: "badge" },
                { id: "files", label: "Bóveda Nube", icon: "cloud" },
                { id: "requests", label: "Solicitudes", icon: "mail" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-lg">{tab.icon}</span>
                    <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                  </div>
                  {activeTab !== tab.id && (
                    <span className="material-icons text-lg opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Almacenamiento</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">60%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[60%]"></div>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="lg:col-span-3 flex flex-col h-full overflow-hidden p-0 border border-slate-200">
          <AnimatePresence mode="wait">
            {activeTab === "requests" ? (
              <motion.div
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-auto"
              >
                <PanelSolicitudes />
              </motion.div>
            ) : activeTab === "students" ? (
              <motion.div
                key="students"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="p-4 border-b border-slate-100">
                  <GlassInput
                    placeholder="Buscar expediente o matrícula..."
                    icon="search"
                    className="max-w-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-6 py-4">Alumno</th>
                        <th className="px-6 py-4">Información</th>
                        <th className="px-6 py-4">Estado Actual</th>
                        <th className="px-6 py-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStudents.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">
                                {s.name.substring(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm tracking-tight">{s.name}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ESTUDIANTE REGISTRADO</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                <span className="material-icons text-sm opacity-60">fingerprint</span>
                                {s.matricula}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                <span className="material-icons text-sm opacity-60">group</span>
                                Grupo {s.group}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              s.caseState === CaseState.CERRADO
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-orange-50 text-orange-600 border-orange-100"
                            }`}>
                              {CaseLabels[s.caseState]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <GlassButton
                              size="sm"
                              className="!rounded-lg text-[9px]"
                              onClick={() => toast(`Accediendo al expediente de ${s.name.split(" ")[0]}`)}
                            >
                              Abrir Expediente
                            </GlassButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="files"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Repositorio Institucional</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Bóveda Digital SASE-310 • Encriptación AES-256
                  </p>
                </div>

                <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                  {loadingFiles ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="size-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-slate-500">Sincronizando con la nube...</p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <span className="material-icons text-6xl mb-4 opacity-20">cloud_off</span>
                      <p className="font-bold uppercase tracking-widest text-xs">Sin archivos cargados</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {files.map((file, idx) => {
                        const student = getStudentNameFromFileName(file.name);
                        const isDoc = file.name.match(/\.(pdf|doc|docx)$/i);
                        return (
                          <div key={file.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`size-12 rounded-xl flex items-center justify-center ${isDoc ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                <span className="material-icons text-2xl">{isDoc ? 'description' : 'image'}</span>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={getFileUrl(file.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="size-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                >
                                  <span className="material-icons text-sm">visibility</span>
                                </a>
                              </div>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 truncate mb-1" title={file.name}>{file.name}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {student ? student.name : "Archivo General"}
                              </p>
                              <p className="text-[9px] font-bold text-slate-300">{(file.metadata?.size / 1024).toFixed(0)} KB</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </motion.div>
  );
};
