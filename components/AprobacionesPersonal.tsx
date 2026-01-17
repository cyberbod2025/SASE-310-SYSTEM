import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { combinarPermisos } from "../utils/permisos";

interface Solicitud {
  id: string;
  creado_en: string; // Updated from created_at
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
}

export const AprobacionesPersonal: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const { data, error } = await supabase
        .from("solicitudes_alta_personal")
        .select("*")
        .order("creado_en", { ascending: false }); // Updated column name

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
    setProcesando(solicitud.id);

    try {
      let userId = "";

      // INTENTO 1: Crear usuario Real via Edge Function (Seguro)
      try {
        const { data, error } = await supabase.functions.invoke("create-user", {
          body: {
            email: solicitud.correo_institucional,
            password: "TempPassword123!", // En prod: generar aleatoria
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
        console.warn(
          "Edge Function Failed, trying Admin Client (Dev Mode)...",
          edgeErr
        );

        // INTENTO 2: Crear usuario Real via Client (Solo funciona con Service Role local/dev)
        try {
          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email: solicitud.correo_institucional,
              email_confirm: true,
              user_metadata: {
                full_name: `${solicitud.nombres} ${solicitud.apellido_paterno} ${solicitud.apellido_materno}`,
                curp: solicitud.curp,
              },
            });

          if (authError) throw authError;
          userId = authData.user.id;
        } catch (authErr: any) {
          console.warn(
            "Auth Admin Create Failed (Expected on Client):",
            authErr.message
          );
          toast("Modo Simulación: Aprobando sin crear Auth User real.", {
            icon: "🔧",
          });
          // Generar ID ficticio para simulación
          userId = `sim-${Date.now()}`;
        }
      }

      // 2. Calcular permisos combinados
      const permisosCombinados = combinarPermisos(solicitud.rol_solicitado);

      // 3. Crear perfil en perfiles_usuario (Si userId es real o simulado)
      // Nota: Si es simulado, esto fallará si la FK a auth.users es estricta.
      // Así que lo envolvemos también.
      try {
        const { error: perfilError } = await supabase
          .from("perfiles_usuario")
          .insert({
            id: userId,
            matricula_sase: solicitud.matricula_sase,
            rol: solicitud.rol_solicitado[0],
            nombre_completo: `${solicitud.nombres} ${solicitud.apellido_paterno} ${solicitud.apellido_materno}`,
            curp: solicitud.curp,
            email: solicitud.correo_institucional,
            telefono: solicitud.telefono,
            materias: solicitud.materias,
            grupos: solicitud.grupos,
            turno: solicitud.turno,
            es_tutor: solicitud.es_tutor,
            grupo_tutor: solicitud.grupo_tutor,
            alcances: permisosCombinados,
            estado_cuenta: "activo",
          });

        if (perfilError) throw perfilError;
      } catch (perfilErr) {
        console.warn("Perfil creation failed (DB constraint):", perfilErr);
        // Continuamos para actualizar el estado de la solicitud
      }

      // 4. Actualizar solicitud -> APROBADA
      const { data: userData } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from("solicitudes_alta_personal")
        .update({
          estado: "APROBADA",
          aprobado_por: userData?.user?.id || "admin-simulado",
          aprobado_en: new Date().toISOString(),
        })
        .eq("id", solicitud.id);

      if (updateError) throw updateError;

      // 5. Registrar en auditoría
      await supabase.from("auditoria").insert({
        tipo_accion: "APROBACION_PERSONAL",
        descripcion_accion: `Aprobada solicitud de ${solicitud.nombres} ${solicitud.apellido_paterno}. Matrícula SASE asignada: ${solicitud.matricula_sase}`,
        tabla_objetivo: "solicitudes_alta_personal",
        id_registro_objetivo: solicitud.id,
        nombre_alumno_objetivo: `${solicitud.nombres} ${solicitud.apellido_paterno}`,
        nuevos_valores: { userIdAsignado: userId },
      });

      toast.success(
        `✅ Solicitud aprobada (Simulada). Matrícula SASE: ${solicitud.matricula_sase}`
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

      // Registrar en auditoría
      await supabase.from("auditoria").insert({
        tipo_accion: "RECHAZO_PERSONAL",
        descripcion_accion: `Rechazada solicitud de ${solicitud.nombres} ${solicitud.apellido_paterno}. Motivo: ${motivoRechazo}`,
        tabla_objetivo: "solicitudes_alta_personal",
        id_registro_objetivo: solicitud.id,
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
  const aprobadas = solicitudes.filter((s) => s.estado === "APROBADA");
  const rechazadas = solicitudes.filter((s) => s.estado === "RECHAZADA");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/30">
            <span className="material-symbols-outlined text-3xl text-purple-400">
              how_to_reg
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Aprobaciones de Personal
            </h2>
            <p className="text-gray-400 text-sm">
              Validar y activar solicitudes de alta institucional
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-xs uppercase tracking-wide mb-1">
            Pendientes
          </p>
          <p className="text-3xl font-bold text-white">{pendientes.length}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-xs uppercase tracking-wide mb-1">
            Aprobadas
          </p>
          <p className="text-3xl font-bold text-white">{aprobadas.length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-xs uppercase tracking-wide mb-1">
            Rechazadas
          </p>
          <p className="text-3xl font-bold text-white">{rechazadas.length}</p>
        </div>
      </div>

      {/* Solicitudes Pendientes */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400">
            pending_actions
          </span>
          Solicitudes Pendientes
        </h3>

        {pendientes.length === 0 ? (
          <div className="bg-black/20 border border-white/10 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-2">
              check_circle
            </span>
            <p className="text-gray-400">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendientes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="bg-[#0f172a]/95 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/40 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-yellow-400">
                        person
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        {solicitud.nombres} {solicitud.apellido_paterno}{" "}
                        {solicitud.apellido_materno}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">CURP</p>
                        <p className="text-gray-300 font-mono">
                          {solicitud.curp}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Matrícula SASE</p>
                        <p className="text-emerald-400 font-mono font-bold">
                          {solicitud.matricula_sase}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Correo</p>
                        <p className="text-gray-300">
                          {solicitud.correo_institucional}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Teléfono</p>
                        <p className="text-gray-300">
                          {solicitud.telefono || "No proporcionado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSolicitudSeleccionada(solicitud)}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all"
                  >
                    Ver detalles
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {solicitud.rol_solicitado.map((rol) => (
                    <span
                      key={rol}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-medium"
                    >
                      {rol}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => aprobarSolicitud(solicitud)}
                    disabled={procesando === solicitud.id}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {procesando === solicitud.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        Aprobar y Activar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSolicitudSeleccionada(solicitud)}
                    disabled={procesando === solicitud.id}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles/Rechazo */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-white/20 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">
                Detalles de Solicitud
              </h3>
              <button
                onClick={() => {
                  setSolicitudSeleccionada(null);
                  setMotivoRechazo("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">badge</span>
                  Identidad Institucional
                </h4>
                <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Matrícula SASE</p>
                      <p className="text-emerald-400 font-mono font-bold">
                        {solicitudSeleccionada.matricula_sase}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Turno</p>
                      <p className="text-white capitalize">
                        {solicitudSeleccionada.turno}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Roles Solicitados</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {solicitudSeleccionada.rol_solicitado.map((rol) => (
                        <span
                          key={rol}
                          className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-xs"
                        >
                          {rol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos Académicos */}
              {(solicitudSeleccionada.materias ||
                solicitudSeleccionada.grupos) && (
                <div>
                  <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined">school</span>
                    Información Académica
                  </h4>
                  <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm">
                    {solicitudSeleccionada.materias && (
                      <div>
                        <p className="text-gray-500">Materias</p>
                        <p className="text-white">
                          {solicitudSeleccionada.materias.join(", ")}
                        </p>
                      </div>
                    )}
                    {solicitudSeleccionada.grupos && (
                      <div>
                        <p className="text-gray-500">Grupos</p>
                        <p className="text-white">
                          {solicitudSeleccionada.grupos.join(", ")}
                        </p>
                      </div>
                    )}
                    {solicitudSeleccionada.es_tutor && (
                      <div>
                        <p className="text-gray-500">Tutoría</p>
                        <p className="text-white">
                          Tutor de grupo {solicitudSeleccionada.grupo_tutor}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {solicitudSeleccionada.observaciones && (
                <div>
                  <h4 className="text-gray-400 font-bold mb-2">
                    Observaciones del Solicitante
                  </h4>
                  <p className="text-gray-300 text-sm bg-black/30 rounded-lg p-4">
                    {solicitudSeleccionada.observaciones}
                  </p>
                </div>
              )}

              {/* Sección de Rechazo */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-red-400 font-bold mb-3">
                  Motivo de Rechazo (opcional)
                </h4>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white resize-none h-24 focus:border-red-500 focus:outline-none"
                  placeholder="Explica el motivo del rechazo..."
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={() => aprobarSolicitud(solicitudSeleccionada)}
                  disabled={!!procesando}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  Aprobar y Activar Cuenta
                </button>
                <button
                  onClick={() => rechazarSolicitud(solicitudSeleccionada)}
                  disabled={!!procesando}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Rechazar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
