import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import type { Student } from "../../types";
import { UserRole } from "../../types";
import { GenericActionModal } from "../GenericActionModal";
import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import {
  deactivateHealthAlert,
  loadHealthMemory,
  persistHealthAlert,
  persistMedicalAttention,
  updateMedicalAttention,
} from "../salud/saludPersistence";
import type {
  HealthAlertRecord,
  HealthAlertType,
  MedicalAttentionRecord,
  MedicalAttentionStatus,
  MedicalExitType,
  MedicalUrgency,
} from "../salud/saludTypes";

const urgencyByLabel: Record<string, MedicalUrgency> = {
  "Baja": "baja",
  "Media": "media",
  "Alta": "alta",
  "Emergencia": "emergencia",
};

const statusByLabel: Record<string, MedicalAttentionStatus> = {
  "Abierta": "abierta",
  "En observación": "observacion",
  "Referida": "referida",
  "Cerrada": "cerrada",
};

const exitByLabel: Record<string, MedicalExitType> = {
  "Regreso a clase": "regreso_clase",
  "Entrega a familiar": "entrega_familiar",
  "Referencia médica": "referencia_medica",
  "Emergencia": "emergencia",
};

const alertTypeByLabel: Record<string, HealthAlertType> = {
  "Padecimiento": "padecimiento",
  "Alergia": "alergia",
  "Medicamento": "medicamento",
  "Otra precaución": "otra",
};

const statusLabels: Record<MedicalAttentionStatus, string> = {
  abierta: "Abierta",
  observacion: "En observación",
  referida: "Referida",
  cerrada: "Cerrada",
};

const urgencyLabels: Record<MedicalUrgency, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  emergencia: "Emergencia",
};

const alertTypeLabels: Record<HealthAlertType, string> = {
  padecimiento: "Padecimiento",
  alergia: "Alergia",
  medicamento: "Medicamento",
  otra: "Otra precaución",
};

interface AttentionFormData {
  reason?: string;
  symptoms?: string;
  assessment?: string;
  vitalSigns?: string;
  careProvided?: string;
  medication?: string;
  familyNotified?: string;
  familyPickedUp?: string;
  deliveryConditions?: string;
  observations?: string;
  status?: string;
  urgency?: string;
  followUpDate?: string;
  exitType?: string;
}

interface AlertFormData {
  type?: string;
  condition?: string;
  instructions?: string;
}

interface FollowUpFormData {
  status?: string;
  followUpDate?: string;
  exitType?: string;
  deliveryConditions?: string;
  observations?: string;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(date);
};

const mexicoDateKey = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(date);
};

const normalizeSearch = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export const DashboardSalud = () => {
  const { students, currentUserRole } = useApp();
  const institutionalStudents = students as Student[];
  const [memory, setMemory] = useState<{
    attentions: MedicalAttentionRecord[];
    alerts: HealthAlertRecord[];
  }>({ attentions: [], alerts: [] });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attentionModalOpen, setAttentionModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [followingAttentionId, setFollowingAttentionId] = useState<
    string | null
  >(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const canCreate = [
    UserRole.MEDICO_ESCOLAR,
    UserRole.SYSTEM_ADMIN,
  ].includes(currentUserRole);
  const canFollowUp = [
    UserRole.MEDICO_ESCOLAR,
    UserRole.DIRECTIVO,
    UserRole.SUBDIRECCION,
    UserRole.SYSTEM_ADMIN,
  ].includes(currentUserRole);

  const studentIds = useMemo(
    () => institutionalStudents.map((student) => student.id),
    [institutionalStudents],
  );

  const studentsById = useMemo(
    () => new Map(
      institutionalStudents.map((student) => [student.id, student]),
    ),
    [institutionalStudents],
  );

  const selectedStudent = studentsById.get(selectedStudentId) ?? null;
  const attentionToFollow = memory.attentions.find(
    (attention) => attention.id === followingAttentionId,
  ) ?? null;

  useEffect(() => {
    if (institutionalStudents.length === 0) {
      setSelectedStudentId("");
      return;
    }
    if (!institutionalStudents.some(
      (student) => student.id === selectedStudentId,
    )) {
      setSelectedStudentId(institutionalStudents[0].id);
    }
  }, [institutionalStudents, selectedStudentId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    loadHealthMemory(studentIds)
      .then((persistedMemory) => {
        if (!cancelled) setMemory(persistedMemory);
      })
      .catch((error) => {
        console.error("No se pudo cargar la memoria clínica", error);
        if (!cancelled) {
          setMemory({ attentions: [], alerts: [] });
          setLoadError(
            "No se pudo consultar la memoria clínica protegida.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentIds]);

  const filteredAttentions = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());
    if (!normalizedSearch) {
      return memory.attentions.filter(
        (attention) => attention.studentId === selectedStudentId,
      );
    }

    return memory.attentions.filter((attention) => {
      const student = studentsById.get(attention.studentId);
      return normalizeSearch([
        attention.studentName,
        student?.name,
        attention.group,
        student?.group,
        attention.reason,
        attention.symptoms,
      ].filter(Boolean).join(" ")).includes(normalizedSearch);
    });
  }, [
    memory.attentions,
    search,
    selectedStudentId,
    studentsById,
  ]);

  const selectedAlerts = useMemo(
    () => memory.alerts.filter(
      (alert) => alert.studentId === selectedStudentId && alert.active,
    ),
    [memory.alerts, selectedStudentId],
  );

  const metrics = useMemo(() => {
    const today = mexicoDateKey(new Date());
    return {
      today: memory.attentions.filter(
        (attention) => mexicoDateKey(attention.occurredAt) === today,
      ).length,
      pending: memory.attentions.filter(
        (attention) => attention.status !== "cerrada",
      ).length,
      urgent: memory.attentions.filter(
        (attention) =>
          attention.status !== "cerrada"
          && ["alta", "emergencia"].includes(attention.urgency),
      ).length,
      alerts: memory.alerts.filter((alert) => alert.active).length,
    };
  }, [memory]);

  const handleRegisterAttention = async (data: AttentionFormData) => {
    if (!selectedStudent) {
      throw new Error("Selecciona un alumno antes de registrar atención.");
    }

    const urgency = data.urgency
      ? urgencyByLabel[data.urgency]
      : undefined;
    const status = data.status ? statusByLabel[data.status] : undefined;
    const exitType = data.exitType
      ? exitByLabel[data.exitType]
      : undefined;

    if (
      !data.reason?.trim()
      || !data.symptoms?.trim()
      || !data.careProvided?.trim()
      || !urgency
      || !status
      || !data.familyNotified
      || !data.familyPickedUp
    ) {
      throw new Error("Completa los campos obligatorios de la atención.");
    }

    const persisted = await persistMedicalAttention({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      group: selectedStudent.group,
      reason: data.reason,
      symptoms: data.symptoms,
      assessment: data.assessment,
      vitalSigns: data.vitalSigns,
      careProvided: data.careProvided,
      medication: data.medication,
      familyNotified: data.familyNotified === "Sí",
      familyPickedUp: data.familyPickedUp === "Sí",
      deliveryConditions: data.deliveryConditions,
      observations: data.observations,
      status,
      urgency,
      followUpDate: data.followUpDate,
      exitType,
    });

    setMemory((current) => ({
      ...current,
      attentions: [
        persisted,
        ...current.attentions.filter(
          (attention) => attention.id !== persisted.id,
        ),
      ],
    }));
    setLastAction(
      `Atención de ${selectedStudent.name} guardada en la memoria clínica.`,
    );
  };

  const handleRegisterAlert = async (data: AlertFormData) => {
    if (!selectedStudent) {
      throw new Error("Selecciona un alumno antes de registrar una alerta.");
    }
    const type = data.type ? alertTypeByLabel[data.type] : undefined;
    if (!type || !data.condition?.trim() || !data.instructions?.trim()) {
      throw new Error("Completa los campos obligatorios de la alerta.");
    }

    const persisted = await persistHealthAlert({
      studentId: selectedStudent.id,
      type,
      condition: data.condition,
      instructions: data.instructions,
    });

    setMemory((current) => ({
      ...current,
      alerts: [
        persisted,
        ...current.alerts.filter((alert) => alert.id !== persisted.id),
      ],
    }));
    setLastAction(
      `Alerta clínica de ${selectedStudent.name} guardada de forma protegida.`,
    );
  };

  const handleFollowUp = async (data: FollowUpFormData) => {
    if (!attentionToFollow) {
      throw new Error("Selecciona una atención para dar seguimiento.");
    }
    const status = data.status ? statusByLabel[data.status] : undefined;
    const exitType = data.exitType
      ? exitByLabel[data.exitType]
      : undefined;
    if (!status) {
      throw new Error("Selecciona el estado del seguimiento.");
    }

    const persisted = await updateMedicalAttention(attentionToFollow.id, {
      status,
      followUpDate: data.followUpDate,
      deliveryConditions: data.deliveryConditions,
      observations: data.observations,
      exitType,
    });

    setMemory((current) => ({
      ...current,
      attentions: current.attentions.map((attention) =>
        attention.id === persisted.id ? persisted : attention
      ),
    }));
    setLastAction("Seguimiento médico actualizado y trazable.");
  };

  const handleDeactivateAlert = async (alertId: string) => {
    try {
      const persisted = await deactivateHealthAlert(alertId);
      setMemory((current) => ({
        ...current,
        alerts: current.alerts.filter(
          (alert) => alert.id !== persisted.id,
        ),
      }));
      setLastAction("Alerta clínica marcada como inactiva.");
      toast.success("Alerta clínica desactivada");
    } catch (error) {
      console.error("No se pudo desactivar la alerta clínica", error);
      toast.error("No se pudo desactivar la alerta clínica");
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-y-auto p-6 lg:p-8"
    >
      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">
            Memoria clínica protegida
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-wide text-white">
            Salud Escolar
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Atenciones, alertas vigentes, entrega y seguimiento sin convertir
            datos clínicos en incidencias disciplinarias.
          </p>
        </div>
        {canCreate && (
          <div className="flex flex-wrap gap-3">
            <NeoButton
              icon="medical_services"
              onClick={() => setAttentionModalOpen(true)}
              disabled={!selectedStudent}
            >
              Registrar atención
            </NeoButton>
            <NeoButton
              icon="health_and_safety"
              onClick={() => setAlertModalOpen(true)}
              disabled={!selectedStudent}
            >
              Registrar alerta clínica
            </NeoButton>
          </div>
        )}
      </header>

      {lastAction && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100"
        >
          {lastAction}
        </div>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Atenciones de hoy" value={metrics.today} />
        <Metric
          label="Seguimientos abiertos"
          value={metrics.pending}
          alert={metrics.pending > 0}
        />
        <Metric
          label="Alta prioridad"
          value={metrics.urgent}
          alert={metrics.urgent > 0}
        />
        <Metric label="Alertas activas" value={metrics.alerts} />
      </section>

      <section className="mb-6 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
          Alumno para consulta clínica
          <select
            aria-label="Alumno para consulta clínica"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm font-semibold text-white"
          >
            {institutionalStudents.length === 0 && (
              <option value="">Sin alumnos disponibles</option>
            )}
            {institutionalStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.group}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
          Buscar en atenciones
          <input
            aria-label="Buscar en atenciones"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Alumno, grupo, motivo o síntoma"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm font-semibold text-white placeholder:text-slate-600"
          />
        </label>
      </section>

      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-100"
        >
          {loadError}
        </div>
      )}

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <GlassCard
          icon="clinical_notes"
          title={
            search.trim()
              ? "Resultados de la búsqueda"
              : `Historial de ${selectedStudent?.name ?? "alumno"}`
          }
        >
          <div className="mt-4 space-y-4">
            {loading ? (
              <EmptyMessage text="Consultando memoria clínica protegida..." />
            ) : filteredAttentions.length === 0 ? (
              <EmptyMessage text="No hay atenciones persistidas para esta consulta." />
            ) : (
              filteredAttentions.map((attention) => {
                const student = studentsById.get(attention.studentId);
                return (
                  <article
                    key={attention.id}
                    className="rounded-2xl border border-white/10 bg-black/10 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Tag>{statusLabels[attention.status]}</Tag>
                          <Tag alert={[
                            "alta",
                            "emergencia",
                          ].includes(attention.urgency)}>
                            Prioridad {urgencyLabels[attention.urgency]}
                          </Tag>
                        </div>
                        <h2 className="mt-3 text-lg font-black text-white">
                          {student?.name
                            ?? attention.studentName
                            ?? "Alumno no disponible"}
                        </h2>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                          {student?.group ?? attention.group ?? "Sin grupo"} · {" "}
                          {formatDateTime(attention.occurredAt)}
                        </p>
                      </div>
                      {canFollowUp && attention.status !== "cerrada" && (
                        <NeoButton
                          icon="edit_note"
                          onClick={() => setFollowingAttentionId(attention.id)}
                        >
                          Registrar seguimiento
                        </NeoButton>
                      )}
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <ClinicalDetail label="Motivo" value={attention.reason} />
                      <ClinicalDetail
                        label="Síntomas u observaciones"
                        value={attention.symptoms}
                      />
                      <ClinicalDetail
                        label="Atención brindada"
                        value={attention.careProvided}
                      />
                      <ClinicalDetail
                        label="Signos vitales"
                        value={attention.vitalSigns}
                      />
                      <ClinicalDetail
                        label="Familia informada"
                        value={attention.familyNotified ? "Sí" : "No"}
                      />
                      <ClinicalDetail
                        label="Entrega a familiar"
                        value={attention.familyPickedUp ? "Sí" : "No"}
                      />
                      <ClinicalDetail
                        label="Próximo seguimiento"
                        value={attention.followUpDate}
                      />
                      <ClinicalDetail
                        label="Observaciones"
                        value={attention.observations}
                      />
                    </dl>
                  </article>
                );
              })
            )}
          </div>
        </GlassCard>

        <GlassCard icon="health_and_safety" title="Alertas clínicas activas">
          <p className="text-xs leading-5 text-slate-500">
            Precauciones vigentes del alumno seleccionado. Su consulta está
            limitada por rol institucional.
          </p>
          <div className="mt-4 space-y-3">
            {loading ? (
              <EmptyMessage text="Consultando alertas..." />
            ) : selectedAlerts.length === 0 ? (
              <EmptyMessage text="No hay alertas clínicas activas para este alumno." />
            ) : (
              selectedAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4"
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-rose-200">
                    {alertTypeLabels[alert.type]}
                  </p>
                  <h2 className="mt-2 text-sm font-black text-white">
                    {alert.condition}
                  </h2>
                  {alert.instructions && (
                    <p className="mt-2 text-xs leading-5 text-slate-300">
                      {alert.instructions}
                    </p>
                  )}
                  <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Actualizada {formatDateTime(alert.updatedAt)}
                  </p>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => handleDeactivateAlert(alert.id)}
                      className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-200 underline decoration-rose-400/40 underline-offset-4"
                    >
                      Marcar como inactiva
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GenericActionModal
        isOpen={attentionModalOpen}
        onClose={() => setAttentionModalOpen(false)}
        title="Registrar atención médica"
        description={
          selectedStudent
            ? `Memoria clínica de ${selectedStudent.name}`
            : "Selecciona un alumno"
        }
        fields={[
          {
            name: "reason",
            label: "Motivo de la atención",
            type: "text",
            required: true,
          },
          {
            name: "symptoms",
            label: "Síntomas u observaciones iniciales",
            type: "textarea",
            required: true,
          },
          {
            name: "vitalSigns",
            label: "Signos vitales documentados",
            type: "text",
          },
          {
            name: "careProvided",
            label: "Atención brindada",
            type: "textarea",
            required: true,
          },
          {
            name: "assessment",
            label: "Valoración registrada",
            type: "textarea",
          },
          {
            name: "medication",
            label: "Medicamento documentado",
            type: "text",
          },
          {
            name: "urgency",
            label: "Nivel de prioridad",
            type: "select",
            options: Object.keys(urgencyByLabel),
            required: true,
          },
          {
            name: "status",
            label: "Estado de la atención",
            type: "select",
            options: Object.keys(statusByLabel),
            required: true,
          },
          {
            name: "familyNotified",
            label: "¿Familia informada?",
            type: "select",
            options: ["Sí", "No"],
            required: true,
          },
          {
            name: "familyPickedUp",
            label: "¿Acudieron por el alumno?",
            type: "select",
            options: ["Sí", "No"],
            required: true,
          },
          {
            name: "followUpDate",
            label: "Fecha de próximo seguimiento",
            type: "date",
          },
          {
            name: "exitType",
            label: "Tipo de salida",
            type: "select",
            options: Object.keys(exitByLabel),
          },
          {
            name: "deliveryConditions",
            label: "Condiciones de entrega o referencia",
            type: "textarea",
          },
          {
            name: "observations",
            label: "Observaciones clínicas",
            type: "textarea",
          },
        ]}
        submitLabel="Guardar atención"
        onSubmit={handleRegisterAttention}
      />

      <GenericActionModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title="Registrar alerta clínica"
        description={
          selectedStudent
            ? `Precaución protegida de ${selectedStudent.name}`
            : "Selecciona un alumno"
        }
        fields={[
          {
            name: "type",
            label: "Tipo de alerta",
            type: "select",
            options: Object.keys(alertTypeByLabel),
            required: true,
          },
          {
            name: "condition",
            label: "Condición o precaución",
            type: "text",
            required: true,
          },
          {
            name: "instructions",
            label: "Indicaciones institucionales",
            type: "textarea",
            required: true,
          },
        ]}
        submitLabel="Guardar alerta protegida"
        onSubmit={handleRegisterAlert}
      />

      <GenericActionModal
        key={attentionToFollow?.id ?? "sin-seguimiento"}
        isOpen={attentionToFollow !== null}
        onClose={() => setFollowingAttentionId(null)}
        title="Registrar seguimiento médico"
        description={
          attentionToFollow
            ? `Atención: ${attentionToFollow.reason}`
            : undefined
        }
        fields={[
          {
            name: "status",
            label: "Nuevo estado",
            type: "select",
            options: Object.keys(statusByLabel),
            required: true,
          },
          {
            name: "followUpDate",
            label: "Próxima revisión",
            type: "date",
          },
          {
            name: "exitType",
            label: "Tipo de salida",
            type: "select",
            options: Object.keys(exitByLabel),
          },
          {
            name: "deliveryConditions",
            label: "Condiciones de entrega o referencia",
            type: "textarea",
          },
          {
            name: "observations",
            label: "Evidencia del seguimiento",
            type: "textarea",
          },
        ]}
        submitLabel="Guardar seguimiento"
        onSubmit={handleFollowUp}
      />
    </motion.main>
  );
};

const Metric = ({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) => (
  <div className={`rounded-2xl border p-4 text-center ${
    alert
      ? "border-amber-400/30 bg-amber-500/10"
      : "border-white/10 bg-white/[0.03]"
  }`}>
    <p className={`text-2xl font-black ${
      alert ? "text-amber-200" : "text-white"
    }`}>
      {value}
    </p>
    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
      {label}
    </p>
  </div>
);

const Tag = ({
  children,
  alert = false,
}: {
  children: React.ReactNode;
  alert?: boolean;
}) => (
  <span className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
    alert
      ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
      : "border-sky-400/20 bg-sky-500/10 text-sky-200"
  }`}>
    {children}
  </span>
);

const ClinicalDetail = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => (
  <div>
    <dt className="text-[9px] font-black uppercase tracking-widest text-slate-600">
      {label}
    </dt>
    <dd className="mt-1 leading-5 text-slate-300">
      {value || "No documentado"}
    </dd>
  </div>
);

const EmptyMessage = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm font-semibold text-slate-500">
    {text}
  </div>
);

export default DashboardSalud;
