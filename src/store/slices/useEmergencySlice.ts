import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/client";
import { EmergencyAlert, EmergencyResponse } from "../../types/emergency";
import toast from "react-hot-toast";

export const useEmergencySlice = (user: any, userProfile: any) => {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [myActiveAlert, setMyActiveAlert] = useState<EmergencyAlert | null>(null);
  const [emergencyResponses, setEmergencyResponses] = useState<Record<string, EmergencyResponse[]>>({});
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const fetchActiveAlerts = useCallback(async () => {
    if (!user) return;
    setEmergencyLoading(true);
    
    const { data, error } = await supabase
      .from('alertas_emergencia' as any)
      .select('*')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const alerts = (data as unknown) as EmergencyAlert[];
      setActiveAlerts(alerts);
      
      // Encontrar si yo tengo una alerta activa
      const myAlert = alerts.find(a => a.docente_id === user.id);
      if (myAlert) setMyActiveAlert(myAlert);

      // Cargar respuestas para las alertas activas
      for (const alert of alerts) {
        const { data: respData } = await supabase
          .from('respuestas_alerta_emergencia' as any)
          .select('*')
          .eq('alerta_id', alert.id);
        
        if (respData) {
          setEmergencyResponses(prev => ({ ...prev, [alert.id]: (respData as unknown) as EmergencyResponse[] }));
        }
      }
    }
    setEmergencyLoading(false);
  }, [user]);

  const createEmergencyAlert = async (tipo: EmergencyAlert['tipo_alerta'], grupo?: string, aula?: string) => {
    if (!user || !userProfile) return;

    const { data, error } = await supabase
      .from('alertas_emergencia' as any)
      .insert([{
        tipo_alerta: tipo,
        grupo: grupo || 'N/A',
        aula: aula || 'N/A',
        docente_id: user.id,
        docente_nombre: userProfile.nombre_completo || user.email,
        prioridad: 'alta',
        estado: 'activa'
      }])
      .select()
      .single();

    if (error) {
      toast.error("Error al enviar alerta de emergencia");
      console.error(error);
    } else {
      const newAlert = (data as unknown) as EmergencyAlert;
      setMyActiveAlert(newAlert);
      setActiveAlerts(prev => [newAlert, ...prev]);
      toast.success("Alerta enviada. Personal responsable notificado.");
    }
  };

  const respondToEmergency = async (alertaId: string, respuesta: EmergencyResponse['respuesta']) => {
    if (!user || !userProfile) return;

    const { error } = await (supabase
      .from('respuestas_alerta_emergencia' as any)
      .insert([{
        alerta_id: alertaId,
        usuario_id: user.id,
        usuario_nombre: userProfile.nombre_completo || user.email,
        rol: userProfile.rol,
        respuesta: respuesta
      }]) as any);

    if (error) {
      toast.error("Error al enviar respuesta");
    } else {
      if (respuesta === 'atendida') {
        await supabase
          .from('alertas_emergencia' as any)
          .update({ estado: 'atendida', atendida_at: new Date().toISOString() } as any)
          .eq('id', alertaId);
      }
    }
  };

  const closeEmergencyAlert = async (alertaId: string) => {
    const { error } = await (supabase
      .from('alertas_emergencia' as any)
      .update({ 
        estado: 'atendida', 
        cerrada_at: new Date().toISOString() 
      } as any)
      .eq('id', alertaId) as any);

    if (!error) {
      setActiveAlerts(prev => prev.filter(a => a.id !== alertaId));
      if (myActiveAlert?.id === alertaId) setMyActiveAlert(null);
      toast.success("Alerta cerrada");
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchActiveAlerts();

    const channel = supabase
      .channel('emergency_realtime')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'alertas_emergencia' },
        () => fetchActiveAlerts()
      )
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'respuestas_alerta_emergencia' },
        (payload) => {
          const newResp = (payload.new as unknown) as EmergencyResponse;
          setEmergencyResponses(prev => ({
            ...prev,
            [newResp.alerta_id]: [...(prev[newResp.alerta_id] || []), newResp]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchActiveAlerts]);

  return {
    activeAlerts,
    myActiveAlert,
    emergencyResponses,
    emergencyLoading,
    createEmergencyAlert,
    respondToEmergency,
    closeEmergencyAlert,
    fetchActiveAlerts
  };
};
