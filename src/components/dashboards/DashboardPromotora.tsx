import React, { useState } from "react";
import { useApp } from "../../store";
import { AppModule } from "../../types";

import { GenericActionModal, Field } from "../GenericActionModal";
import { supabase } from "../../supabase/client";
import { useAuth } from "../AuthProvider";

import toast from "react-hot-toast";

export const DashboardPromotora = () => {
  const [activeTab, setActiveTab] = useState<
    "AVANCES" | "EVENTOS" | "CITAS" | "EVIDENCIAS"
  >("AVANCES");
  const { setCurrentModule, addNotification } = useApp();
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState<
    "ACTIVITY" | "APPOINTMENT" | "EVIDENCE" | null
  >(null);

  const handleSaveActivity = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("activities_log" as any).insert({
      user_id: user.id,
      role: "promotora",
      type: data.type,
      description: data.description,
      date: data.date,
      group_id: data.group,
    });
    if (error) throw error;
  };

  const handleSaveAppointment = async (data: any) => {
    if (!user) return;
    // Map to citations table or generic log
    const { error } = await supabase.from("citas_padres" as any).insert({
      creado_por: user.id,
      alumno_id: data.student, // Storing name/text for now as per pilot flexibility
      fecha_cita: data.date,
      motivo: data.reason,
      estado: "PENDIENTE",
      observaciones: "Agendado por Promotora",
    });
    if (error) throw error;
  };

  const handleSaveEvidence = async (data: any) => {
    if (!user) return;
    const { error } = await supabase.from("evidence_log" as any).insert({
      user_id: user.id,
      role: "promotora",
      title: data.title,
      notes: data.notes,
      link: data.link,
      file_type: data.file ? data.file.name.split(".").pop() : "link",
    });
    if (error) throw error;
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar animate-fade-in flex flex-col gap-6">
      {/* Header - Institutional Light */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-5">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-pink-600 text-3xl">
              menu_book
            </span>
          </div>
          <div>
            <h2
              id="promotora-header"
              className="text-2xl font-black text-slate-800 tracking-tight"
            >
              Fomento a la Lectura
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              Gestión de 12 Grupos Asignados • SASE Institucional
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              addNotification({
                title: "Nuevo Proyecto de Lectura",
                message:
                  "La Promotoría ha lanzado una nueva iniciativa de lectura para todos los grupos.",
                type: "info",
                actionModule: AppModule.HOME,
              });
              toast.success("Proyecto difundido a todos los grupos");
            }}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">campaign</span>
            Difundir Proyecto
          </button>
        </div>
      </div>

      {/* Quick Stats / Groups Overview */}
      <div
        id="promotora-groups"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[1, 2, 3].map((grade) =>
          ["A", "B", "C", "D"].map((group) => (
            <div
              key={`${grade}${group}`}
              className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-pink-200 hover:shadow-md transition-all group cursor-default"
            >
              <span className="text-sm font-black text-slate-600 group-hover:text-pink-600 transition-colors">
                {grade}º {group}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                Activo
              </span>
            </div>
          )),
        )}
      </div>

      {/* Tabs - Institutional Pill Style */}
      <div
        id="promotora-tabs"
        className="flex gap-2 p-1 bg-white border border-slate-100 rounded-xl w-fit shadow-sm"
      >
        {[
          { id: "AVANCES", label: "Actividades", icon: "trending_up" },
          { id: "EVENTOS", label: "Eventos", icon: "event" },
          { id: "CITAS", label: "Citas Padres", icon: "diversity_3" },
          { id: "EVIDENCIAS", label: "Evidencias", icon: "folder_open" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === tab.id
                ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-105"
                : "bg-transparent text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-100 rounded-2xl p-8 min-h-[400px] shadow-sm relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -z-0 pointer-events-none opacity-50"></div>

        <div className="relative z-10">
          {activeTab === "AVANCES" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                  Avance de Lectura
                </h3>
                <button
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-900 transition shadow-lg hover:shadow-xl shadow-slate-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                  onClick={() => setModalOpen("ACTIVITY")}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Nuevo Registro
                </button>
              </div>

              {/* Empty State - Clean White Card instead of Grey Box */}
              <div className="p-16 border border-slate-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-white group hover:border-slate-300 transition-colors">
                <div className="p-4 bg-slate-50 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-pink-400 transition-colors">
                    library_books
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-700 uppercase mb-1">
                  Sin Proyectos Activos
                </h4>
                <p className="text-xs text-slate-400 font-medium max-w-xs">
                  Comience registrando una nueva actividad de lectura o taller
                  para los grupos asignados.
                </p>
              </div>
            </div>
          )}

          {activeTab === "EVENTOS" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                <span className="material-symbols-outlined text-5xl text-blue-400">
                  event_upcoming
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                Calendario Cultural
              </h3>
              <p className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                Próxima gran feria del libro:{" "}
                <span className="text-blue-600 font-bold">20 de Febrero</span>
              </p>
            </div>
          )}

          {activeTab === "CITAS" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Atención a Padres
                </h3>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition shadow-lg hover:shadow-xl shadow-blue-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                  onClick={() => setModalOpen("APPOINTMENT")}
                >
                  <span className="material-symbols-outlined text-sm">
                    calendar_add_on
                  </span>
                  Agendar Cita
                </button>
              </div>
              <div className="p-16 border border-slate-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-white">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <span className="material-symbols-outlined text-4xl text-slate-300">
                    event_busy
                  </span>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Sin citas programadas
                </p>
              </div>
            </div>
          )}

          {activeTab === "EVIDENCIAS" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div
                className="aspect-square bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-pink-400 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setModalOpen("EVIDENCE")}
              >
                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-pink-500 transition-colors">
                    add_a_photo
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-pink-600">
                  Subir Evidencia
                </span>
              </div>
              {/* Placeholder for images */}
              <div className="aspect-square bg-slate-100 rounded-2xl relative overflow-hidden group border border-slate-200">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white text-slate-800 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                    Ver Detalles
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <GenericActionModal
        isOpen={modalOpen === "ACTIVITY"}
        onClose={() => setModalOpen(null)}
        title="Registrar Actividad"
        description="Bitácora de Promoción de Lectura"
        fields={[
          {
            name: "type",
            label: "Tipo de Actividad",
            type: "select",
            options: [
              "Lectura en Voz Alta",
              "Círculo de Lectura",
              "Taller",
              "Préstamo de Libros",
              "Otro",
            ],
            required: true,
          },
          {
            name: "group",
            label: "Grupo",
            type: "select",
            options: [
              "1º A",
              "1º B",
              "1º C",
              "1º D",
              "2º A",
              "2º B",
              "2º C",
              "2º D",
              "3º A",
              "3º B",
              "3º C",
              "3º D",
            ],
            required: true,
          },
          {
            name: "description",
            label: "Descripción / Libro",
            type: "textarea",
            required: true,
          },
          { name: "date", label: "Fecha y Hora", type: "date", required: true },
        ]}
        onSubmit={handleSaveActivity}
      />
      <GenericActionModal
        isOpen={modalOpen === "APPOINTMENT"}
        onClose={() => setModalOpen(null)}
        title="Agendar Cita con Padres"
        description="Sistema Institucional de Citas"
        fields={[
          {
            name: "student",
            label: "Alumno / Padre de Familia",
            type: "text",
            required: true,
          },
          {
            name: "reason",
            label: "Motivo de la Cita",
            type: "select",
            options: [
              "Dificultades de Lectura",
              "Entrega de Material",
              "Seguimiento",
              "Otro",
            ],
            required: true,
          },
          {
            name: "date",
            label: "Fecha Propuesta",
            type: "date",
            required: true,
          },
        ]}
        onSubmit={handleSaveAppointment}
        submitLabel="Agendar"
      />
      <GenericActionModal
        isOpen={modalOpen === "EVIDENCE"}
        onClose={() => setModalOpen(null)}
        title="Subir Evidencia"
        description="Fotos, Videos o Documentos"
        fields={[
          {
            name: "title",
            label: "Título de la Evidencia",
            type: "text",
            required: true,
          },
          { name: "notes", label: "Descripción", type: "textarea" },
          {
            name: "link",
            label: "Enlace Externo (Drive/Youtube)",
            type: "text",
          },
          { name: "file", label: "Archivo", type: "file" },
        ]}
        onSubmit={handleSaveEvidence}
        submitLabel="Subir"
      />
    </div>
  );
};
