import { useEffect, useState } from "react";
import { Notification, SystemNotice, UserRole, AppModule } from "../../types";
import toast from "react-hot-toast";
import { supabase } from "../../supabase/client";

const mapDbNotification = (row: {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string | null;
  rol_destino: string | null;
  leida: boolean | null;
  creado_en: string | null;
}): Notification => {
  const timeLabel = row.creado_en
    ? new Date(row.creado_en).toLocaleString("es-MX")
    : "Ahora mismo";

  return {
    id: row.id,
    title: row.titulo,
    message: row.mensaje,
    type: (row.tipo as Notification["type"]) ?? "SYSTEM",
    targetRole: row.rol_destino as UserRole | undefined,
    read: row.leida ?? false,
    time: timeLabel,
  };
};

export const useNotificationSlice = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [notices, setNotices] = useState<SystemNotice[]>([]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const addNotification = async (
    data: Omit<Notification, "id" | "read" | "time">,
  ) => {
    try {
      const payload = {
        titulo: data.title,
        mensaje: data.message,
        tipo: data.type ?? "SYSTEM",
        rol_destino: data.targetRole ?? UserRole.PREFECTURA,
      };

      const { data: inserted, error } = await supabase
        .from("notificaciones" as any)
        .insert(payload)
        .select("id, titulo, mensaje, tipo, rol_destino, leida, creado_en")
        .single();

      if (error) throw error;
      if (!inserted) return;

      const mapped = mapDbNotification(inserted as any);
      setNotifications((prev) =>
        prev.some((n) => n.id === mapped.id) ? prev : [mapped, ...prev],
      );
    } catch (err) {
      console.error("Error creando notificación", err);
      toast.error("No se pudo crear la notificación");
    }
  };

  const addSystemNotice = (
    notice: Omit<SystemNotice, "id" | "date" | "resolved">,
  ) => {
    const newNotice: SystemNotice = {
      ...notice,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      resolved: false,
    };
    setNotices((prev) => [newNotice, ...prev]);
    addNotification({
      title: "Nuevo Aviso Administrativo",
      message: `${notice.requestedBy} solicita ${notice.type.replace("_", " ")} para ${notice.studentName}`,
      type: "SYSTEM",
      targetRole: UserRole.SECRETARIA,
    });
  };

  const resolveSystemNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, resolved: true } : n)),
    );
    toast.success("Aviso resuelto correctamente");
  };

  useEffect(() => {
    const channel = supabase
      .channel("notificaciones-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            titulo: string;
            mensaje: string;
            tipo: string | null;
            rol_destino: string | null;
            leida: boolean | null;
            creado_en: string | null;
          };
          const mapped = mapDbNotification(row);
          setNotifications((prev) =>
            prev.some((n) => n.id === mapped.id) ? prev : [mapped, ...prev],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    setNotifications,
    notices,
    setNotices,
    markNotificationRead,
    addNotification,
    addSystemNotice,
    resolveSystemNotice,
  };
};
