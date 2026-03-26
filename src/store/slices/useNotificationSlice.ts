import { useState } from "react";
import { Notification, SystemNotice, UserRole, AppModule } from "../../types";
import toast from "react-hot-toast";
import { generateSecureToken } from "../../utils/security";

export const useNotificationSlice = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      title: "Stock Crítico en Enfermería",
      message: "Paracetamol bajo (2 unidades). Se recomienda reabastecer.",
      read: false,
      time: "10:30 AM",
      type: "warning",
      actionModule: AppModule.DASHBOARD,
    },
    {
      id: "n2",
      title: "Justificante Pendiente",
      message: "Nuevo justificante de 3º B pendiente de validación.",
      read: false,
      time: "09:15 AM",
      type: "info",
      actionModule: AppModule.DASHBOARD,
    },
    {
      id: "n3",
      title: "Patrón de Riesgo Detectado",
      message: "Estudiante con 3+ incidencias requiere intervención.",
      read: false,
      time: "Ayer",
      type: "error",
      actionModule: AppModule.REPORTES,
    },
  ]);

  const [notices, setNotices] = useState<SystemNotice[]>([]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const addNotification = (
    data: Omit<Notification, "id" | "read" | "time">,
  ) => {
    const newNotif: Notification = {
      ...data,
      id: generateSecureToken(9),
      read: false,
      time: "Ahora mismo",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addSystemNotice = (
    notice: Omit<SystemNotice, "id" | "date" | "resolved">,
  ) => {
    const newNotice: SystemNotice = {
      ...notice,
      id: generateSecureToken(9),
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
