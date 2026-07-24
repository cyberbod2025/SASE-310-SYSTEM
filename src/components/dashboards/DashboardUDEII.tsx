import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useApp } from "../../store";
import type { BAPInfo, Student } from "../../types";
import { GenericActionModal } from "../GenericActionModal";
import {
  loadBapTracking,
  persistBapEvent,
} from "../udeii/udeiiPersistence";
import type {
  BapEventType,
  BapStatus,
  BapTrackingRecord,
} from "../udeii/udeiiTypes";

const eventTypeByLabel: Record<string, BapEventType> = {
  "Detección de barrera": "deteccion",
  "Ajuste razonable": "ajuste",
  "Seguimiento": "seguimiento",
  "Revisión": "revision",
  "Cierre": "cierre",
};

const statusByLabel: Record<string, BapStatus> = {
  "Activo": "activo",
  "En seguimiento": "en_seguimiento",
  "Cumplido": "cumplido",
  "Cerrado": "cerrado",
  "Cancelado": "cancelado",
};

const eventLabels: Record<BapEventType, string> = {
  deteccion: "Detección",
  ajuste: "Ajuste razonable",
  seguimiento: "Seguimiento",
  revision: "Revisión",
  cierre: "Cierre",
};

const statusLabels: Record<BapStatus, string> = {
  activo: "Activo",
  en_seguimiento: "En seguimiento",
  cumplido: "Cumplido",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

interface BapFormData {
  eventType?: string;
  barrierType?: string;
  action?: string;
  status?: string;
  observations?: string;
  responsible?: string;
  reviewDate?: string;
}

const formatDate = (value: string | null) => {
  if (!value) return "Sin fecha";
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: "America/Mexico_City",
  }).format(new Date(normalizedValue));
};

export const DashboardUDEII = () => {
  const {
    students,
    fetchStudents,
    printDocument,
  } = useApp();
  const institutionalStudents = students as Student[];
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentToAddId, setStudentToAddId] = useState("");
  const [history, setHistory] = useState<BapTrackingRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [bapOverrides, setBapOverrides] = useState<Record<string, BAPInfo>>({});
  const [lastAction, setLastAction] = useState<string | null>(null);

  const studentIds = useMemo(
    () => institutionalStudents.map((student) => student.id),
    [institutionalStudents],
  );

  const effectiveBapInfo = (student: Student) =>
    bapOverrides[student.id] ?? student.bapInfo;

  const studentsWithBAP = useMemo(
    () => institutionalStudents.filter(
      (student) => (bapOverrides[student.id] ?? student.bapInfo)?.hasBAP,
    ),
    [bapOverrides, institutionalStudents],
  );

  const selectedStudent = institutionalStudents.find(
    (student) => student.id === selectedStudentId,
  ) ?? null;

  const selectedHistory = useMemo(
    () => history.filter((record) => record.studentId === selectedStudentId),
    [history, selectedStudentId],
  );

  const pendingReviews = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return history.filter(
      (record) =>
        record.reviewDate
        && record.reviewDate <= today
        && !["cumplido", "cerrado", "cancelado"].includes(record.status),
    ).length;
  }, [history]);

  useEffect(() => {
    if (institutionalStudents.length === 0) {
      setSelectedStudentId("");
      setStudentToAddId("");
      return;
    }

    const selectionExists = institutionalStudents.some(
      (student) => student.id === selectedStudentId,
    );
    if (!selectionExists) {
      setSelectedStudentId(
        studentsWithBAP[0]?.id ?? institutionalStudents[0].id,
      );
    }
    if (!studentToAddId) {
      setStudentToAddId(institutionalStudents[0].id);
    }
  }, [
    institutionalStudents,
    selectedStudentId,
    studentToAddId,
    studentsWithBAP,
  ]);

  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    setHistoryError(null);

    loadBapTracking(studentIds)
      .then((records) => {
        if (!cancelled) setHistory(records);
      })
      .catch((error) => {
        console.error("No se pudo cargar la memoria BAP", error);
        if (!cancelled) {
          setHistory([]);
          setHistoryError("No se pudo consultar la memoria institucional BAP.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentIds]);

  const openTrackingFor = (studentId: string) => {
    setSelectedStudentId(studentId);
    setModalOpen(true);
  };

  const handleRegisterTracking = async (data: BapFormData) => {
    if (!selectedStudent) {
      throw new Error("Selecciona un alumno antes de registrar seguimiento.");
    }

    const eventType = data.eventType
      ? eventTypeByLabel[data.eventType]
      : undefined;
    const status = data.status ? statusByLabel[data.status] : undefined;

    if (
      !eventType
      || !status
      || !data.barrierType?.trim()
      || !data.action?.trim()
      || !data.responsible?.trim()
    ) {
      throw new Error("Completa los campos obligatorios del seguimiento BAP.");
    }

    const persisted = await persistBapEvent({
      studentId: selectedStudent.id,
      eventType,
      barrierType: data.barrierType,
      action: data.action,
      status,
      observations: data.observations,
      responsible: data.responsible,
      reviewDate: data.reviewDate,
    });

    setHistory((current) => [
      persisted.record,
      ...current.filter((record) => record.id !== persisted.record.id),
    ]);
    setBapOverrides((current) => ({
      ...current,
      [selectedStudent.id]: persisted.bapInfo,
    }));
    setLastAction(
      `${eventLabels[persisted.record.eventType]} guardado en la memoria institucional.`,
    );

    try {
      await fetchStudents();
    } catch (error) {
      console.error("El evento BAP se guardó, pero no se refrescó el padrón", error);
      toast("El seguimiento se guardó; actualiza la vista para refrescar el padrón.");
    }
  };

  const printSelectedLog = () => {
    if (!selectedStudent) return;
    printDocument({
      type: "BITACORA",
      studentId: selectedStudent.id,
      data: {
        ...(effectiveBapInfo(selectedStudent) ?? {
          hasBAP: false,
          diagnosisPrivate: "",
          accommodations: [],
          lastUpdated: "",
        }),
        details: "Bitácora institucional de barreras, ajustes y seguimiento UDEII.",
        seguimiento: selectedHistory,
      },
    });
  };

  return (
    <main className="flex-1 min-h-screen p-6 lg:p-10 space-y-8 bg-transparent relative overflow-y-auto custom-scrollbar font-sans selection:bg-indigo-500/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-[#0a0f18] border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden backdrop-blur-xl">
            <span className="material-symbols-outlined text-4xl">
              accessibility_new
            </span>
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-px bg-indigo-500/50 shadow-[0_0_10px_#6366f1]"
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.28em]">
              Área de inclusión y apoyo especializado
            </p>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              Memoria <span className="text-indigo-400">UDEII</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Barreras, ajustes razonables, responsables y próximas revisiones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="Casos activos" value={studentsWithBAP.length} />
          <Metric label="Eventos" value={history.length} />
          <Metric label="Revisiones pendientes" value={pendingReviews} alert={pendingReviews > 0} />
        </div>
      </header>

      {historyError && (
        <div role="alert" className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
          {historyError}
        </div>
      )}

      {lastAction && (
        <div role="status" className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-200">
          {lastAction}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section data-sasito-target="bap-monitor" className="xl:col-span-2 card-sase border-white/5 bg-[#0a0f18]/40 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">
                Monitor de barreras
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Casos BAP activos
              </h2>
            </div>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400">
              {studentsWithBAP.length} expedientes
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-[9px] uppercase font-black border-b border-white/5">
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Barrera registrada</th>
                  <th className="px-6 py-4">Ajustes vigentes</th>
                  <th className="px-6 py-4 text-right">Seguimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {studentsWithBAP.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                      No hay casos BAP activos. Puedes iniciar uno desde el panel de registro.
                    </td>
                  </tr>
                )}
                {studentsWithBAP.map((student) => {
                  const bapInfo = effectiveBapInfo(student);
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        selectedStudentId === student.id
                          ? "bg-indigo-500/[0.08]"
                          : "hover:bg-indigo-500/[0.03]"
                      }`}
                    >
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(student.id)}
                          className="text-left"
                        >
                          <span className="block font-black text-white text-sm uppercase">
                            {student.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {student.group}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-indigo-500/5 border border-indigo-500/20 text-[9px] font-black text-indigo-300 rounded uppercase">
                          {bapInfo?.diagnosisPrivate || "Sin barrera especificada"}
                        </span>
                      </td>
                      <td className="px-6 py-5 max-w-sm">
                        <p className="text-[11px] text-slate-300 font-medium line-clamp-2">
                          {bapInfo?.accommodations.join(", ")
                            || "Sin ajustes registrados"}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openTrackingFor(student.id)}
                          className="min-h-11 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-indigo-100 hover:bg-indigo-500/20"
                        >
                          Registrar evento
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card-sase p-6 border-indigo-500/20 bg-indigo-500/[0.03]">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">
              Nuevo seguimiento
            </p>
            <h2 className="mt-1 text-lg font-black text-white">
              Seleccionar alumno
            </h2>
            <select
              aria-label="Alumno para seguimiento BAP"
              value={studentToAddId}
              onChange={(event) => setStudentToAddId(event.target.value)}
              className="mt-4 w-full min-h-12 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-semibold text-white"
            >
              {institutionalStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.group}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!studentToAddId}
              onClick={() => openTrackingFor(studentToAddId)}
              className="mt-3 w-full min-h-12 rounded-xl bg-indigo-600 px-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Iniciar o continuar apoyo
            </button>
          </section>

          <section className="card-sase p-6 border-white/10 bg-[#0a0f18]/40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Expediente seleccionado
            </p>
            {selectedStudent ? (
              <>
                <h2 className="mt-2 text-lg font-black text-white">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs font-bold text-slate-500">{selectedStudent.group}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[9px] font-black uppercase text-slate-500">Eventos</p>
                    <p className="mt-1 text-2xl font-black text-white">{selectedHistory.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[9px] font-black uppercase text-slate-500">Ajustes</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {effectiveBapInfo(selectedStudent)?.accommodations.length ?? 0}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={printSelectedLog}
                  className="mt-4 w-full min-h-11 rounded-xl border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-slate-200 hover:bg-white/[0.08]"
                >
                  Imprimir bitácora individual
                </button>
              </>
            ) : (
              <p className="mt-3 text-sm font-semibold text-slate-500">
                No hay alumno seleccionado.
              </p>
            )}
          </section>
        </aside>
      </div>

      <section className="card-sase border-white/5 bg-[#0a0f18]/40 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">
            Memoria institucional
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            Historial de {selectedStudent?.name ?? "seguimiento BAP"}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {loadingHistory && (
            <p className="text-sm font-semibold text-slate-400">
              Consultando seguimientos persistidos...
            </p>
          )}
          {!loadingHistory && selectedHistory.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm font-semibold text-slate-400">
              Este alumno aún no tiene eventos BAP persistidos.
            </p>
          )}
          {selectedHistory.map((record) => (
            <article key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-200">
                      {eventLabels[record.eventType]}
                    </span>
                    <span className="rounded-lg border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      {statusLabels[record.status]}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black text-white">
                    {record.barrierType}
                  </h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                    {record.action}
                  </p>
                  {record.observations && (
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {record.observations}
                    </p>
                  )}
                </div>
                <div className="min-w-48 text-left md:text-right">
                  <p className="text-xs font-black text-white">
                    Responsable: {record.responsible}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                    Registrado: {formatDate(record.createdAt)}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                    Revisión: {formatDate(record.reviewDate)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <GenericActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar seguimiento BAP"
        description={
          selectedStudent
            ? `Memoria institucional de ${selectedStudent.name}`
            : "Selecciona un alumno"
        }
        fields={[
          {
            name: "eventType",
            label: "Tipo de evento",
            type: "select",
            options: Object.keys(eventTypeByLabel),
            required: true,
          },
          {
            name: "barrierType",
            label: "Barrera para el aprendizaje o la participación",
            type: "text",
            required: true,
          },
          {
            name: "action",
            label: "Ajuste, intervención o acuerdo verificable",
            type: "textarea",
            required: true,
          },
          {
            name: "status",
            label: "Estado del seguimiento",
            type: "select",
            options: Object.keys(statusByLabel),
            required: true,
          },
          {
            name: "responsible",
            label: "Responsable de la siguiente acción",
            type: "text",
            required: true,
          },
          {
            name: "reviewDate",
            label: "Fecha de próxima revisión",
            type: "date",
          },
          {
            name: "observations",
            label: "Observaciones institucionales",
            type: "textarea",
          },
        ]}
        submitLabel="Guardar en memoria BAP"
        onSubmit={handleRegisterTracking}
      />
    </main>
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
  <div className={`min-w-24 rounded-2xl border p-3 text-center ${
    alert
      ? "border-amber-400/30 bg-amber-500/10"
      : "border-white/10 bg-white/[0.03]"
  }`}>
    <p className={`text-2xl font-black ${alert ? "text-amber-200" : "text-white"}`}>
      {value}
    </p>
    <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </p>
  </div>
);

export default DashboardUDEII;
