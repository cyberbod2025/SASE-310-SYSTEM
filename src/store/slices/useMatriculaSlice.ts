import { useState, useCallback } from "react";
import { supabase } from "../../supabase/client";
import type { AlumnoCiclo, CicloEscolar, Group, AsignacionAlumnoGrupo } from "../../types";
import toast from "react-hot-toast";

interface MoveAction {
  alumnoCicloId: string;
  from: string;
  to: string;
  timestamp: number;
}

interface MatriculaState {
  cicloActivo: CicloEscolar | null;
  alumnos: AlumnoCiclo[];
  grupos: Group[];
  cambiosPendientes: Map<string, string>; // alumnoCicloId → nuevo grupo
  lastActionStack: MoveAction[];
  loading: boolean;
  sugerenciasLoading: boolean;
  equilibrio: Record<string, number>;
}

export const useMatriculaSlice = (
  userId: string | undefined,
  logAudit: (...args: any[]) => Promise<void>
) => {
  const [matriculaState, setMatriculaState] = useState<MatriculaState>({
    cicloActivo: null,
    alumnos: [],
    grupos: [],
    cambiosPendientes: new Map(),
    lastActionStack: [],
    loading: false,
    sugerenciasLoading: false,
    equilibrio: {},
  });

  // ── Fetch ciclo activo + alumnos + grupos ──
  const fetchMatricula = useCallback(async () => {
    setMatriculaState((s) => ({ ...s, loading: true }));
    try {
      // 1. Ciclo activo
      const { data: ciclos, error: errCiclo } = await supabase
        .from("ciclos_escolares")
        .select("*")
        .eq("activo", true)
        .limit(1)
        .single();

      if (errCiclo || !ciclos) {
        toast.error("No se encontró un ciclo escolar activo");
        setMatriculaState((s) => ({ ...s, loading: false }));
        return;
      }

      const ciclo: CicloEscolar = {
        id: ciclos.id,
        nombre: ciclos.nombre,
        activo: ciclos.activo,
        fechaInicio: ciclos.fecha_inicio,
        fechaFin: ciclos.fecha_fin,
      };

      // 2. Alumnos del ciclo
      const { data: alumnosCiclo, error: errAlumnos } = await supabase
        .from("alumno_ciclo")
        .select(`
          id, alumno_id, ciclo_id, grado, grupo, grupo_id,
          estatus, grupo_sugerido, locked,
          alumnos!inner(nombre_completo, datos_bap, puntaje_riesgo)
        `)
        .eq("ciclo_id", ciclo.id)
        .eq("estatus", "activo")
        .order("grado")
        .order("grupo");

      if (errAlumnos) {
        toast.error("Error cargando alumnos del ciclo");
        console.error(errAlumnos);
      }

      const mapped: AlumnoCiclo[] = (alumnosCiclo || []).map((ac: any) => ({
        id: ac.id,
        alumnoId: ac.alumno_id,
        cicloId: ac.ciclo_id,
        grado: ac.grado,
        grupo: ac.grupo || "",
        grupoId: ac.grupo_id,
        estatus: ac.estatus,
        grupoSugerido: ac.grupo_sugerido,
        locked: ac.locked || false,
        nombreAlumno: ac.alumnos?.nombre_completo || "Sin nombre",
        bapAlumno: !!ac.alumnos?.datos_bap,
      }));

      // 3. Grupos
      const { data: gruposData } = await supabase
        .from("grupos")
        .select("*")
        .eq("ciclo_escolar", ciclo.nombre)
        .order("nombre");

      setMatriculaState((s) => ({
        ...s,
        cicloActivo: ciclo,
        alumnos: mapped,
        grupos: (gruposData || []).map((g: any) => ({
          id: g.id,
          nombre: g.nombre,
          tutor_id: g.tutor_id,
          ciclo_escolar: g.ciclo_escolar,
        })),
        loading: false,
        cambiosPendientes: new Map(),
        lastActionStack: [],
      }));
    } catch (err) {
      console.error("fetchMatricula error:", err);
      setMatriculaState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // ── Mover alumno (optimista) ──
  const moveAlumno = useCallback(
    (alumnoCicloId: string, grupoNuevo: string) => {
      setMatriculaState((prev) => {
        const alumno = prev.alumnos.find((a) => a.id === alumnoCicloId);
        if (!alumno) return prev;

        const grupoAnterior = alumno.grupo;
        if (grupoAnterior === grupoNuevo) return prev;

        const nuevosAlumnos = prev.alumnos.map((a) =>
          a.id === alumnoCicloId ? { ...a, grupo: grupoNuevo } : a
        );

        const nuevosCambios = new Map(prev.cambiosPendientes);
        nuevosCambios.set(alumnoCicloId, grupoNuevo);

        const nuevaAccion: MoveAction = {
          alumnoCicloId,
          from: grupoAnterior,
          to: grupoNuevo,
          timestamp: Date.now(),
        };

        return {
          ...prev,
          alumnos: nuevosAlumnos,
          cambiosPendientes: nuevosCambios,
          lastActionStack: [...prev.lastActionStack, nuevaAccion],
        };
      });
    },
    []
  );

  // ── Deshacer último movimiento ──
  const undoLastMove = useCallback(() => {
    setMatriculaState((prev) => {
      if (prev.lastActionStack.length === 0) {
        toast("No hay acciones para deshacer", { icon: "ℹ️" });
        return prev;
      }

      const lastAction = prev.lastActionStack[prev.lastActionStack.length - 1];
      const nuevosAlumnos = prev.alumnos.map((a) =>
        a.id === lastAction.alumnoCicloId
          ? { ...a, grupo: lastAction.from }
          : a
      );

      const nuevosCambios = new Map(prev.cambiosPendientes);
      nuevosCambios.delete(lastAction.alumnoCicloId);

      toast.success("Movimiento deshecho");

      return {
        ...prev,
        alumnos: nuevosAlumnos,
        cambiosPendientes: nuevosCambios,
        lastActionStack: prev.lastActionStack.slice(0, -1),
      };
    });
  }, []);

  // ── Solicitar sugerencias IA ──
  const solicitarSugerenciasIA = useCallback(async () => {
    const ciclo = matriculaState.cicloActivo;
    if (!ciclo) return;

    setMatriculaState((s) => ({ ...s, sugerenciasLoading: true }));

    try {
      const res = await fetch("/api/ia/distribucion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciclo_id: ciclo.id }),
      });

      if (!res.ok) throw new Error("Error en endpoint IA");

      const data = await res.json();
      const sugerencias: Array<{ alumno_id: string; grupo_sugerido: string }> =
        data.sugerencias || [];
      const equilibrioData: Record<string, number> = data.equilibrio || {};

      setMatriculaState((prev) => ({
        ...prev,
        sugerenciasLoading: false,
        equilibrio: equilibrioData,
        alumnos: prev.alumnos.map((a) => {
          if (a.locked) return a; // No sobreescribir locked
          const sug = sugerencias.find((s) => s.alumno_id === a.alumnoId);
          return sug ? { ...a, grupoSugerido: sug.grupo_sugerido } : a;
        }),
      }));

      toast.success(`Sugerencias IA recibidas para ${sugerencias.length} alumnos`);
    } catch (err) {
      console.error("Error IA distribucion:", err);
      toast.error("Error al obtener sugerencias de IA");
      setMatriculaState((s) => ({ ...s, sugerenciasLoading: false }));
    }
  }, [matriculaState.cicloActivo]);

  // ── Aprobar lote (persistir cambios) ──
  const aprobarLote = useCallback(async () => {
    const { cambiosPendientes, cicloActivo, alumnos } = matriculaState;
    if (cambiosPendientes.size === 0) {
      toast("No hay cambios pendientes", { icon: "ℹ️" });
      return;
    }

    if (!cicloActivo) return;

    try {
      const entries = Array.from(cambiosPendientes.entries());

      for (const [alumnoCicloId, grupoNuevo] of entries) {
        const alumno = alumnos.find((a) => a.id === alumnoCicloId);
        const grupoAnterior = alumno?.grupo || "";

        // Obtener grupo_id
        const { data: grupoData } = await supabase
          .from("grupos")
          .select("id")
          .eq("nombre", grupoNuevo)
          .eq("ciclo_escolar", cicloActivo.nombre)
          .limit(1)
          .single();

        // Actualizar alumno_ciclo
        await supabase
          .from("alumno_ciclo")
          .update({ grupo: grupoNuevo, grupo_id: grupoData?.id || null })
          .eq("id", alumnoCicloId);

        // Registrar movimiento
        if (grupoData) {
          await supabase.from("asignacion_alumno_grupo").insert({
            alumno_ciclo_id: alumnoCicloId,
            grupo_id: grupoData.id,
            grupo_anterior: grupoAnterior,
            grupo_nuevo: grupoNuevo,
            asignado_por: userId,
            origen: "manual",
          });
        }
      }

      // Auditoría
      await logAudit(
        "ACTUALIZACION",
        `Matrícula Inteligente: ${entries.length} movimientos aprobados`,
        "alumno_ciclo",
        "LOTE",
        undefined,
        null,
        {
          ciclo: cicloActivo.nombre,
          movimientos: entries.length,
        }
      );

      toast.success(`${entries.length} asignaciones guardadas`);

      setMatriculaState((prev) => ({
        ...prev,
        cambiosPendientes: new Map(),
        lastActionStack: [],
      }));
    } catch (err) {
      console.error("Error aprobando lote:", err);
      toast.error("Error al guardar asignaciones");
    }
  }, [matriculaState, userId, logAudit]);

  // ── Toggle lock ──
  const toggleLock = useCallback(async (alumnoCicloId: string) => {
    setMatriculaState((prev) => ({
      ...prev,
      alumnos: prev.alumnos.map((a) =>
        a.id === alumnoCicloId ? { ...a, locked: !a.locked } : a
      ),
    }));

    const alumno = matriculaState.alumnos.find((a) => a.id === alumnoCicloId);
    if (alumno) {
      await supabase
        .from("alumno_ciclo")
        .update({ locked: !alumno.locked })
        .eq("id", alumnoCicloId);
    }
  }, [matriculaState.alumnos]);

  return {
    matricula: matriculaState,
    fetchMatricula,
    moveAlumno,
    undoLastMove,
    solicitarSugerenciasIA,
    aprobarLote,
    toggleLock,
  };
};
