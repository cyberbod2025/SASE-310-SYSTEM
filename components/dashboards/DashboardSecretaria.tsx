import React, { useState, useRef } from "react";
import { useApp } from "../../store";
import toast from "react-hot-toast";
import { CaseState, AppModule, Student } from "../../types";
import { Inscripciones } from "../Inscripciones";
import { Archivo } from "../Archivo";
import { CICLO_ESCOLAR } from "../../config/sase.config";
import { useAuth } from "../AuthProvider";
import { StudentAdvancedPanel } from "../StudentAdvancedPanel";

export const DashboardSecretaria = () => {
  const {
    students,
    logAccess,
    logAudit,
    importStudents,
    currentModule,
    updateStudentAudit,
  } = useApp();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUserName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Secretaria/o";
  const activeUserRole = "Control Escolar";

  if (currentModule === AppModule.INSCRIPCIONES) return <Inscripciones />;
  if (currentModule === AppModule.ARCHIVO) return <Archivo />;

  const handleEdit = (id: string) => {
    const student = students.find((s) => s.id === id);
    setEditingId(id);
    logAccess(
      `Consultar Expediente (Usuario: ${activeUserName})`,
      id,
      student?.name,
    );
  };

  const handleSaveAudit = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);

    await logAudit(
      "ACTUALIZACION",
      `Expediente modificado por ${activeUserName} (${activeUserRole})`,
      "alumnos",
      studentId,
      student?.name,
      null,
      { modifiedBy: activeUserName, modifiedAt: new Date().toISOString() },
    );

    updateStudentAudit(studentId, activeUserName);
    toast.success(`[AUDITORÍA] Cambios guardados por: ${activeUserName}`);
    setEditingId(null);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const loadingToast = toast.loading("Validando CURPs y cargando datos...");
      setTimeout(() => {
        const mockNewStudents: Student[] = [
          {
            id: `imp-${Date.now()}`,
            matricula: "2024-NEW1",
            name: "Alejandra Martínez (Importada)",
            group: "1º A",
            avatar: "https://i.pravatar.cc/150?u=99",
            caseState: CaseState.OBSERVADO,
            incidents: [],
            justificantes: [],
          },
        ];
        importStudents(mockNewStudents);
        toast.success("Importación exitosa: 1 registro nuevo añadido.", {
          id: loadingToast,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1000);
    }
  };

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500"></div>
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
              <span className="material-symbols-outlined text-3xl">desk</span>
            </div>
          </div>
          <div>
            <h1
              id="secretaria-header"
              className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"
            >
              Secretaría Escolar
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-cyan-700">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                Control Escolar
              </span>
              <span className="text-slate-300">|</span>
              <span>Expedientes y Auditoría</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
          <div className="flex flex-col items-end px-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Sesión de Auditoría
            </span>
            <span className="text-xs font-black text-slate-800 uppercase">
              {activeUserName}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm uppercase">
            {activeUserName.substring(0, 2)}
          </div>
        </div>
      </div>

      {/* Access Badge & Context */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-[20px]">
            verified_user
          </span>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
            Nivel de Acceso:{" "}
            <span className="text-emerald-700">Total (Supervisado)</span>
          </p>
        </div>
        <div className="hidden md:block w-px h-4 bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">policy</span>
          Bitácora Activa: Toda consulta de expediente queda registrada
          institucionalmente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Data Import Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Carga Masiva
              </h3>
              <p className="text-xs font-black text-slate-500 mt-1 uppercase tracking-widest">
                Layout SEP / Excel / CSV
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 group-hover:text-cyan-600 group-hover:border-cyan-200 transition-colors">
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            Seleccionar Archivo
          </button>
        </div>

        {/* Info Card */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex gap-6 items-center">
            <div className="size-16 rounded-2xl bg-cyan-50 flex items-center justify-center border border-cyan-100 text-cyan-600 shadow-inner">
              <span className="material-symbols-outlined text-4xl">school</span>
            </div>
            <div>
              <h3 className="text-slate-800 font-black text-xl uppercase tracking-tighter italic">
                Total de Matrícula
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                {CICLO_ESCOLAR.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-5xl font-black text-slate-800 tabular-nums">
              {students.length}
            </span>
            <span className="text-xs font-black text-cyan-700 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded border border-cyan-100">
              Registros Activos
            </span>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div
        id="secretaria-list"
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <span className="material-symbols-outlined text-cyan-600">
              folder_shared
            </span>
            Directorio Estudiantil Institucional
          </h3>

          <div id="secretaria-search" className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="BUSCAR NOMBRE O MATRÍCULA..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-black text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all uppercase"
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll(".student-row");
                rows.forEach((row) => {
                  const text = row.textContent?.toLowerCase() || "";
                  (row as HTMLElement).style.display = text.includes(term)
                    ? ""
                    : "none";
                });
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
                folder_off
              </span>
              <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">
                Base de datos local vacía
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Estudiante
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Grupo / Matrícula
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Estado Administrativo
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest">
                    Detalle Tutor
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest text-center">
                    Protocolo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="student-row hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={student.avatar}
                          alt=""
                          className="size-10 rounded-full border border-slate-200 shadow-sm"
                        />
                        <span className="font-black text-slate-800 uppercase italic text-sm group-hover:text-cyan-700 transition-colors">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-black text-slate-700">
                        {student.group}
                      </p>
                      <p className="font-bold text-slate-500 mt-0.5 tracking-tight">
                        {student.matricula}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase ${
                          student.caseState === CaseState.CERRADO
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : student.caseState === CaseState.OBSERVADO
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            student.caseState === CaseState.CERRADO
                              ? "bg-emerald-500"
                              : student.caseState === CaseState.OBSERVADO
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        ></span>
                        {student.caseState}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student.id ? (
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg animate-fade-in-up scale-100 max-w-xs ring-4 ring-cyan-500/10">
                          <h4 className="text-xs font-black text-cyan-700 uppercase mb-3 border-b border-cyan-50 pb-2">
                            Expediente del Tutor
                          </h4>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-800 uppercase italic">
                              {student.guardianInfo?.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase">
                              <span className="material-symbols-outlined text-sm text-cyan-600">
                                call
                              </span>
                              {student.guardianInfo?.phonePrimary}
                            </div>
                            <p className="text-[10px] font-black text-slate-500 italic mt-1 leading-tight">
                              {student.guardianInfo?.address ||
                                "Domicilio no suministrado"}
                            </p>
                          </div>
                          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-2 text-xs font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
                            >
                              Cerrar
                            </button>
                            <button
                              onClick={() => handleSaveAudit(student.id)}
                              className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-black uppercase hover:bg-cyan-700 shadow-md transition-all active:scale-95"
                            >
                              Auditar y Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="material-symbols-outlined text-[18px]">
                            lock_person
                          </span>
                          <span className="text-xs font-black uppercase tracking-widest italic">
                            Confidencial
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowAdvancedPanel(true);
                          }}
                          className={`p-2 rounded-lg transition-all border ${
                            showAdvancedPanel &&
                            selectedStudent?.id === student.id
                              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-inner"
                              : "bg-white text-slate-400 hover:text-blue-600 border-slate-200 hover:border-blue-300"
                          }`}
                          title="Gestión Avanzada y IA"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            settings_suggest
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(student.id)}
                          className={`p-2 rounded-lg transition-all border ${
                            editingId === student.id
                              ? "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-inner"
                              : "bg-white text-slate-400 hover:text-cyan-600 border-slate-200 hover:border-cyan-300"
                          }`}
                          title="Abrir Expediente"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {editingId === student.id
                              ? "visibility_off"
                              : "visibility"}
                          </span>
                        </button>
                        <button
                          onClick={() => toast.success("Kardex generado")}
                          className="p-2 rounded-lg bg-white text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 transition-all"
                          title="Imprimir Kardex"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            print
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showAdvancedPanel && selectedStudent && (
        <StudentAdvancedPanel
          student={selectedStudent}
          onClose={() => setShowAdvancedPanel(false)}
        />
      )}
    </div>
  );
};
