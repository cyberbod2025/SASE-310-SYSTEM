import React, { useState, useRef, useEffect } from "react";
import { AppProvider, useApp } from "./store";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import {
  UserRole,
  CaseState,
  IncidentType,
  Justificante,
  Student,
  AppModule,
} from "./types";
import { StudentCard } from "./components/StudentCard";
import { PrintButtons, printContent } from "./components/PrintButtons";
import { VoiceInput } from "./components/VoiceInput";
import { useAuth } from "./components/AuthProvider";
import { Login } from "./components/Login";
import { Inscripciones } from "./components/Inscripciones";
import { Archivo } from "./components/Archivo";
import { Agenda } from "./components/Agenda";
import { Reportes } from "./components/Reportes";
import { BitacoraAuditoria } from "./components/BitacoraAuditoria";
import { PanelSolicitudes } from "./components/PanelSolicitudes";
import { SolicitudReportesDocentes } from "./components/SolicitudReportesDocentes";

// -- COMPONENT: Justificante Generator (Trabajo Social) --
const JustificanteGenerator = () => {
  const { students, addJustificante } = useApp();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [reason, setReason] = useState<"Médico" | "Social" | "Legal">("Médico");
  const [desc, setDesc] = useState("");

  const handleGenerate = () => {
    if (!selectedStudent || !dates.start) return;
    addJustificante(selectedStudent, {
      startDate: dates.start,
      endDate: dates.end || dates.start,
      reason,
      description: desc,
      issuedBy: "Trabajo Social",
    });
    // Reset
    setDates({ start: "", end: "" });
    setDesc("");
  };

  const handleVoiceInput = (text: string) => {
    setDesc((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">
          history_edu
        </span>
        Emitir Justificante Oficial
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
            Alumno
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Seleccione alumno...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.group}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Desde
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Hasta
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
            Motivo
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value as any)}
          >
            <option value="Médico">Médico</option>
            <option value="Social">Social / Familiar</option>
            <option value="Legal">Trámite Legal</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-text-secondary uppercase">
              Observaciones
            </label>
            <VoiceInput onTranscript={handleVoiceInput} className="scale-75" />
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm h-20"
            placeholder="Detalles para el expediente..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedStudent}
          className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50"
        >
          Generar y Timbrar
        </button>
      </div>
    </div>
  );
};

// -- VIEW: Trabajo Social Dashboard --
const DashboardTrabajoSocial = () => {
  const { students } = useApp();
  const recentJustificantes = students
    .flatMap((s) =>
      s.justificantes.map((j) => ({
        ...j,
        studentName: s.name,
        group: s.group,
      }))
    )
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative group p-2">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-400/50 animate-spin-pause pointer-events-none"></div>
            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
            <div className="relative rounded-full overflow-hidden">
              <img
                src="/branding/t social.png"
                alt="Trabajo Social Logo"
                className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] z-10 relative"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shine-sweep pointer-events-none z-20"></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(249,115,22,0.6)" }}
            >
              Trabajo Social
            </h1>
            <p className="text-orange-200 text-lg font-medium tracking-wide">
              Gestión de Justificantes y Estudios Socioeconómicos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <JustificanteGenerator />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-white">
              Historial de Justificantes
            </h3>
            {recentJustificantes.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No hay justificantes recientes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Folio</th>
                      <th className="px-4 py-2">Alumno</th>
                      <th className="px-4 py-2">Fechas</th>
                      <th className="px-4 py-2">Motivo</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {recentJustificantes.map((j) => (
                      <tr
                        key={j.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                          {j.folio}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">
                            {j.studentName}
                          </div>
                          <div className="text-xs text-gray-400">{j.group}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {j.startDate} al {j.endDate}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full bg-orange-900/30 text-orange-200 border border-orange-500/20 text-xs font-bold">
                            {j.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <PrintButtons compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// -- VIEW: Secretaria Dashboard --
const DashboardSecretaria = () => {
  const {
    students,
    logAccess,
    logAudit,
    importStudents,
    currentModule,
    updateStudentAudit,
  } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* -- GROUP MANAGEMENT LOGIC -- */
  const [currentUser, setCurrentUser] = useState<string>("dulce");

  const SECRETARY_USERS: Record<
    string,
    { label: string; name: string; role: string }
  > = {
    dulce: { label: "Dulce (1º Grado)", name: "Dulce", role: "Secretaria 1º" },
    jorge: { label: "Jorge (2º Grado)", name: "Jorge", role: "Secretario 2º" },
    edgar: {
      label: "Edgar (3º Grado)",
      name: "Edgar",
      role: "Secretario 3º",
    },
    gabriela: {
      label: "Gabriela (Coord)",
      name: "Gabriela",
      role: "Coordinación",
    },
  };

  if (currentModule === AppModule.INSCRIPCIONES) return <Inscripciones />;
  if (currentModule === AppModule.ARCHIVO) return <Archivo />;

  const activeUser = SECRETARY_USERS[currentUser];

  const handleEdit = (id: string) => {
    const student = students.find((s) => s.id === id);
    setEditingId(id);
    // Registrar consulta en la bitácora con nombre del alumno
    logAccess(
      `Consultar Expediente (Usuario: ${activeUser.name})`,
      id,
      student?.name
    );
  };

  const handleSaveAudit = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);

    // Registrar actualización en la bitácora de Supabase
    await logAudit(
      "ACTUALIZACION",
      `Expediente modificado por ${activeUser.name} (${activeUser.role})`,
      "alumnos",
      studentId,
      student?.name,
      null, // oldValues - could be captured if needed
      { modifiedBy: activeUser.name, modifiedAt: new Date().toISOString() }
    );

    updateStudentAudit(studentId, activeUser.name);
    alert(
      `[AUDITORÍA] Cambios guardados por: ${activeUser.name}.\nSe ha registrado la modificación en la bitácora de seguridad.`
    );
    setEditingId(null);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock Import Logic
    if (e.target.files && e.target.files.length > 0) {
      alert("Simulando carga masiva de datos y validación de CURPs...");
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
        alert("Importación exitosa: 1 registro nuevo añadido.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1000);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div className="flex items-center gap-6">
          <img
            src="/branding/direccion.png"
            alt="Secretaria Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(59,130,246,0.6)" }}
            >
              Secretaría Académica
            </h1>
            <p className="text-blue-200 text-lg font-medium tracking-wide">
              Gestión de Expedientes y Control Escolar
            </p>
          </div>
        </div>

        {/* User Switcher for Demo */}
        <div className="bg-black/40 border border-white/10 p-2 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-gray-400">
              Usuario Activo (Login)
            </span>
            <select
              className="text-sm font-bold text-white bg-transparent outline-none text-right cursor-pointer"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
            >
              {Object.entries(SECRETARY_USERS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs uppercase border border-blue-500/30">
            {activeUser.name.substring(0, 2)}
          </div>
        </div>
      </div>

      {/* Access Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase">
          Permisos de Acceso:
        </span>
        <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs font-bold rounded border border-green-500/20 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">public</span>{" "}
          Acceso Global (Auditado)
        </span>
        <span className="text-xs text-gray-400 ml-2">
          Sesión iniciada como: <strong>{activeUser.name}</strong> (
          {activeUser.role})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-400">
            lock
          </span>
          <p className="text-sm text-orange-200 font-medium">
            Modo Privacidad Activo: Usted tiene acceso a datos sensibles
            (Tutores, Teléfonos, Direcciones). Toda consulta queda registrada en
            la bitácora de seguridad.
          </p>
        </div>

        {/* Data Import Card */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <h4 className="font-bold text-white text-sm">
              Carga Masiva (Excel/CSV)
            </h4>
            <p className="text-xs text-gray-400">
              Importar alumnos desde archivo oficial.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-black text-xs font-bold rounded hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                upload_file
              </span>
              Importar
            </button>
          </div>
        </div>
      </div>

      {/* Student List (Filtered) */}
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">
            Directorio Estudiantil ({students.length})
          </h3>
        </div>
        <div className="divide-y divide-white/10">
          {students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay alumnos registrados.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Alumno</th>
                  <th className="px-6 py-3">Grupo</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Padre/Tutor</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt="Avatar"
                          className="size-8 rounded-full bg-gray-200 object-cover"
                        />
                        <span className="font-bold text-white">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-300">
                      {student.group}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          student.caseState === CaseState.CERRADO
                            ? "bg-green-900/30 text-green-300 border border-green-500/20"
                            : student.caseState === CaseState.OBSERVADO
                            ? "bg-blue-900/30 text-blue-300 border border-blue-500/20"
                            : "bg-red-900/30 text-red-300 border border-red-500/20"
                        }`}
                      >
                        {student.caseState}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student.id ? (
                        <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100">
                          <div>
                            <p>
                              <strong>{student.guardianInfo?.name}</strong>
                            </p>
                            <p>{student.guardianInfo?.phonePrimary}</p>
                            <span className="truncate">
                              {student.guardianInfo?.address || "No registrada"}
                            </span>
                          </div>
                          <div className="mt-4 flex justify-between items-center border-t border-blue-200 pt-3">
                            <div className="text-xs text-blue-800">
                              <p>
                                <strong>Ultima Modificación:</strong>{" "}
                                {student.lastModifiedBy || "N/A"}
                              </p>
                              <p>{student.lastModifiedAt || ""}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-xs font-bold text-gray-500 hover:text-gray-700"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveAudit(student.id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 shadow-sm"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs italic">
                          Datos ocultos
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(student.id)}
                        className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-xs"
                      >
                        {editingId === student.id ? "Ver Detalle" : "Consultar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// -- VIEW: UDEII Dashboard --
const DashboardUDEII = () => {
  const { students } = useApp();
  const studentsWithBAP = students.filter((s) => s.bapInfo?.hasBAP);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="size-24 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <span className="material-symbols-outlined text-5xl text-purple-400">
              group_add
            </span>
          </div>
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
                    onClick={() =>
                      alert(
                        "La edición completa de ajustes razonables se habilitará en la próxima actualización del módulo UDEII."
                      )
                    }
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

// -- VIEW: Direccion Dashboard --
const DashboardDireccion = () => {
  const { students } = useApp();
  const studentsAtRisk = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <img
            src="/branding/direccion.png"
            alt="Dirección Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(59,130,246,0.6)" }}
            >
              Dirección Escolar
            </h1>
            <p className="text-blue-200 text-lg font-medium tracking-wide">
              Tablero de Mando e Indicadores Estratégicos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              printContent(
                "Resumen Dirección",
                `
              <h1>Resumen Ejecutivo - Dirección</h1>
              <p>Fecha: ${new Date().toLocaleDateString()}</p>
              <h2>Indicadores Clave</h2>
              <ul>
                <li>Asistencia Global: 92%</li>
                <li>Casos en Riesgo: ${studentsAtRisk.length}</li>
                <li>Total Incidencias: ${students.reduce(
                  (acc, s) => acc + s.incidents.length,
                  0
                )}</li>
              </ul>
            `
              )
            }
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 border border-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
            Exportar Informe
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/5 transition-all">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Asistencia Global
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white group-hover:scale-105 transition-transform">
              92%
            </span>
            <span className="text-sm font-bold text-green-400 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              2% vs mes anterior
            </span>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/5 transition-all">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Casos en Riesgo
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-red-500 group-hover:scale-105 transition-transform">
              {studentsAtRisk.length}
            </span>
            <span className="text-sm font-bold text-gray-400 mb-1">
              Estudiantes detectados
            </span>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg group hover:bg-white/5 transition-all">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Incidencias del Mes
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white group-hover:scale-105 transition-transform">
              {students.reduce((acc, s) => acc + s.incidents.length, 0)}
            </span>
            <span className="text-sm font-bold text-gray-400 mb-1">
              Total Global
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-white">
            Grupos con Mayor Índice de Riesgo
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div>
                <p className="font-bold text-gray-200">3º B - Turno Matutino</p>
                <p className="text-xs text-gray-400">Tutor: Prof. Rodríguez</p>
              </div>
              <span className="px-2 py-1 bg-red-900/30 text-red-200 border border-red-500/20 text-xs font-bold rounded-full">
                Alta Prioridad
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div>
                <p className="font-bold text-gray-200">2º A - Turno Matutino</p>
                <p className="text-xs text-gray-400">Tutor: Prof. Gómez</p>
              </div>
              <span className="px-2 py-1 bg-yellow-900/30 text-yellow-200 border border-yellow-500/20 text-xs font-bold rounded-full">
                Seguimiento
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-white">
            Acciones Institucionales Pendientes
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <input
                type="checkbox"
                className="mt-1 rounded text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600"
              />
              <div>
                <p className="text-sm font-bold text-gray-200">
                  Firmar actas de consejo técnico
                </p>
                <p className="text-xs text-gray-400">Vence: Viernes 12</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <input
                type="checkbox"
                className="mt-1 rounded text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600"
              />
              <div>
                <p className="text-sm font-bold text-gray-200">
                  Autorizar compra de insumos (Enfermería)
                </p>
                <p className="text-xs text-gray-400">Solicitud #4492</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// -- VIEW: Docente Dashboard (Refined) --
// -- VIEW: Docente Dashboard (Updated) --
const DashboardDocente = () => {
  const {
    students,
    isTutorMode,
    toggleTutorMode,
    logAccess,
    setCurrentModule,
  } = useApp();

  // Quick Action Handler
  const handleQuickAction = (action: string) => {
    if (action === "incidencia") {
      // In a real app, this would open a modal. For now, we alert.
      alert("Para registrar incidencia, vaya a la vista detallada del alumno.");
    } else if (action === "lista" || action === "imprimir") {
      setCurrentModule(AppModule.REPORTES);
    } else if (action === "planeacion" || action === "calendario") {
      setCurrentModule(AppModule.AGENDA);
    }
  };

  // Logic for Semáforo
  const riskCount = students.filter((s) => s.incidents.length >= 3).length;
  const warningCount = students.filter(
    (s) => s.incidents.length > 0 && s.incidents.length < 3
  ).length;

  // Alerts
  const alerts = students.filter(
    (s) =>
      s.incidents.length > 0 || (s.medicalAlerts && s.medicalAlerts.length > 0)
  );

  const handleToggleTutor = () => {
    toggleTutorMode();
    if (!isTutorMode) logAccess("Activar Vista Tutor", "GLOBAL");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Heading & Group Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <img
            src="/branding/docentes.png"
            alt="Docentes Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]"
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(20,184,166,0.6)" }}
            >
              Bienvenido, Docente
            </h1>
            <p className="text-teal-200 text-lg font-medium tracking-wide flex items-center gap-2">
              Vista actual:
              <span className="font-bold bg-teal-900/40 border border-teal-500/30 px-3 py-0.5 rounded-full text-sm text-teal-100">
                3º B - Turno Matutino
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTutor}
            className={`flex items-center justify-center h-12 px-6 border rounded-xl text-base font-bold transition-all shadow-lg ${
              isTutorMode
                ? "bg-teal-600 text-white border-teal-500 shadow-teal-900/20 hover:bg-teal-500"
                : "bg-black/40 backdrop-blur-md border-white/20 text-gray-300 hover:bg-white/10"
            }`}
          >
            {isTutorMode ? "Vista Tutor Activa" : "Vista Docente"}
          </button>
          <button
            onClick={() => handleQuickAction("incidencia")}
            className="flex items-center justify-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-500 rounded-xl text-base font-bold text-white shadow-lg shadow-blue-900/20 transition-all border border-white/10"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
            <span>Nueva Incidencia</span>
          </button>
        </div>
      </div>

      {/* System Notice */}
      <div className="bg-teal-900/20 border border-teal-500/30 rounded-2xl shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)] backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-4">
          <div className="size-12 rounded-full bg-teal-500/10 flex-shrink-0 flex items-center justify-center text-teal-400 hidden sm:flex border border-teal-500/20">
            <span className="material-symbols-outlined text-2xl">campaign</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">
              Aviso Institucional
            </h3>
            <p className="text-teal-200 mt-1 max-w-2xl font-medium">
              El periodo de captura de calificaciones del 2º Parcial cierra este
              viernes.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleQuickAction("calendario")}
          className="flex-shrink-0 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold rounded-lg transition-colors border border-teal-500/20"
        >
          Ver Calendario
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column (Status & Quick Actions) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Semáforo del Grupo */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="font-bold text-lg text-white">
                Semáforo del Grupo
              </h2>
              <span className="text-xs font-bold text-gray-300 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                Actualizado: Hoy
              </span>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Visual Indicator */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="relative size-32 flex items-center justify-center">
                    {/* Rings simulation */}
                    <div className="absolute inset-0 rounded-full border-[6px] border-alert-yellow opacity-20"></div>
                    <div className="absolute inset-0 rounded-full border-[6px] border-alert-yellow border-t-transparent border-r-transparent -rotate-45"></div>
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl text-alert-yellow">
                        warning
                      </span>
                      <span className="text-xs font-bold text-alert-yellow mt-1 uppercase tracking-wide">
                        Atención
                      </span>
                    </div>
                  </div>
                </div>
                {/* Status Breakdown */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-red-300 uppercase">
                        Riesgo Alto
                      </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {riskCount}
                    </p>
                    <p className="text-xs text-red-200/70">
                      Alumnos con historial crítico
                    </p>
                  </div>
                  <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-2 rounded-full bg-yellow-500"></span>
                      <span className="text-xs font-bold text-yellow-300 uppercase">
                        Seguimiento
                      </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {warningCount}
                    </p>
                    <p className="text-xs text-yellow-200/70">
                      Alumnos con reporte conductual
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg p-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="size-2 rounded-full bg-success-green"></span>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                            Asistencia Promedio
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          92%
                        </p>
                      </div>
                      <div className="h-10 w-24 bg-gray-100 dark:bg-gray-700 rounded flex items-end justify-between px-1 pb-1 gap-0.5">
                        <div className="w-1/5 bg-success-green h-[60%] rounded-sm"></div>
                        <div className="w-1/5 bg-success-green h-[80%] rounded-sm"></div>
                        <div className="w-1/5 bg-success-green h-[50%] rounded-sm"></div>
                        <div className="w-1/5 bg-success-green h-[90%] rounded-sm"></div>
                        <div className="w-1/5 bg-success-green h-[75%] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction("incidencia")}
              className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">
                  edit_note
                </span>
              </div>
              <span className="font-medium text-sm text-center text-text-main dark:text-white">
                Registrar
                <br />
                Incidencia
              </span>
            </button>
            <button
              onClick={() => handleQuickAction("lista")}
              className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">
                  groups
                </span>
              </div>
              <span className="font-medium text-sm text-center text-text-main dark:text-white">
                Lista de
                <br />
                Alumnos
              </span>
            </button>
            <button
              onClick={() => handleQuickAction("imprimir")}
              className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">
                  print
                </span>
              </div>
              <span className="font-medium text-sm text-center text-text-main dark:text-white">
                Imprimir
                <br />
                Documentos
              </span>
            </button>
            <button
              onClick={() => handleQuickAction("planeacion")}
              className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-border-color dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">
                  calendar_month
                </span>
              </div>
              <span className="font-medium text-sm text-center text-text-main dark:text-white">
                Ver
                <br />
                Planeación
              </span>
            </button>
          </div>
        </div>

        {/* Right Column (Alerts & Context) */}
        <div className="space-y-6">
          {/* Active Alerts Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-color dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-border-color dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
              <h3 className="font-bold text-base text-alert-red flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  notifications_active
                </span>
                Alertas Activas
              </h3>
              <span className="bg-alert-red/10 text-alert-red text-xs font-bold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            </div>
            <div className="divide-y divide-border-color dark:divide-gray-700 max-h-[400px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Sin alertas activas.
                </div>
              ) : (
                alerts.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="p-4 hover:bg-background-light dark:hover:bg-gray-700/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-alert-red uppercase tracking-wide">
                        {s.incidents[0]?.type || "Alerta"}
                      </span>
                      <span className="text-[10px] text-text-secondary dark:text-gray-400">
                        Hoy
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-text-main dark:text-gray-200">
                      {s.name}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 line-clamp-2">
                      {s.incidents[0]?.description ||
                        s.medicalAlerts?.[0] ||
                        "Atención requerida"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">
        Lista de Alumnos (Vista Rápida)
      </h3>
      {isTutorMode && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-sm text-blue-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">visibility</span>
          Usted está visualizando información de contacto. Este acceso queda
          registrado.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((s) => (
          <StudentCard key={s.id} student={s} />
        ))}
      </div>
    </div>
  );
};

// -- VIEW: Prefectura Dashboard --
// -- VIEW: Prefectura Dashboard (Updated) --
const DashboardPrefectura = () => {
  const { students, addIncident, logAudit, setCurrentModule } = useApp();
  const [quickMatricula, setQuickMatricula] = useState("");
  const [quickType, setQuickType] = useState<string>("Retardo (Entrada)");

  // Helper date
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // KPIs Logic
  const allIncidents = students.flatMap((s) =>
    s.incidents.map((i) => ({
      ...i,
      studentName: s.name,
      group: s.group,
      studentAvatar: s.avatar,
    }))
  );
  const dailyIncidents = allIncidents.filter((i) =>
    i.date.startsWith(todayStr)
  );

  const attendanceRate = 94; // Mock for now
  const retardosToday = dailyIncidents.filter(
    (i) => i.type === IncidentType.RETARDO
  ).length;
  const uniformesToday = dailyIncidents.filter(
    (i) => i.type === IncidentType.UNIFORME
  ).length;

  // Justified: mock count based on active justificantes
  const justifiedToday = students
    .flatMap((s) => s.justificantes)
    .filter((j) => j.startDate <= todayStr && j.endDate >= todayStr).length;

  const recentActivity = [...allIncidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleRegister = async () => {
    const student = students.find((s) => s.matricula === quickMatricula);
    if (!student) {
      alert("Error: Matrícula no encontrada.");
      return;
    }

    let typeEnum = IncidentType.CONDUCTA;
    if (quickType.includes("Retardo")) typeEnum = IncidentType.RETARDO;
    if (quickType.includes("Uniforme")) typeEnum = IncidentType.UNIFORME;
    if (quickType.includes("Celular")) typeEnum = IncidentType.CONDUCTA;

    // Registrar la incidencia
    addIncident(student.id, typeEnum, quickType);

    // Registrar en bitácora de auditoría
    await logAudit(
      "CREACION",
      `Incidencia registrada: ${quickType}`,
      "incidencias",
      student.id,
      student.name,
      null,
      { tipo: typeEnum, descripcion: quickType }
    );

    alert(`Incidencia registrada exitosamente a: ${student.name}`);
    setQuickMatricula("");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <img
            src="/branding/prefectura.png"
            alt="Prefectura Logo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col gap-1">
            <h1
              className="text-white text-3xl md:text-5xl font-black tracking-tight"
              style={{ textShadow: "0 0 20px rgba(59,130,246,0.6)" }}
            >
              Prefectura
            </h1>
            <p className="text-blue-200 text-lg font-medium tracking-wide">
              Control Disciplinario y Asistencia
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
          <span className="material-symbols-outlined text-blue-400">
            calendar_today
          </span>
          <span className="text-lg font-bold text-white capitalize">
            {todayDisplay}
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Asistencia Total
            </p>
            <span className="material-symbols-outlined text-primary text-2xl">
              groups
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {attendanceRate}%
            </p>
            <p className="text-success-green text-sm font-medium mb-1 flex items-center">
              <span className="material-symbols-outlined text-base">
                trending_up
              </span>{" "}
              1.2%
            </p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Retardos Hoy
            </p>
            <span className="material-symbols-outlined text-alert-yellow text-2xl">
              schedule
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {retardosToday}
            </p>
            <p className="text-alert-yellow text-sm font-medium mb-1 flex items-center">
              <span className="material-symbols-outlined text-base">
                arrow_upward
              </span>{" "}
              +2
            </p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Faltas Justificadas
            </p>
            <span className="material-symbols-outlined text-blue-400 text-2xl">
              assignment_turned_in
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {justifiedToday}
            </p>
            <p className="text-success-green text-sm font-medium mb-1">
              Normal
            </p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="flex flex-col gap-2 rounded-2xl p-5 bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">
              Incidencias Uniforme
            </p>
            <span className="material-symbols-outlined text-alert-red text-2xl">
              checkroom
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-3xl font-bold leading-none">
              {uniformesToday}
            </p>
            <p className="text-gray-400 text-sm font-medium mb-1">
              Igual a ayer
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Quick Register Widget */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">
                  bolt
                </span>
              </div>
              <h2 className="text-white text-xl font-bold">Registro Rápido</h2>
            </div>
            <div className="flex flex-col md:flex-row items-end gap-4">
              <label className="flex flex-col flex-1 w-full">
                <p className="text-gray-300 text-sm font-medium pb-2">
                  Matrícula del Alumno
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl">
                    badge
                  </span>
                  <input
                    value={quickMatricula}
                    onChange={(e) => setQuickMatricula(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/40 text-white h-12 pl-11 pr-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-600"
                    placeholder="Ej. 2023-4492"
                  />
                </div>
              </label>
              <label className="flex flex-col flex-1 w-full">
                <p className="text-gray-300 text-sm font-medium pb-2">
                  Tipo de Incidencia
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl">
                    category
                  </span>
                  <select
                    value={quickType}
                    onChange={(e) => setQuickType(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/40 text-white h-12 pl-11 pr-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option>Retardo (Entrada)</option>
                    <option>Falta de Uniforme Completo</option>
                    <option>Sin Credencial</option>
                    <option>Uso de Celular</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl pointer-events-none">
                    expand_more
                  </span>
                </div>
              </label>
              <button
                onClick={handleRegister}
                className="w-full md:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                Registrar
              </button>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-white text-lg font-bold">
                Actividad Reciente
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-primary text-sm font-medium hover:underline"
              >
                Ver todo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Hora</th>
                    <th className="px-6 py-4">Alumno</th>
                    <th className="px-6 py-4">Grupo</th>
                    <th className="px-6 py-4">Incidencia</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color dark:divide-gray-700">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No hay actividad reciente.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((inc) => (
                      <tr
                        key={inc.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {new Date(inc.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-primary text-xs font-bold">
                              {inc.studentName.substring(0, 2)}
                            </div>
                            <span className="text-gray-200 font-medium text-sm">
                              {inc.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {inc.group}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {inc.type}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-200 border border-yellow-700/30">
                            Registrado
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Alerts & Charts) */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Daily Alerts */}
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-bold">Alertas del Día</h3>
              <span className="bg-alert-red/10 text-alert-red text-xs font-bold px-2 py-1 rounded-full">
                Automático
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-start p-3 bg-red-900/10 rounded-lg border border-red-500/20">
                <span className="material-symbols-outlined text-alert-red mt-0.5">
                  warning
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-200">
                    Retardos Acumulados
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Se detectaron 3 alumnos con {">"}3 retardos.
                  </p>
                </div>
              </div>
              {/* Static alert for now as example */}
              <div className="flex gap-3 items-start p-3 bg-blue-900/10 rounded-lg border border-blue-500/20">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">
                  notifications
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-200">
                    Revisión de Uniforme
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Programada para 3º Grado a las 11:00 AM.
                  </p>
                </div>
              </div>
            </div>
            {/* Reporte Diario Button */}
            <button
              onClick={() =>
                printContent(
                  "Reporte Diario Prefectura",
                  `
                <h1>Reporte Diario - Prefectura</h1>
                <p>Fecha: ${todayDisplay}</p>
                <ul>
                  <li>Asistencia: ${attendanceRate}%</li>
                  <li>Retardos: ${retardosToday}</li>
                  <li>Faltas Justificadas: ${justifiedToday}</li>
                  <li>Uniforme: ${uniformesToday}</li>
                </ul>
              `
                )
              }
              className="mt-4 w-full py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-gray-200 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimir Parte Diario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// -- VIEW: Enfermeria Dashboard --
// -- VIEW: Enfermeria Dashboard (Updated) --
const DashboardEnfermeria = () => {
  const { students, setQuickRegisterOpen, setCurrentModule } = useApp();
  const todayStr = new Date().toISOString().split("T")[0];

  // Logic
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

  // In a real app we might have a specific Visits table, but for now we use 'incidents' of type SALUD
  const visitsToday = healthIncidents.filter((i) =>
    i.date.startsWith(todayStr)
  ).length;
  // Mock 'Medicamentos Pendientes'
  const pendingMeds = 5;

  const activeAlertsCount = students.filter(
    (s) => s.medicalAlerts && s.medicalAlerts.length > 0
  ).length;

  const recentVisits = [...healthIncidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome & Date */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-6">
            <img
              src="/branding/enfermeria.png"
              alt="Enfermeria Logo"
              className="size-24 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            />
            <div>
              <h2
                className="text-3xl md:text-5xl font-black text-white tracking-tight"
                style={{ textShadow: "0 0 20px rgba(239,68,68,0.6)" }}
              >
                Enfermería
              </h2>
              <p className="text-red-200 text-lg mt-1 font-medium">
                Gestión de Salud y Primeros Auxilios
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-2xl font-bold text-white capitalize">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-sm text-gray-400">Ciclo Escolar 2023-2024</p>
          </div>
        </div>

        {/* Urgent Alerts Ticker */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] backdrop-blur-md">
          <div className="bg-alert-red/10 p-2 rounded-full shrink-0">
            <span className="material-symbols-outlined text-alert-red">
              campaign
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1">
              Alertas Activas
            </h3>
            <p className="text-white text-sm font-medium">
              <span className="font-bold">Urgente:</span> {activeAlertsCount}{" "}
              estudiantes con alertas médicas registradas.
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold">Stock:</span> Paracetamol suspensión
              pediátrica en nivel crítico (2 unidades).
            </p>
          </div>
          <button className="text-sm font-semibold text-alert-red hover:underline shrink-0">
            Ver Detalles
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 group hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                  Visitas de Hoy
                </p>
                <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform">
                  {visitsToday}
                </h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">
                  clinical_notes
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-success-green font-medium">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span>+2 vs ayer</span>
            </div>
          </div>
          {/* Stat Card 2 */}
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 group hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                  Medicamentos Pendientes
                </p>
                <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform">
                  {pendingMeds}
                </h3>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-alert-yellow">
                  medication
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400">Próxima dosis: 10:45 AM</div>
          </div>
          {/* Stat Card 3 */}
          <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 group hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                  Alertas Médicas
                </p>
                <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform">
                  {activeAlertsCount}
                </h3>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-alert-red">
                  warning
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Requieren seguimiento inmediato
            </div>
          </div>
          {/* Stat Card 4 */}
          <div
            onClick={() => setQuickRegisterOpen(true)}
            className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between h-36 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all"
          >
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 text-primary">
              <span className="material-symbols-outlined text-4xl">
                add_circle
              </span>
              <span className="font-bold">Nueva Consulta</span>
            </div>
          </div>
        </div>

        {/* Main Section: Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Activity Table */}
          <div className="xl:col-span-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">
                Registro de Atención Reciente
              </h3>
              <button
                onClick={() => setCurrentModule(AppModule.REPORTES)}
                className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                Ver todo{" "}
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Hora</th>
                    <th className="px-6 py-4">Alumno</th>
                    <th className="px-6 py-4">Grupo</th>
                    <th className="px-6 py-4">Incidencia</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color dark:divide-gray-700">
                  {recentVisits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">
                        No hay visitas registradas hoy.
                      </td>
                    </tr>
                  ) : (
                    recentVisits.map((visit) => (
                      <tr
                        key={visit.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(visit.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {visit.studentName}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {visit.group}
                        </td>
                        <td className="px-6 py-4 text-white capitalize">
                          {visit.type}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/20">
                            Atendido
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-400 hover:text-white">
                            <span className="material-symbols-outlined">
                              visibility
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Quick Actions & Inventory */}
          <div className="flex flex-col gap-6">
            {/* Quick Search Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden border border-white/10">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Búsqueda Rápida</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Accede al expediente médico del alumno.
                </p>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 flex items-center border border-white/30">
                  <input
                    className="bg-transparent border-none text-white placeholder-blue-100 w-full focus:ring-0 text-sm px-3"
                    placeholder="Matrícula o Nombre"
                    type="text"
                  />
                  <button className="bg-white text-primary p-2 rounded-md hover:bg-blue-50 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      search
                    </span>
                  </button>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10 pointer-events-none">
                id_card
              </span>
            </div>

            {/* Inventory Widget */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Inventario Crítico</h3>
                <button className="text-xs text-primary font-medium hover:underline">
                  Gestionar
                </button>
              </div>
              <div className="space-y-4">
                {/* Item 1 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">
                      Paracetamol 500mg
                    </span>
                    <span className="text-xs font-bold text-alert-red">
                      2 unid.
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-alert-red h-2 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Reabastecer urgente
                  </p>
                </div>
                {/* Item 2 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">
                      Vendas elásticas #5
                    </span>
                    <span className="text-xs font-bold text-alert-yellow">
                      5 unid.
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-alert-yellow h-2 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>
                {/* Item 3 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">
                      Alcohol Antiséptico
                    </span>
                    <span className="text-xs font-bold text-success-green">
                      Ok
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-success-green h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -- VIEW: Orientacion Dashboard (unchanged logic) --
// -- VIEW: Orientacion Dashboard (Updated) --
const DashboardOrientacion = () => {
  const { students, setQuickRegisterOpen, setCurrentModule } = useApp();

  // Logic
  const studentsInTrouble = students.filter(
    (s) =>
      s.caseState !== CaseState.CERRADO && s.caseState !== CaseState.OBSERVADO
  );

  const patternAlerts = students.filter(
    (s) => s.caseState === CaseState.PATRON_DETECTADO
  );

  // Mock next appointment
  const nextAppointment = {
    family: "Familia Hernández",
    student: "Carlos H. (2°B)",
    time: "Hoy, 10:00 AM",
  };

  // Print weekly report
  const handlePrintReport = () => {
    const reportData = `
      <h1>Reporte Semanal - Orientación</h1>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-MX")}</p>
      <h2>Resumen</h2>
      <ul>
        <li><strong>Casos activos:</strong> ${studentsInTrouble.length}</li>
        <li><strong>Patrones detectados:</strong> ${patternAlerts.length}</li>
        <li><strong>Total estudiantes:</strong> ${students.length}</li>
      </ul>
      <h2>Alertas de Patrón</h2>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #ddd; padding:8px;">Alumno</th>
            <th style="border:1px solid #ddd; padding:8px;">Grupo</th>
            <th style="border:1px solid #ddd; padding:8px;">Incidencias</th>
          </tr>
        </thead>
        <tbody>
          ${patternAlerts
            .map(
              (s) => `
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${s.name}</td>
              <td style="border:1px solid #ddd; padding:8px;">${s.group}</td>
              <td style="border:1px solid #ddd; padding:8px;">${s.incidents.length}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    printContent("Reporte Semanal - Orientación", reportData);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth text-white">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="relative group p-2">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-400/50 animate-spin-pause pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
              <div className="relative rounded-full overflow-hidden">
                <img
                  src="/branding/orientacion.png"
                  alt="Orientación Logo"
                  className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] z-10 relative"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shine-sweep pointer-events-none z-20"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h1
                className="text-white text-3xl md:text-5xl font-black tracking-tight"
                style={{ textShadow: "0 0 20px rgba(234,179,8,0.6)" }}
              >
                Orientación
              </h1>
              <p className="text-yellow-200 text-lg font-medium tracking-wide">
                Bienestar Estudiantil y Psicoeducación
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-bold rounded-xl transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">
                print
              </span>
              Reporte Semanal
            </button>
            <button
              onClick={() => setCurrentModule(AppModule.REPORTES_DOCENTES)}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-900/20 border border-white/10"
            >
              <span className="material-symbols-outlined text-[20px]">
                psychology
              </span>
              Solicitar Reporte
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column (Main Data) */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            {/* Alerts Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">
                    warning
                  </span>
                  Alertas de Patrón (Detectadas)
                </h3>
                <a
                  className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
                  href="#"
                >
                  Ver todas
                </a>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {patternAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No hay patrones críticos detectados hoy.
                  </div>
                ) : (
                  patternAlerts.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          person_alert
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {s.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            {s.group}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                          ALERTA CRÍTICA: Patrón de conducta recurrente
                          detectado.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
                          Expediente
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-xs font-bold text-red-700 dark:text-red-400 shadow-sm">
                          Contactar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Charts Section (Mocked for now) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-80">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
                  Incidencias por Grado
                </h3>
                <div className="flex-1 flex items-end justify-between gap-4 px-2">
                  <div className="w-full bg-blue-100 rounded-t h-[40%] relative group">
                    <div className="absolute bottom-0 w-full bg-primary h-full rounded-t opacity-80"></div>
                  </div>
                  <div className="w-full bg-blue-100 rounded-t h-[70%] relative group">
                    <div className="absolute bottom-0 w-full bg-primary h-full rounded-t opacity-80"></div>
                  </div>
                  <div className="w-full bg-blue-100 rounded-t h-[50%] relative group">
                    <div className="absolute bottom-0 w-full bg-primary h-full rounded-t opacity-80"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
                  <span>1°</span>
                  <span>2°</span>
                  <span>3°</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-80">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Reportes por Docente
                </h3>
                <div className="space-y-3 overflow-y-auto">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm font-bold">Prof. Ramírez</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                      12
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                    <span className="text-sm font-bold">Prof. Dávila</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold">
                      5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* Requests Module */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                Solicitudes a Docentes
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  2 Pendientes
                </span>
              </h3>
              <div className="flex flex-col gap-4">
                <div className="border-l-2 border-orange-400 pl-3 py-1">
                  <p className="text-sm font-medium">Reporte de Conducta</p>
                  <p className="text-xs text-slate-500">Para: Prof. Ramírez</p>
                </div>
              </div>
            </section>

            {/* Intervention */}
            <section className="bg-primary text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">
                  Seguimiento con Padres
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/10 mt-4">
                  <p className="font-bold text-sm">{nextAppointment.family}</p>
                  <div className="flex items-center gap-2 text-xs font-medium bg-black/20 w-fit px-2 py-1 rounded mt-2">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>
                    {nextAppointment.time}
                  </div>
                </div>
                <button className="w-full bg-white text-primary font-bold py-2.5 rounded-lg shadow-md hover:bg-blue-50 transition-colors text-sm">
                  Registrar Nueva Cita
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// -- MAIN APP SHELL --
const MainContent = () => {
  const { currentModule, currentUserRole } = useApp();

  if (currentModule === AppModule.AGENDA) return <Agenda />;
  if (currentModule === AppModule.REPORTES) return <Reportes />;
  if (currentModule === AppModule.BITACORA) return <BitacoraAuditoria />;
  if (currentModule === AppModule.SOLICITUDES) return <PanelSolicitudes />;
  if (currentModule === AppModule.REPORTES_DOCENTES)
    return <SolicitudReportesDocentes />;

  switch (currentUserRole) {
    case UserRole.DOCENTE:
      return <DashboardDocente />;
    case UserRole.PREFECTURA:
      return <DashboardPrefectura />;
    case UserRole.ENFERMERIA:
      return <DashboardEnfermeria />;
    case UserRole.ORIENTACION:
      return <DashboardOrientacion />;
    case UserRole.TRABAJO_SOCIAL:
      return <DashboardTrabajoSocial />;
    case UserRole.SECRETARIA:
      return <DashboardSecretaria />;
    // case UserRole.UDEII: return <DashboardUDEII />;
    case UserRole.DIRECTIVO:
      return <DashboardDireccion />;
    default:
      return <DashboardDocente />;
  }
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { session, loading } = useAuth();

  // Show splash screen primarily
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-text-secondary font-bold">
        Cargando SASE-310...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
    </AppProvider>
  );
};

export default App;
