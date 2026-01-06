import React, { useState, useRef } from "react";
import { useApp } from "../../store";
import { CaseState, AppModule, Student } from "../../types";
import { Inscripciones } from "../Inscripciones";
import { Archivo } from "../Archivo";

export const DashboardSecretaria = () => {
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
