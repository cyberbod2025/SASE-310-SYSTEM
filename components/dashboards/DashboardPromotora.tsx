import React, { useState } from "react";
import { useApp } from "../../store";
import { AppModule } from "../../types";

import { GenericActionModal, Field } from "../GenericActionModal";
import { supabase } from "../../supabase/client";
import { useAuth } from "../AuthProvider";

export const DashboardPromotora = () => {
  const [activeTab, setActiveTab] = useState<
    "AVANCES" | "EVENTOS" | "CITAS" | "EVIDENCIAS"
  >("AVANCES");
  const { setCurrentModule } = useApp();
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
    <div className="flex-1 w-full space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100 shadow-sm">
            <span className="material-symbols-outlined text-pink-600 text-3xl">
              menu_book
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Promoción de Lectura
            </h1>
            <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mt-1">
              Gestión de 12 Grupos Asignados
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats / Groups Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3].map((grade) =>
          ["A", "B", "C", "D"].map((group) => (
            <div
              key={`${grade}${group}`}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-pink-300 transition-colors"
            >
              <span className="text-sm font-black text-slate-700">
                {grade}º {group}
              </span>
              <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
                Activo
              </span>
            </div>
          ))
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: "AVANCES", label: "Actividades", icon: "trending_up" },
          { id: "EVENTOS", label: "Eventos", icon: "event" },
          { id: "CITAS", label: "Citas Padres", icon: "diversity_3" },
          { id: "EVIDENCIAS", label: "Evidencias", icon: "folder_open" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-pink-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
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
      <div className="bg-white border border-slate-200 rounded-2xl p-8 min-h-[400px]">
        {activeTab === "AVANCES" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase italic">
                Avance de Lectura
              </h3>
              <button
                className="px-4 py-2 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition"
                onClick={() => setModalOpen("ACTIVITY")}
              >
                + Nuevo Registro
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <h4 className="font-bold text-slate-700 mb-2">
                  Proyecto: "Un Viaje en el Tiempo"
                </h4>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  65% Completado
                </p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <h4 className="font-bold text-slate-700 mb-2">
                  Círculos de Lectura (1º Grado)
                </h4>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  40% Completado
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "EVENTOS" && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
              event_upcoming
            </span>
            <h3 className="text-lg font-bold text-slate-800">
              Calendario Cultural
            </h3>
            <p className="text-sm text-slate-500">
              Próxima gran feria del libro: 20 de Febrero
            </p>
          </div>
        )}

        {activeTab === "CITAS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase italic">
                Atención a Padres
              </h3>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                onClick={() => setModalOpen("APPOINTMENT")}
              >
                Agendar Cita
              </button>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl flex items-center gap-4 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
              <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                MF
              </div>
              <div>
                <p className="font-bold text-slate-700">
                  María Fernández (Mamá de Luis 1ºB)
                </p>
                <p className="text-xs text-slate-500">
                  Tema: Dificultades de comprensión lectora
                </p>
              </div>
              <span className="ml-auto text-xs font-bold bg-white border border-slate-200 px-3 py-1 rounded-full">
                Mañana, 09:00 AM
              </span>
            </div>
          </div>
        )}

        {activeTab === "EVIDENCIAS" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50 transition-all cursor-pointer"
              onClick={() => setModalOpen("EVIDENCE")}
            >
              <span className="material-symbols-outlined text-4xl text-slate-400">
                add_a_photo
              </span>
              <span className="text-xs font-bold text-slate-500 mt-2">
                Subir Evidencia
              </span>
            </div>
            {/* Placeholder for images */}
            <div className="aspect-square bg-slate-200 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">
                  Ver Detalles
                </span>
              </div>
            </div>
          </div>
        )}
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
            options: ["1º A", "1º B", "2º A", "2º B", "3º A", "3º B"],
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
