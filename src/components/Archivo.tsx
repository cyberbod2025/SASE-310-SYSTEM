import React, { useState, useEffect } from "react";
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
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    try {
      const { error } = await supabase.storage
        .from("documentos_salud")
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      alert("Archivo subido correctamente");
      fetchFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error.message);
      alert("Error al subir el archivo: " + error.message);
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
    // Convention: studentId_timestamp.ext
    const possibleId = fileName.split("_")[0];
    const student = students.find((s) => s.id === possibleId);
    return student; // Return full object or undefined
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("documentos_salud")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            Expediente Digital
          </h2>
          <p className="text-text-secondary">
            Información y Documentación del Alumnado
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === "students"
                ? "bg-white shadow text-text-main"
                : "text-text-secondary hover:bg-gray-200"
            }`}
          >
            Expedientes del Alumnado
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === "files"
                ? "bg-white shadow text-text-main"
                : "text-text-secondary hover:bg-gray-200"
            }`}
          >
            Repositorio en la Nube
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === "requests"
                ? "bg-white shadow text-text-main"
                : "text-text-secondary hover:bg-gray-200"
            }`}
          >
            Solicitudes y Comunicados
          </button>
        </div>
      </div>

      {activeTab === "requests" && <PanelSolicitudes />}

      {activeTab === "students" ? (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border-color shadow-sm">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Buscar por nombre o matrícula..."
                className="pl-10 pr-4 py-2 border border-border-color rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                search
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-color shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Alumno
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Matrícula
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Grupo
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Estatus
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {s.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-text-main">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-black text-slate-600">
                      {s.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm">{s.group}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase ${
                          s.caseState === CaseState.CERRADO
                            ? "bg-green-100 text-green-800 border-green-200"
                            : s.caseState === CaseState.OBSERVADO
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {s.caseState}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          alert(
                            `Funcionalidad en desarrollo: Detalles de ${s.name}`,
                          )
                        }
                        className="text-blue-700 hover:text-blue-900 text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4"
                      >
                        Ver Expediente
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No se encontraron expedientes.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-border-color shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">
              Documentos en la Nube (Supabase Storage)
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0]"
                  disabled={uploading}
                  title="Subir archivo"
                />
                <button
                  disabled={uploading}
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    cloud_upload
                  </span>
                  {uploading ? "Subiendo..." : "Subir Archivo"}
                </button>
              </div>

              <button
                onClick={fetchFiles}
                className="text-primary text-sm font-bold hover:underline flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  refresh
                </span>{" "}
                Actualizar
              </button>
            </div>
          </div>

          {loadingFiles ? (
            <div className="p-10 text-center text-gray-400">
              Cargando archivos...
            </div>
          ) : files.length === 0 ? (
            <div className="p-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              La bandeja 'documentos_salud' está vacía.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const student = getStudentNameFromFileName(file.name);
                return (
                  <div
                    key={file.id}
                    className="border border-gra-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <span className="material-symbols-outlined">
                          description
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p
                          className="font-bold text-text-main text-sm truncate w-full"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {student ? (
                            <span className="text-blue-600 font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">
                                person
                              </span>
                              {student.name}
                            </span>
                          ) : (
                            "Sin asignar"
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {(file.metadata?.size / 1024).toFixed(1)} KB •{" "}
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getFileUrl(file.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        Ver Archivo
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
