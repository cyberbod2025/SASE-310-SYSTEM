import { useState } from "react";
import { Notification, SystemNotice, UserRole, AppModule } from "../../types";
import toast from "react-hot-toast";

export const useNotificationSlice = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
      id: Math.random().toString(36).substr(2, 9),
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
