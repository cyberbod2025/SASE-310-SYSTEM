import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { combinarPermisos } from "../utils/permisos";

interface Solicitud {
  id: string;
  created_at: string;
  matricula_sase?: string; // Made optional as it might be missing in initial request
  rol_solicitado: string[];
  turno: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  correo_institucional: string;
  telefono: string | null;
  materias: string[] | null;
  grupos: string[] | null;
  es_tutor: boolean;
  grupo_tutor: string | null;
  area_cobertura: string | null;
  observaciones: string | null;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "OBSERVACIONES";
  observaciones_validacion: string | null;
  metadata?: {
    cct?: string;
    folio_solicitud?: string;
  };
}

export const AprobacionesPersonal: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentData, setAssignmentData] = useState({
    grupos: [] as string[],
    materias: [] as string[],
    es_tutor: false,
    grupo_tutor: "",
    matricula_sase: "",
  });

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const generarMatricula = (rol: string) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const rolePrefix =
      {
        docente: "DOC",
        prefectura: "PRE",
        orientacion: "ORI",
        trabajo_social: "SOC",
        enfermeria: "MED",
        udeii: "UDE",
        secretaria: "SEC",
        directivo: "DIR",
      }[rol] || "PER";

    // Using simple random suffix for now, can be replaced with
    // sequence from DB if exact incremental order is required
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `SASE-${year}-${rolePrefix}-${randomSuffix}`;
  };

  useEffect(() => {
    if (solicitudSeleccionada) {
      const rolPrincipal = solicitudSeleccionada.rol_solicitado[0];
      setAssignmentData({
        grupos: solicitudSeleccionada.grupos || [],
        materias: solicitudSeleccionada.materias || [],
        es_tutor: solicitudSeleccionada.es_tutor || false,
        grupo_tutor: solicitudSeleccionada.grupo_tutor || "",
        matricula_sase:
          solicitudSeleccionada.matricula_sase ||
          generarMatricula(rolPrincipal),
      });
    }
  }, [solicitudSeleccionada]);

  const cargarSolicitudes = async () => {
    try {
      const { data, error } = await supabase
        .from("solicitudes_alta_personal")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("SASE Debug: Solicitudes recuperadas de DB:", data);
      if (error) throw error;
      setSolicitudes((data as unknown as Solicitud[]) || []);
    } catch (error: any) {
      console.error("Error cargando solicitudes:", error);
      toast.error("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const aprobarSolicitud = async (solicitud: Solicitud) => {
    if (!assignmentData.matricula_sase) {
      toast.error("Debe asignar una Matrícula SASE");
      return;
    }

    setProcesando(solicitud.id);

    try {
      let userId = "";

      // INTENTO 1: Crear usuario Real via Edge Function (Seguro)
      try {
        // Generate a cryptographically safer-ish random temp password
        const tempPassword =
          Math.random().toString(36).slice(-10) +
          Math.random().toString(36).toUpperCase().slice(-4) +
          "!@#";

        const { data, error } = await supabase.functions.invoke("create-user", {
          body: {
            email: solicitud.correo_institucional,
            password: tempPassword,
            userData: {
              full_name: `${solicitud.nombres} ${solicitud.apellido_paterno} ${solicitud.apellido_materno}`,
              curp: solicitud.curp,
            },
          },
        });

        if (error) throw error;
        if (data?.user) {
          userId = data.user.id;
        } else {
          throw new Error("No user ID returned from Edge Function");
        }
      } catch (edgeErr: any) {
        if (import.meta.env.DEV) {
          console.warn(
            "Edge Function Failed (Expected if not deployed), using Simulation Mode...",
            edgeErr,
          );

          // MODO SIMULACIÓN: Para desarrollo/preview sin Edge Functions configuradas
          toast("Modo Simulación: Aprobando sin crear Auth User real.", {
            icon: "🔧",
          });
          userId = `sim-${Date.now()}`;
        } else {
          // En PROD, si la Edge Function falla, detenemos el proceso
          console.error("Critical Security Error in Edge Function:", edgeErr);
          toast.error(
            "Error Crítico de Seguridad: " +
              (edgeErr.message || "Fallo en creación de usuario"),
          );
          throw edgeErr;
        }
      }

      // 2. Calcular permisos combinados (Asumimos el rol principal como base)
      const rolesFinales = [...solicitud.rol_solicitado];
      if (assignmentData.es_tutor && !rolesFinales.includes("docente_tutor")) {
        rolesFinales.push("docente_tutor");
      }
      const permisosCombinados = combinarPermisos(rolesFinales);

      // 3. Crear perfil en perfiles_usuario
      try {
        const { error: perfilError } = await supabase
          .from("perfiles_usuario")
          .insert([
            {
              id: userId,
              matricula_sase: assignmentData.matricula_sase,
              rol: rolesFinales[0],
              nombre_completo: `${solicitud.nombres} ${solicitud.apellido_paterno} ${solicitud.apellido_materno}`,
              curp: solicitud.curp,
              email: solicitud.correo_institucional,
              telefono: solicitud.telefono || undefined,
              materias: assignmentData.materias.join(", "),
              grupos: assignmentData.grupos,
              turno: solicitud.turno,
              es_tutor: assignmentData.es_tutor,
              grupo_tutor: assignmentData.grupo_tutor,
              alcances: permisosCombinados,
              estado_cuenta: "activo",
            },
          ] as any);

        if (perfilError) throw perfilError;
      } catch (perfilErr) {
        console.warn("Perfil creation failed (DB constraint):", perfilErr);
      }

      // 4. Actualizar solicitud -> APROBADA
      const { data: userData } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from("solicitudes_alta_personal")
        .update({
          estado: "APROBADA",
          aprobado_por: userData?.user?.id || "admin-simulado",
          aprobado_en: new Date().toISOString(),
          matricula_sase: assignmentData.matricula_sase,
          es_tutor: assignmentData.es_tutor,
          grupo_tutor: assignmentData.grupo_tutor,
          materias: assignmentData.materias,
          grupos: assignmentData.grupos,
        })
        .eq("id", solicitud.id);

      if (updateError) throw updateError;

      // 5. Registrar en auditoría
      await supabase.from("audit_log").insert({
        action_type: "APROBACION_PERSONAL",
        action_description: `Aprobada solicitud de ${solicitud.nombres} ${solicitud.apellido_paterno}. Matrícula SASE asignada: ${assignmentData.matricula_sase}`,
        target_table: "solicitudes_alta_personal",
        target_record_id: solicitud.id,
        target_student_name: `${solicitud.nombres} ${solicitud.apellido_paterno}`,
        new_values: { userIdAsignado: userId, asignacion: assignmentData },
      });

      toast.success(
        `✅ Personal activado con éxito. Matrícula: ${assignmentData.matricula_sase}`,
      );
      cargarSolicitudes();
      setSolicitudSeleccionada(null);
    } catch (error: any) {
      console.error("Error crítico aprobando solicitud:", error);
      toast.error(error.message || "Error al aprobar solicitud");
    } finally {
      setProcesando(null);
    }
  };

  const rechazarSolicitud = async (solicitud: Solicitud) => {
    if (!motivoRechazo.trim()) {
      toast.error("Ingresa un motivo de rechazo");
      return;
    }

    setProcesando(solicitud.id);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("solicitudes_alta_personal")
        .update({
          estado: "RECHAZADA",
          observaciones_validacion: motivoRechazo,
          aprobado_por: userData?.user?.id,
          aprobado_en: new Date().toISOString(),
        })
        .eq("id", solicitud.id);

      if (error) throw error;

      await supabase.from("audit_log").insert({
        action_type: "RECHAZO_PERSONAL",
        action_description: `Rechazada solicitud de ${solicitud.nombres} ${solicitud.apellido_paterno}. Motivo: ${motivoRechazo}`,
        target_table: "solicitudes_alta_personal",
        target_record_id: solicitud.id,
      });

      toast.success("❌ Solicitud rechazada");
      cargarSolicitudes();
      setSolicitudSeleccionada(null);
      setMotivoRechazo("");
    } catch (error: any) {
      console.error("Error rechazando solicitud:", error);
      toast.error("Error al rechazar solicitud");
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  const pendientes = solicitudes.filter((s) => s.estado === "PENDIENTE");
  const aprobadas = solicitudes.filter(
    (s) => s.estado === "APROBADA" || s.estado === ("APROBADO" as any),
  );
  const rechazadas = solicitudes.filter(
    (s) => s.estado === "RECHAZADA" || s.estado === ("RECHAZADO" as any),
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#1e2d45]/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <span className="material-symbols-outlined text-4xl text-blue-400">
              verified_user
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Control de <span className="text-blue-500">Altas</span>
            </h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              Gestión Estratégica de Personal • SASE-310
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => cargarSolicitudes()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              title="Forzar recarga manual de la lista de solicitudes"
              disabled={loading}
            >
              <span
                className={`material-symbols-outlined text-sm ${loading ? "animate-spin" : ""}`}
              >
                sync
              </span>
              {loading ? "Sincronizando..." : "Forzar Recarga"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          label="Pendientes"
          value={pendientes.length}
          color="text-amber-500"
          bg="bg-amber-500/5"
        />
        <StatCard
          label="Aprobadas"
          value={aprobadas.length}
          color="text-emerald-500"
          bg="bg-emerald-500/5"
        />
        <StatCard
          label="Rechazadas"
          value={rechazadas.length}
          color="text-red-500"
          bg="bg-red-500/5"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] px-2 flex items-center gap-4">
          Lista de Espera
          <div className="flex-1 h-px bg-white/5"></div>
        </h3>

        {pendientes.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-4">
              emoji_events
            </span>
            <p className="text-white/40 font-bold uppercase tracking-widest">
              Sin solicitudes pendientes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendientes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="group bg-[#1e2d45]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => setSolicitudSeleccionada(solicitud)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                    <span className="material-symbols-outlined">
                      person_pin
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                      {solicitud.nombres} {solicitud.apellido_paterno}
                    </h4>
                    <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                      {solicitud.rol_solicitado.join(" + ")} • {solicitud.turno}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-white/20">
                    arrow_forward_ios
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-widest">
                  <div className="bg-white/5 p-2 rounded-lg text-white/40">
                    CURP:{" "}
                    <span className="text-white/70">
                      {solicitud.curp.slice(0, 10)}...
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg text-white/40">
                    Enviado:{" "}
                    <span className="text-white/70">
                      {new Date(solicitud.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-[#0a1930] border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    Validación de{" "}
                    <span className="text-blue-500">Expediente</span>
                  </h3>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                    Acceso Nivel Direccion
                  </p>
                </div>
                <button
                  onClick={() => setSolicitudSeleccionada(null)}
                  className="size-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
                  title="Cerrar el expediente de la solicitud"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Info Solicitante */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                      Identidad Civil
                    </label>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <p className="text-white font-black uppercase tracking-tight text-lg mb-1">
                        {solicitudSeleccionada.nombres}{" "}
                        {solicitudSeleccionada.apellido_paterno}{" "}
                        {solicitudSeleccionada.apellido_materno}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                          CURP: {solicitudSeleccionada.curp}
                        </p>
                        {solicitudSeleccionada.metadata?.cct && (
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                            CCT: {solicitudSeleccionada.metadata.cct}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                      Contacto Institucional
                    </label>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-white/20 text-sm">
                          mail
                        </span>
                        <span className="text-xs text-white/60 font-bold">
                          {solicitudSeleccionada.correo_institucional}
                        </span>
                      </div>
                      {solicitudSeleccionada.telefono && (
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-white/20 text-sm">
                            phone
                          </span>
                          <span className="text-xs text-white/60 font-bold">
                            {solicitudSeleccionada.telefono}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-4">
                      Rechazar
                      <div className="flex-1 h-px bg-red-500/10"></div>
                    </label>
                    <textarea
                      value={motivoRechazo}
                      onChange={(e) => setMotivoRechazo(e.target.value)}
                      className="w-full bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-white text-xs placeholder:text-red-900/40 focus:ring-2 focus:ring-red-500/50 outline-none transition-all h-24"
                      placeholder="Especificar motivo si se rechaza..."
                    />
                    <button
                      onClick={() => rechazarSolicitud(solicitudSeleccionada)}
                      className="w-full py-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl border border-red-600/30 transition-all"
                      title="Rechazar definitivamente esta solicitud de acceso"
                    >
                      Ejecutar Rechazo
                    </button>
                  </div>
                </div>

                {/* Asignación Director */}
                <div className="bg-[#1e2d45]/40 rounded-[2rem] p-8 border border-white/5 shadow-inner">
                  <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                    Configuración de Rol
                    <div className="flex-1 h-px bg-blue-500/20"></div>
                  </h4>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-2">
                        Matrícula SASE (Generada Automáticamente)
                      </label>
                      <div className="w-full bg-blue-600/10 border border-blue-500/30 rounded-2xl px-5 py-4 text-blue-400 font-black tracking-[0.3em] shadow-inner flex items-center justify-between">
                        <span>{assignmentData.matricula_sase}</span>
                        <span className="material-symbols-outlined text-xs opacity-50">
                          lock
                        </span>
                      </div>
                      <p className="mt-2 text-[8px] font-bold text-white/20 uppercase tracking-widest ml-2">
                        Identificador inamovible para expediente auditado
                      </p>
                    </div>

                    <div className="group">
                      <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-2">
                        Grupos Asignados (ej: 1A, 2B)
                      </label>
                      <input
                        type="text"
                        value={assignmentData.grupos.join(", ")}
                        onChange={(e) =>
                          setAssignmentData({
                            ...assignmentData,
                            grupos: e.target.value
                              .split(",")
                              .map((g) => g.trim().toUpperCase()),
                          })
                        }
                        placeholder="SEPARAR CON COMAS"
                        title="Especificar grupos asignados (ej: 1A, 2B)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="flex border-t border-white/5 pt-6 mt-6">
                      <div className="flex-1">
                        <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
                          Asignar Tutoría
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setAssignmentData({
                              ...assignmentData,
                              es_tutor: !assignmentData.es_tutor,
                            })
                          }
                          title="Alternar estado de tutoría para el personal"
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${assignmentData.es_tutor ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/5 text-white/40"}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {assignmentData.es_tutor
                              ? "check_circle"
                              : "circle"}
                          </span>
                          <span className="text-[10px] font-black uppercase">
                            Es Tutor
                          </span>
                        </button>
                      </div>
                      {assignmentData.es_tutor && (
                        <div className="flex-1">
                          <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
                            Grupo Tutoreado
                          </label>
                          <input
                            type="text"
                            value={assignmentData.grupo_tutor}
                            onChange={(e) =>
                              setAssignmentData({
                                ...assignmentData,
                                grupo_tutor: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="EJ: 1-D"
                            title="Especificar el grupo tutoreado"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-8">
                      <button
                        disabled={procesando === solicitudSeleccionada.id}
                        onClick={() => aprobarSolicitud(solicitudSeleccionada)}
                        className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        title="Finalizar proceso y activar las credenciales del personal"
                      >
                        {procesando === solicitudSeleccionada.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">
                              how_to_reg
                            </span>
                            Activar Personal
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) => (
  <div
    className={`${bg} border border-white/5 rounded-3xl p-6 transition-all hover:scale-105`}
  >
    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">
      {label}
    </p>
    <p className={`text-4xl font-black italic ${color}`}>{value}</p>
  </div>
);
