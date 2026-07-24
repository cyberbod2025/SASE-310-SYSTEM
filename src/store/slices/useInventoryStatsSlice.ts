import { useState, useEffect } from "react";
import { supabase } from "../../supabase/client";
import { Suministro, DailyStats } from "../../types";
import toast from "react-hot-toast";

const getSchoolDate = (value: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(value);

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
    const today = getSchoolDate();
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
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        toast.error("No hay una sesión institucional activa");
        return false;
      }

      const { data, error } = await supabase
        .from("attendance_logs")
        .insert({
          alumno_id: alumnoId,
          estado,
          registrado_por: user.id,
          fecha: getSchoolDate(),
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("Este alumno ya tiene registro de asistencia hoy");
          return false;
        } else {
          throw error;
        }
      }
      if (!data?.id) {
        throw new Error("Supabase no confirmó el registro de asistencia.");
      }

      await fetchDailyStats();
      return true;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Error registering attendance");
      }
      toast.error("Error en registro de asistencia");
      return false;
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
