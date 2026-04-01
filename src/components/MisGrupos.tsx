import React, { useState, useEffect } from "react";
import { useApp } from "../store";
import { UserRole, Student, CaseState } from "../types";
import { supabase } from "../supabase/client";

interface Grupo {
  id: string;
  nombre: string;
  alumnos: Student[];
  totalAlumnos: number;
  conIncidencias: number;
  promedioGeneral: number;
}

export const MisGrupos: React.FC = () => {
  const { currentUserRole, students, groups } = useApp();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarGrupos();
  }, [students]);

  const cargarGrupos = () => {
    setLoading(true);

    // Agrupar estudiantes por grupo (solo los que tienen grupo asignado)
    const gruposMap = new Map<string, Student[]>();
    students.forEach((student) => {
      const grupo = student.group;
      if (grupo) {
        if (!gruposMap.has(grupo)) {
          gruposMap.set(grupo, []);
        }
        gruposMap.get(grupo)!.push(student);
      }
    });

    // Usar los grupos oficiales como base para asegurar que aparezcan todos
    const gruposArray: Grupo[] = groups.map((g) => {
      const nombre = g.nombre || g.name || "Sin Grupo";
      const alumnos = gruposMap.get(nombre) || [];

      const conIncidencias = alumnos.filter(
        (a) => a.incidents && a.incidents.length > 0,
      ).length;

      // Calcular promedio general del grupo
      const alumnosConCalif = alumnos.filter(
        (a) => a.calificaciones && a.calificaciones.length > 0,
      );
      const promedioGeneral =
        alumnosConCalif.length > 0
          ? alumnosConCalif.reduce((sum, a) => {
              const promAlumno =
                a.calificaciones!.reduce(
                  (s, c) => s + (c.promedioFinal || 0),
                  0,
                ) / a.calificaciones!.length;
              return sum + promAlumno;
            }, 0) / alumnosConCalif.length
          : 0;

      return {
        id: g.id || nombre,
        nombre,
        alumnos,
        totalAlumnos: alumnos.length,
        conIncidencias,
        promedioGeneral: Math.round(promedioGeneral * 10) / 10,
      };
    });

    // Si hay alumnos "Sin Grupo", agregarlos al final si no están en los oficiales
    if (gruposMap.has("Sin Grupo") && !groups.find(g => (g.nombre || g.name) === "Sin Grupo")) {
      const alumnos = gruposMap.get("Sin Grupo")!;
      gruposArray.push({
        id: "sin-grupo",
        nombre: "Sin Grupo",
        alumnos,
        totalAlumnos: alumnos.length,
        conIncidencias: alumnos.filter(a => a.incidents && a.incidents.length > 0).length,
        promedioGeneral: 0 // Simplificado
      });
    }

    setGrupos(gruposArray.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true })));
    setLoading(false);
  };

  const grupoActual = grupos.find((g) => g.id === grupoSeleccionado);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
          groups
        </span>
        <h3 className="text-xl font-bold text-slate-700 mb-2">
          No hay grupos asignados
        </h3>
        <p className="text-slate-500 text-sm">
          Contacta a la Secretaría para que te asignen grupos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-black/5 p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <span className="material-symbols-outlined text-5xl">groups</span>
          <div>
            <h1 className="text-3xl font-black">Mis Grupos</h1>
            <p className="text-blue-100 text-sm">
              Gestión de trayectorias académicas
            </p>
          </div>
        </div>
      </div>

      {/* Vista de Grupos */}
      {!grupoSeleccionado ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((grupo) => (
            <button
              key={grupo.id}
              onClick={() => setGrupoSeleccionado(grupo.id)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl shadow-black/5 hover:border-blue-300 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                    {grupo.nombre}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {grupo.totalAlumnos} alumno
                    {grupo.totalAlumnos !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">
                  chevron_right
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Promedio General</span>
                  <span
                    className={`font-bold ${
                      grupo.promedioGeneral >= 8
                        ? "text-green-600"
                        : grupo.promedioGeneral >= 6
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {grupo.promedioGeneral > 0
                      ? grupo.promedioGeneral.toFixed(1)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Con Incidencias</span>
                  <span
                    className={`font-bold ${
                      grupo.conIncidencias > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {grupo.conIncidencias}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Vista de Detalle del Grupo */
        <div className="space-y-6">
          {/* Botón Volver */}
          <button
            onClick={() => setGrupoSeleccionado(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Volver a Mis Grupos
          </button>

          {/* Estadísticas del Grupo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {grupoActual?.nombre}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-blue-600">
                    group
                  </span>
                  <div>
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">
                      Total Alumnos
                    </p>
                    <p className="text-2xl font-black text-blue-900">
                      {grupoActual?.totalAlumnos}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-green-600">
                    school
                  </span>
                  <div>
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wide">
                      Promedio Grupo
                    </p>
                    <p className="text-2xl font-black text-green-900">
                      {grupoActual && grupoActual.promedioGeneral > 0
                        ? grupoActual.promedioGeneral.toFixed(1)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-orange-600">
                    warning
                  </span>
                  <div>
                    <p className="text-xs text-orange-700 font-bold uppercase tracking-wide">
                      Con Incidencias
                    </p>
                    <p className="text-2xl font-black text-orange-900">
                      {grupoActual?.conIncidencias}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Alumnos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-black text-slate-800">
                Lista de Alumnos
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {grupoActual?.alumnos.map((alumno) => {
                const promedio =
                  alumno.calificaciones && alumno.calificaciones.length > 0
                    ? alumno.calificaciones.reduce(
                        (sum, c) => sum + (c.promedioFinal || 0),
                        0,
                      ) / alumno.calificaciones.length
                    : null;

                return (
                  <div
                    key={alumno.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={alumno.avatar}
                          alt={alumno.name}
                          className="w-12 h-12 rounded-full border-2 border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">
                            {alumno.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {alumno.matricula}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Promedio */}
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Promedio
                          </p>
                          <p
                            className={`text-lg font-black ${
                              promedio
                                ? promedio >= 8
                                  ? "text-green-600"
                                  : promedio >= 6
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                : "text-slate-400"
                            }`}
                          >
                            {promedio ? promedio.toFixed(1) : "N/A"}
                          </p>
                        </div>

                        {/* Estado del Caso */}
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Estado
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              alumno.caseState === CaseState.CERRADO
                                ? "bg-green-100 text-green-700"
                                : alumno.caseState === CaseState.OBSERVADO
                                  ? "bg-blue-100 text-blue-700"
                                  : alumno.caseState ===
                                      CaseState.PATRON_DETECTADO
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {alumno.incidents.length} inc.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
