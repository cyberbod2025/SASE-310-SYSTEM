import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApp } from "../store";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { AlumnoCiclo } from "../types";

// --- Sub-componentes ---

const AlumnoCard = ({ alumno, isDragging = false }: { alumno: AlumnoCiclo, isDragging?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSorting } = useSortable({
    id: alumno.id,
    data: {
      type: "Alumno",
      alumno,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging || isSorting ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
        alumno.locked ? "border-amber-200 bg-amber-50/50" : "border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
            {alumno.nombreAlumno?.substring(0, 2)}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-700 uppercase truncate max-w-[150px]">
              {alumno.nombreAlumno}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                alumno.bapAlumno ? "bg-purple-100 text-purple-600" : "bg-slate-50 text-slate-400"
              }`}>
                {alumno.bapAlumno ? "BAP" : "REGULAR"}
              </span>
              {alumno.grupoSugerido && (
                <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded animate-pulse">
                  Sug: {alumno.grupoSugerido}
                </span>
              )}
            </div>
          </div>
        </div>
        {alumno.locked && (
          <span className="material-icons text-amber-400 text-xs">lock</span>
        )}
      </div>
    </div>
  );
};

const GrupoContainer = ({ id, title, alumnos }: { id: string, title: string, alumnos: AlumnoCiclo[] }) => {
  const { setNodeRef } = useSortable({
    id,
    data: {
      type: "Grupo",
      grupoId: id,
    },
  });

  const stats = useMemo(() => {
    const total = alumnos.length;
    const bapCount = alumnos.filter(a => a.bapAlumno).length;
    return { total, bapCount };
  }, [alumnos]);

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-slate-50/50 rounded-2xl border border-slate-100/50 p-4">
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Alumnos: <span className="text-slate-800">{stats.total}</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              BAP: <span className="text-purple-600">{stats.bapCount}</span>
            </span>
          </div>
        </div>
        <div className={`size-3 rounded-full ${
          stats.total > 35 ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" : 
          stats.total > 30 ? "bg-amber-400" : "bg-emerald-400"
        }`} />
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto custom-scrollbar min-h-[100px]">
        <SortableContext items={alumnos.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {alumnos.map(a => (
            <AlumnoCard key={a.id} alumno={a} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

// --- Módulo Principal ---

export const MatriculaInteligente: React.FC = () => {
  const { 
    matricula, 
    fetchMatricula, 
    moveAlumno, 
    undoLastMove, 
    solicitarSugerenciasIA, 
    aprobarLote 
  } = useApp();

  const [activeAlumno, setActiveAlumno] = useState<AlumnoCiclo | null>(null);

  useEffect(() => {
    fetchMatricula();
  }, [fetchMatricula]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const studentsByGroup = useMemo(() => {
    const map: Record<string, AlumnoCiclo[]> = {
      "SIN_GRUPO": [],
    };
    
    matricula.grupos.forEach((g: any) => {
      map[g.nombre] = [];
    });

    matricula.alumnos.forEach((a: AlumnoCiclo) => {
      const g = a.grupo || "SIN_GRUPO";
      if (!map[g]) map[g] = [];
      map[g].push(a);
    });

    return map;
  }, [matricula.alumnos, matricula.grupos]);

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Alumno") {
      setActiveAlumno(event.active.data.current.alumno);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveAnAlumno = active.data.current?.type === "Alumno";
    const isOverAGrupo = over.data.current?.type === "Grupo";

    if (isActiveAnAlumno && isOverAGrupo) {
      const targetGrupo = over.data.current?.grupoId;
      moveAlumno(activeId, targetGrupo === "SIN_GRUPO" ? "" : targetGrupo);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveAlumno(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveAnAlumno = active.data.current?.type === "Alumno";
    const isOverAnAlumno = over.data.current?.type === "Alumno";

    if (isActiveAnAlumno && isOverAnAlumno) {
        const overAlumno = over.data.current?.alumno;
        moveAlumno(activeId, overAlumno.grupo);
    }
  };

  if (matricula.loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 bg-transparent relative">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter italic">
            Matrícula <span className="text-blue-600">Inteligente</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">
            Ciclo Activo: <span className="text-blue-600">{matricula.cicloActivo?.nombre || "Cargando..."}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={undoLastMove}
            disabled={matricula.lastActionStack.length === 0}
            className="btn-sase-secondary px-6 py-2.5 text-[10px] font-black disabled:opacity-30"
          >
            <span className="material-icons text-sm">undo</span>
            DESHACER
          </button>
          <button
            onClick={solicitarSugerenciasIA}
            disabled={matricula.sugerenciasLoading}
            className="btn-sase-secondary px-6 py-2.5 text-[10px] font-black bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            <span className="material-icons text-sm animate-pulse">psychology</span>
            {matricula.sugerenciasLoading ? "ANALIZANDO..." : "RECALCULAR IA"}
          </button>
          <button
            onClick={aprobarLote}
            disabled={matricula.cambiosPendientes.size === 0}
            className="btn-sase-primary px-8 py-2.5 text-[10px] font-black shadow-blue-200 disabled:opacity-30"
          >
            <span className="material-icons text-sm">verified</span>
            APROBAR CAMBIOS ({matricula.cambiosPendientes.size})
          </button>
        </div>
      </div>

      {/* Main DnD Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Panel Izquierdo: Alumnos Sin Asignar / Pool */}
          <div className="col-span-3 flex flex-col h-full bg-white/40 backdrop-blur-md rounded-3xl border border-slate-200/50 overflow-hidden shadow-xl shadow-slate-100/50">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Pool de Alumnos</h2>
               <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">
                 {studentsByGroup["SIN_GRUPO"]?.length || 0}
               </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              <GrupoContainer 
                id="SIN_GRUPO" 
                title="Sin Asignar" 
                alumnos={studentsByGroup["SIN_GRUPO"] || []} 
              />
            </div>
          </div>

          {/* Panel Derecho: Grupos */}
          <div className="col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
            {matricula.grupos.map((g: any) => (
              <GrupoContainer 
                key={g.id} 
                id={g.nombre} 
                title={g.nombre} 
                alumnos={studentsByGroup[g.nombre] || []} 
              />
            ))}
          </div>
        </div>

        <DragOverlay adjustScale={true}>
          {activeAlumno ? (
            <AlumnoCard alumno={activeAlumno} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
