import { useState, useCallback } from "react";
import { supabase } from "../../supabase/client";
import type { SimulacionPromocion, CicloEscolar, DecisionPromocion } from "../../types";
import toast from "react-hot-toast";

interface CierreCicloState {
  cicloActivo: CicloEscolar | null;
  cicloNuevo: CicloEscolar | null;
  simulacion: SimulacionPromocion[];
  overrides: Record<string, DecisionPromocion>; // alumnoId → decisión manual
  simulado: boolean;
  ejecutando: boolean;
  loading: boolean;
  resultado: {
    promovidos: number;
    egresados: number;
    bajas: number;
    retenidos: number;
  } | null;
}

export const useCierreCicloSlice = (
  logAudit: (action: string, description: string, table: string, recordId?: string, studentId?: string, oldValues?: any, newValues?: any) => Promise<void>
) => {
  const [cierreState, setCierreState] = useState<CierreCicloState>({
    cicloActivo: null,
    cicloNuevo: null,
    simulacion: [],
    overrides: {},
    simulado: false,
    ejecutando: false,
    loading: false,
    resultado: null,
  });

  // ── Inicializar: cargar ciclos ──
  const fetchCiclos = useCallback(async () => {
    setCierreState((s) => ({ ...s, loading: true }));
    try {
      const { data: ciclos } = await supabase
        .from("ciclos_escolares")
        .select("*")
        .order("created_at", { ascending: false });

      const activo = ciclos?.find((c) => c.activo);
      const nuevos = ciclos?.filter((c) => !c.activo) || [];

      setCierreState((s) => ({
        ...s,
        loading: false,
        cicloActivo: activo
          ? {
              id: activo.id,
              nombre: activo.nombre,
              activo: activo.activo,
              fechaInicio: activo.fecha_inicio || undefined,
              fechaFin: activo.fecha_fin || undefined,
            }
          : null,
        cicloNuevo: nuevos.length > 0
          ? {
              id: nuevos[0].id,
              nombre: nuevos[0].nombre,
              activo: false,
            }
          : null,
      }));
    } catch (err) {
      console.error("Error cargando ciclos:", err);
      setCierreState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // ── Crear ciclo nuevo ──
  const crearCicloNuevo = useCallback(async (nombre: string) => {
    try {
      const { data, error } = await supabase
        .from("ciclos_escolares")
        .insert({ nombre, activo: false })
        .select()
        .single();

      if (error) {
        toast.error(`Error creando ciclo: ${error.message}`);
        return;
      }

      setCierreState((s) => ({
        ...s,
        cicloNuevo: {
          id: data.id,
          nombre: data.nombre,
          activo: false,
        },
      }));

      toast.success(`Ciclo "${nombre}" creado`);
    } catch (err) {
      console.error("Error creando ciclo:", err);
      toast.error("Error al crear ciclo nuevo");
    }
  }, []);

  // ── Simular promoción (read-only RPC) ──
  const simularPromocion = useCallback(async () => {
    const { cicloActivo } = cierreState;
    if (!cicloActivo) {
      toast.error("No hay ciclo activo para simular");
      return;
    }

    setCierreState((s) => ({ ...s, loading: true }));

    try {
      const { data, error } = await supabase.rpc("simular_promocion", {
        p_ciclo_id: cicloActivo.id,
      });

      if (error) {
        toast.error(`Error en simulación: ${error.message}`);
        setCierreState((s) => ({ ...s, loading: false }));
        return;
      }

      const mapped: SimulacionPromocion[] = (data || []).map((row) => ({
        alumnoId: row.alumno_id,
        nombre: row.nombre,
        grado: row.grado,
        grupo: row.grupo || "",
        faltas: Number(row.faltas || 0),
        faltasConsecutivas: Number(row.faltas_consecutivas || 0),
        promedio: Number(row.promedio || 0),
        incidencias: Number(row.incidencias || 0),
        bap: Boolean(row.bap),
        decisionSugerida: row.decision_sugerida as DecisionPromocion,
      }));

      setCierreState((s) => ({
        ...s,
        simulacion: mapped,
        simulado: true,
        loading: false,
        overrides: {},
        resultado: null,
      }));

      toast.success(`Simulación completa: ${mapped.length} alumnos procesados`);
    } catch (err) {
      console.error("Error simulando:", err);
      toast.error("Error en simulación de promoción");
      setCierreState((s) => ({ ...s, loading: false }));
    }
  }, [cierreState.cicloActivo]);

  // ── Override manual de decisión ──
  const setOverride = useCallback(
    (alumnoId: string, decision: DecisionPromocion) => {
      setCierreState((prev) => ({
        ...prev,
        overrides: { ...prev.overrides, [alumnoId]: decision },
      }));
    },
    []
  );

  // ── Ejecutar promoción (RPC destructiva) ──
  const ejecutarPromocion = useCallback(async () => {
    const { cicloActivo, cicloNuevo, simulado } = cierreState;

    if (!simulado) {
      toast.error("Debe simular antes de ejecutar");
      return;
    }

    if (!cicloActivo || !cicloNuevo) {
      toast.error("Faltan datos de ciclos");
      return;
    }

    setCierreState((s) => ({ ...s, ejecutando: true }));

    try {
      const { data, error } = await supabase.rpc("ejecutar_promocion", {
        p_ciclo_actual: cicloActivo.id,
        p_ciclo_nuevo: cicloNuevo.id,
      });

      if (error) {
        toast.error(`Error en ejecución: ${error.message}`);
        setCierreState((s) => ({ ...s, ejecutando: false }));
        return;
      }

      const resultado = data as any;

      await logAudit(
        "CIERRE_CICLO",
        `Cierre de ciclo ${cicloActivo.nombre} → ${cicloNuevo.nombre}`,
        "ciclos_escolares",
        cicloActivo.id,
        undefined,
        { ciclo: cicloActivo.nombre },
        {
          ciclo_nuevo: cicloNuevo.nombre,
          promovidos: resultado?.promovidos,
          egresados: resultado?.egresados,
          bajas: resultado?.bajas,
        }
      );

      setCierreState((s) => ({
        ...s,
        ejecutando: false,
        resultado: {
          promovidos: resultado?.promovidos || 0,
          egresados: resultado?.egresados || 0,
          bajas: resultado?.bajas || 0,
          retenidos: resultado?.retenidos || 0,
        },
      }));

      toast.success("Cierre de ciclo ejecutado correctamente");
    } catch (err) {
      console.error("Error ejecutando cierre:", err);
      toast.error("Error al ejecutar cierre de ciclo");
      setCierreState((s) => ({ ...s, ejecutando: false }));
    }
  }, [cierreState, logAudit]);

  // ── Reset ──
  const resetCierre = useCallback(() => {
    setCierreState((s) => ({
      ...s,
      simulacion: [],
      overrides: {},
      simulado: false,
      resultado: null,
    }));
  }, []);

  return {
    cierre: cierreState,
    fetchCiclos,
    crearCicloNuevo,
    simularPromocion,
    setOverride,
    ejecutarPromocion,
    resetCierre,
  };
};
