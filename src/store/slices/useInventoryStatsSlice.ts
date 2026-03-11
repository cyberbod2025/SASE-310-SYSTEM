import { useState, useEffect } from "react";
import { supabase } from "../../supabase/client";
import { Suministro, DailyStats } from "../../types";
import toast from "react-hot-toast";

export const useInventoryStatsSlice = (user: any) => {
  const [suministros, setSuministros] = useState<Suministro[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    attendanceCount: 0,
    lateCount: 0,
  });

  const fetchSuministros = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("suministros")
        .select("*")
        .order("nombre");
      if (error) throw error;
      if (data) {
        setSuministros(
          data.map((s: any) => ({
            id: s.id,
            nombre: s.nombre,
            cantidad: s.cantidad,
            cantidadMaxima: s.cantidad_maxima,
            categoria: s.categoria,
            unidad: s.unidad,
          })),
        );
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error fetching suministros");
      }
    }
  };

  const updateSuministroStock = async (id: string, delta: number) => {
    const item = suministros.find((s) => s.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.cantidad + delta);

    // Optimistic update
    setSuministros((prev) =>
      prev.map((s) => (s.id === id ? { ...s, cantidad: newQty } : s)),
    );

    try {
      const { error } = await (supabase as any)
        .from("suministros")
        .update({
          cantidad: newQty,
          ultima_actualizacion: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error updating stock");
      }
      fetchSuministros();
    }
  };

  const fetchDailyStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const { data, error } = await supabase
        .from("attendance_logs")
        .select("estado")
        .eq("fecha", today);

      if (error) throw error;

      if (data) {
        const attendanceCount = data.filter(
          (d: any) => d.estado === "presente" || d.estado === "retardo",
        ).length;
        const lateCount = data.filter(
          (d: any) => d.estado === "retardo",
        ).length;
        setDailyStats({ attendanceCount, lateCount });
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error fetching daily stats");
      }
    }
  };

  const registerAttendance = async (
    alumnoId: string,
    estado: "presente" | "falta" | "retardo" | "justificado",
  ) => {
    try {
      const { error } = await (supabase as any).from("attendance_logs").insert([
        {
          alumno_id: alumnoId,
          estado: estado,
          registrado_por: user?.id,
        },
      ] as any);

      if (error) {
        if (error.code === "23505") {
          toast.error("Este alumno ya tiene registro de asistencia hoy");
        } else {
          throw error;
        }
      } else {
        fetchDailyStats();
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error registering attendance");
      }
      toast.error("Error en registro de asistencia");
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuministros();
      fetchDailyStats();
    }
  }, [user]);

  return {
    suministros,
    setSuministros,
    dailyStats,
    setDailyStats,
    fetchSuministros,
    updateSuministroStock,
    fetchDailyStats,
    registerAttendance,
  };
};
