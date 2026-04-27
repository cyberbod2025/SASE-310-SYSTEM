export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities_log: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          group_id: string | null
          id: string
          role: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          role?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          role?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      alumno_ciclo: {
        Row: {
          alumno_id: string
          ciclo_id: string
          created_at: string
          estatus: string
          fecha_asignacion: string
          grado: number
          grupo: string | null
          grupo_id: string | null
          grupo_sugerido: string | null
          id: string
          locked: boolean
        }
        Insert: {
          alumno_id: string
          ciclo_id: string
          created_at?: string
          estatus?: string
          fecha_asignacion?: string
          grado: number
          grupo?: string | null
          grupo_id?: string | null
          grupo_sugerido?: string | null
          id?: string
          locked?: boolean
        }
        Update: {
          alumno_id?: string
          ciclo_id?: string
          created_at?: string
          estatus?: string
          fecha_asignacion?: string
          grado?: number
          grupo?: string | null
          grupo_id?: string | null
          grupo_sugerido?: string | null
          id?: string
          locked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "alumno_ciclo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_ciclo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_ciclo_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "alumno_ciclo_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos_escolares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumno_ciclo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos: {
        Row: {
          created_at: string
          curp: string | null
          datos_bap: Json | null
          datos_tutor: Json | null
          estado_caso: Database["public"]["Enums"]["estado_caso_alumno"]
          estado_semaforo: string | null
          fecha_calculo_riesgo: string | null
          grado: number
          grupo: string
          id: string
          is_distancia: boolean | null
          matricula: string
          nombre_completo: string
          puntaje_riesgo: number | null
          riesgo_academico: number | null
          riesgo_asistencia: number | null
          riesgo_disciplina: number | null
          riesgo_socioemocional: number | null
        }
        Insert: {
          created_at?: string
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: Database["public"]["Enums"]["estado_caso_alumno"]
          estado_semaforo?: string | null
          fecha_calculo_riesgo?: string | null
          grado?: number
          grupo?: string
          id?: string
          is_distancia?: boolean | null
          matricula: string
          nombre_completo: string
          puntaje_riesgo?: number | null
          riesgo_academico?: number | null
          riesgo_asistencia?: number | null
          riesgo_disciplina?: number | null
          riesgo_socioemocional?: number | null
        }
        Update: {
          created_at?: string
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: Database["public"]["Enums"]["estado_caso_alumno"]
          estado_semaforo?: string | null
          fecha_calculo_riesgo?: string | null
          grado?: number
          grupo?: string
          id?: string
          is_distancia?: boolean | null
          matricula?: string
          nombre_completo?: string
          puntaje_riesgo?: number | null
          riesgo_academico?: number | null
          riesgo_asistencia?: number | null
          riesgo_disciplina?: number | null
          riesgo_socioemocional?: number | null
        }
        Relationships: []
      }
      asignacion_alumno_grupo: {
        Row: {
          alumno_ciclo_id: string
          asignado_por: string | null
          created_at: string
          grupo_anterior: string | null
          grupo_id: string
          grupo_nuevo: string
          id: string
          origen: string
        }
        Insert: {
          alumno_ciclo_id: string
          asignado_por?: string | null
          created_at?: string
          grupo_anterior?: string | null
          grupo_id: string
          grupo_nuevo: string
          id?: string
          origen?: string
        }
        Update: {
          alumno_ciclo_id?: string
          asignado_por?: string | null
          created_at?: string
          grupo_anterior?: string | null
          grupo_id?: string
          grupo_nuevo?: string
          id?: string
          origen?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignacion_alumno_grupo_alumno_ciclo_id_fkey"
            columns: ["alumno_ciclo_id"]
            isOneToOne: false
            referencedRelation: "alumno_ciclo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignacion_alumno_grupo_asignado_por_fkey"
            columns: ["asignado_por"]
            isOneToOne: false
            referencedRelation: "perfiles_usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignacion_alumno_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      asignaciones_profesor: {
        Row: {
          grupo_id: string
          id: string
          materia: string
          profesor_id: string
        }
        Insert: {
          grupo_id: string
          id?: string
          materia: string
          profesor_id: string
        }
        Update: {
          grupo_id?: string
          id?: string
          materia?: string
          profesor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_profesor_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      atenciones_medicas: {
        Row: {
          alumno_id: string
          atendido_por: string
          atencion_brindada: string | null
          diagnostico: string | null
          generado_por: string | null
          grupo: string | null
          hora: string
          id: string
          medicamento: string | null
          motivo: string | null
          nombre_alumno: string | null
          notificacion_padres: string | null
          acudieron_por_el: string | null
          condiciones_entrega: string | null
          observaciones: string | null
          signos_vitales: string | null
          sintomas: string
          tratamiento: string
        }
        Insert: {
          alumno_id: string
          atendido_por: string
          atencion_brindada?: string | null
          diagnostico?: string | null
          generado_por?: string | null
          grupo?: string | null
          hora?: string
          id?: string
          medicamento?: string | null
          motivo?: string | null
          nombre_alumno?: string | null
          notificacion_padres?: string | null
          acudieron_por_el?: string | null
          condiciones_entrega?: string | null
          observaciones?: string | null
          signos_vitales?: string | null
          sintomas: string
          tratamiento: string
        }
        Update: {
          alumno_id?: string
          atendido_por?: string
          atencion_brindada?: string | null
          diagnostico?: string | null
          generado_por?: string | null
          grupo?: string | null
          hora?: string
          id?: string
          medicamento?: string | null
          motivo?: string | null
          nombre_alumno?: string | null
          notificacion_padres?: string | null
          acudieron_por_el?: string | null
          condiciones_entrega?: string | null
          observaciones?: string | null
          signos_vitales?: string | null
          sintomas?: string
          tratamiento?: string
        }
        Relationships: [
          {
            foreignKeyName: "atenciones_medicas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atenciones_medicas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "atenciones_medicas_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "atenciones_medicas_atendido_por_fkey"
            columns: ["atendido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_logs: {
        Row: {
          alumno_id: string
          estado: string
          fecha: string
          hora_entrada: string | null
          id: string
          observaciones: string | null
          registrado_por: string | null
        }
        Insert: {
          alumno_id: string
          estado: string
          fecha?: string
          hora_entrada?: string | null
          id?: string
          observaciones?: string | null
          registrado_por?: string | null
        }
        Update: {
          alumno_id?: string
          estado?: string
          fecha?: string
          hora_entrada?: string | null
          id?: string
          observaciones?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "attendance_logs_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      auditoria: {
        Row: {
          descripcion_accion: string | null
          email_usuario: string | null
          fecha: string | null
          id: string
          id_registro_objetivo: string | null
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          rol_usuario: string | null
          tabla_objetivo: string | null
          tipo_accion: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          descripcion_accion?: string | null
          email_usuario?: string | null
          fecha?: string | null
          id?: string
          id_registro_objetivo?: string | null
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          rol_usuario?: string | null
          tabla_objetivo?: string | null
          tipo_accion: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          descripcion_accion?: string | null
          email_usuario?: string | null
          fecha?: string | null
          id?: string
          id_registro_objetivo?: string | null
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          rol_usuario?: string | null
          tabla_objetivo?: string | null
          tipo_accion?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      auditoria_accesos: {
        Row: {
          accion: string
          alumno_id: string
          created_at: string
          fecha: string
          hora: string
          id: string
          pantalla: string
          rol: string
          usuario: string | null
        }
        Insert: {
          accion: string
          alumno_id: string
          created_at?: string
          fecha?: string
          hora?: string
          id?: string
          pantalla?: string
          rol: string
          usuario?: string | null
        }
        Update: {
          accion?: string
          alumno_id?: string
          created_at?: string
          fecha?: string
          hora?: string
          id?: string
          pantalla?: string
          rol?: string
          usuario?: string | null
        }
        Relationships: []
      }
      behavior_metrics: {
        Row: {
          alumno_id: string
          calidad: number
          consistencia: number
          created_at: string
          deriva_score: number
          estado_datos: string
          fecha: string
          frecuencia: number
          id: string
          nivel_deriva: string
          tendencia: number
        }
        Insert: {
          alumno_id: string
          calidad?: number
          consistencia?: number
          created_at?: string
          deriva_score?: number
          estado_datos?: string
          fecha?: string
          frecuencia?: number
          id?: string
          nivel_deriva?: string
          tendencia?: number
        }
        Update: {
          alumno_id?: string
          calidad?: number
          consistencia?: number
          created_at?: string
          deriva_score?: number
          estado_datos?: string
          fecha?: string
          frecuencia?: number
          id?: string
          nivel_deriva?: string
          tendencia?: number
        }
        Relationships: [
          {
            foreignKeyName: "behavior_metrics_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_metrics_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "behavior_metrics_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      calificaciones: {
        Row: {
          alumno_id: string | null
          creado_en: string | null
          id: string
          materia: string
          trimestre1: number | null
          trimestre2: number | null
          trimestre3: number | null
        }
        Insert: {
          alumno_id?: string | null
          creado_en?: string | null
          id?: string
          materia: string
          trimestre1?: number | null
          trimestre2?: number | null
          trimestre3?: number | null
        }
        Update: {
          alumno_id?: string | null
          creado_en?: string | null
          id?: string
          materia?: string
          trimestre1?: number | null
          trimestre2?: number | null
          trimestre3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "calificaciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      ciclos_escolares: {
        Row: {
          activo: boolean
          created_at: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      citas_padres: {
        Row: {
          alumno_id: string
          creado_por: string | null
          created_at: string | null
          estado: string | null
          fecha_cita: string
          id: string
          motivo: string
          observaciones: string | null
        }
        Insert: {
          alumno_id: string
          creado_por?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_cita: string
          id?: string
          motivo: string
          observaciones?: string | null
        }
        Update: {
          alumno_id?: string
          creado_por?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_cita?: string
          id?: string
          motivo?: string
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_padres_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_padres_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "citas_padres_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      colectivo_alumnos: {
        Row: {
          alumno_id: string | null
          ciclo_escolar: string | null
          created_at: string | null
          evaluacion_general: string | null
          id: string
        }
        Insert: {
          alumno_id?: string | null
          ciclo_escolar?: string | null
          created_at?: string | null
          evaluacion_general?: string | null
          id?: string
        }
        Update: {
          alumno_id?: string | null
          ciclo_escolar?: string | null
          created_at?: string | null
          evaluacion_general?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colectivo_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colectivo_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "colectivo_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      colectivo_personal: {
        Row: {
          ciclo_escolar: string | null
          created_at: string | null
          datos: Json | null
          id: string
          personal_id: string | null
        }
        Insert: {
          ciclo_escolar?: string | null
          created_at?: string | null
          datos?: Json | null
          id?: string
          personal_id?: string | null
        }
        Update: {
          ciclo_escolar?: string | null
          created_at?: string | null
          datos?: Json | null
          id?: string
          personal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colectivo_personal_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
        ]
      }
      colectivo_respuestas_docentes: {
        Row: {
          created_at: string | null
          docente_id: string | null
          id: string
          respuestas: Json | null
        }
        Insert: {
          created_at?: string | null
          docente_id?: string | null
          id?: string
          respuestas?: Json | null
        }
        Update: {
          created_at?: string | null
          docente_id?: string | null
          id?: string
          respuestas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "colectivo_respuestas_docentes_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicados: {
        Row: {
          activo: boolean | null
          audiencia: string[]
          audiencia_especifica: string[] | null
          creado_por: string | null
          creado_por_nombre: string | null
          creado_por_rol: string | null
          created_at: string | null
          descripcion: string | null
          fecha_evento: string | null
          hora_evento: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          audiencia: string[]
          audiencia_especifica?: string[] | null
          creado_por?: string | null
          creado_por_nombre?: string | null
          creado_por_rol?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_evento?: string | null
          hora_evento?: string | null
          id?: string
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          audiencia?: string[]
          audiencia_especifica?: string[] | null
          creado_por?: string | null
          creado_por_nombre?: string | null
          creado_por_rol?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_evento?: string | null
          hora_evento?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts_log: {
        Row: {
          created_at: string | null
          id: string
          method: string | null
          notes: string | null
          outcome: string | null
          student_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          outcome?: string | null
          student_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          outcome?: string | null
          student_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "contacts_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      documentos_institucionales: {
        Row: {
          alumno_id: string | null
          contenido: string
          creado_en: string | null
          creado_por: string | null
          fecha: string | null
          firmas: string[] | null
          folio: string
          id: string
          narracion_ia: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          alumno_id?: string | null
          contenido: string
          creado_en?: string | null
          creado_por?: string | null
          fecha?: string | null
          firmas?: string[] | null
          folio: string
          id?: string
          narracion_ia?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          alumno_id?: string | null
          contenido?: string
          creado_en?: string | null
          creado_por?: string | null
          fecha?: string | null
          firmas?: string[] | null
          folio?: string
          id?: string
          narracion_ia?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_institucionales_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_institucionales_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "documentos_institucionales_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "documentos_institucionales_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_alumnos"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documentos_alumnos"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_documentos_alumnos"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      estudiantes: {
        Row: {
          alumno_id: string | null
          created_at: string | null
          escaneos_realizados: number | null
          grado: number | null
          id: string
          nickname: string | null
          total_puntos: number | null
        }
        Insert: {
          alumno_id?: string | null
          created_at?: string | null
          escaneos_realizados?: number | null
          grado?: number | null
          id?: string
          nickname?: string | null
          total_puntos?: number | null
        }
        Update: {
          alumno_id?: string | null
          created_at?: string | null
          escaneos_realizados?: number | null
          grado?: number | null
          id?: string
          nickname?: string | null
          total_puntos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estudiantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudiantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "estudiantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      eventos: {
        Row: {
          alumno_id: string | null
          creado_en: string | null
          creado_por: string | null
          descripcion: string | null
          fecha: string | null
          hora: string | null
          id: string
          para_todos_maestros: boolean | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          alumno_id?: string | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          fecha?: string | null
          hora?: string | null
          id?: string
          para_todos_maestros?: boolean | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          alumno_id?: string | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          fecha?: string | null
          hora?: string | null
          id?: string
          para_todos_maestros?: boolean | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "eventos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "eventos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_log: {
        Row: {
          created_at: string | null
          file_type: string | null
          id: string
          impacto_estimado: number | null
          link: string | null
          notes: string | null
          proyecto_nombre: string | null
          role: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          id?: string
          impacto_estimado?: number | null
          link?: string | null
          notes?: string | null
          proyecto_nombre?: string | null
          role?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          id?: string
          impacto_estimado?: number | null
          link?: string | null
          notes?: string | null
          proyecto_nombre?: string | null
          role?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      examenes_trimestre: {
        Row: {
          calificacion_final: number | null
          created_at: string | null
          feedback: string | null
          grado: number
          grupo: string
          id: string
          nombre_alumno: string
        }
        Insert: {
          calificacion_final?: number | null
          created_at?: string | null
          feedback?: string | null
          grado?: number
          grupo: string
          id?: string
          nombre_alumno: string
        }
        Update: {
          calificacion_final?: number | null
          created_at?: string | null
          feedback?: string | null
          grado?: number
          grupo?: string
          id?: string
          nombre_alumno?: string
        }
        Relationships: []
      }
      feria_pilotos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      grupos: {
        Row: {
          ciclo_escolar: string | null
          creado_en: string | null
          id: string
          nombre: string
          tutor_id: string | null
        }
        Insert: {
          ciclo_escolar?: string | null
          creado_en?: string | null
          id?: string
          nombre: string
          tutor_id?: string | null
        }
        Update: {
          ciclo_escolar?: string | null
          creado_en?: string | null
          id?: string
          nombre?: string
          tutor_id?: string | null
        }
        Relationships: []
      }
      incidencias: {
        Row: {
          alumno_id: string
          clasificacion: string | null
          creado_en: string | null
          created_at: string
          descripcion: string
          estado: string | null
          evidencia: string[] | null
          fecha: string | null
          gravedad: string | null
          grupo_id: string | null
          id: string
          nivel_gravedad: number
          notificado_whatsapp: boolean | null
          prefecto_asignado: string | null
          reporta: string | null
          reportado_por: string
          reportado_por_docente: string | null
          tipo: Database["public"]["Enums"]["tipo_incidencia"]
        }
        Insert: {
          alumno_id: string
          clasificacion?: string | null
          creado_en?: string | null
          created_at?: string
          descripcion: string
          estado?: string | null
          evidencia?: string[] | null
          fecha?: string | null
          gravedad?: string | null
          grupo_id?: string | null
          id?: string
          nivel_gravedad?: number
          notificado_whatsapp?: boolean | null
          prefecto_asignado?: string | null
          reporta?: string | null
          reportado_por: string
          reportado_por_docente?: string | null
          tipo: Database["public"]["Enums"]["tipo_incidencia"]
        }
        Update: {
          alumno_id?: string
          clasificacion?: string | null
          creado_en?: string | null
          created_at?: string
          descripcion?: string
          estado?: string | null
          evidencia?: string[] | null
          fecha?: string | null
          gravedad?: string | null
          grupo_id?: string | null
          id?: string
          nivel_gravedad?: number
          notificado_whatsapp?: boolean | null
          prefecto_asignado?: string | null
          reporta?: string | null
          reportado_por?: string
          reportado_por_docente?: string | null
          tipo?: Database["public"]["Enums"]["tipo_incidencia"]
        }
        Relationships: [
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "incidencias_reportado_por_fkey"
            columns: ["reportado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions_log: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          result: string | null
          student_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          result?: string | null
          student_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          result?: string | null
          student_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "interventions_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      justificantes: {
        Row: {
          alumno_id: string | null
          creado_en: string | null
          fecha: string | null
          id: string
          motivo: string | null
        }
        Insert: {
          alumno_id?: string | null
          creado_en?: string | null
          fecha?: string | null
          id?: string
          motivo?: string | null
        }
        Update: {
          alumno_id?: string | null
          creado_en?: string | null
          fecha?: string | null
          id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "justificantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "justificantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      modulos_ecosistema: {
        Row: {
          base_url: string
          created_at: string
          id: string
          is_active: boolean
          key: string
          name: string
        }
        Insert: {
          base_url: string
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
        }
        Update: {
          base_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
        }
        Relationships: []
      }
      modulos_ecosistema_roles: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          module_id: string
          role: string
          starts_at: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          module_id: string
          role: string
          starts_at?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
          role?: string
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modulos_ecosistema_roles_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modulos_ecosistema"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos_ecosistema_usuarios: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          module_id: string
          starts_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          module_id: string
          starts_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          module_id?: string
          starts_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modulos_ecosistema_usuarios_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modulos_ecosistema"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          creado_en: string | null
          id: string
          leida: boolean | null
          mensaje: string
          rol_destino: string
          tipo: string
          titulo: string
        }
        Insert: {
          creado_en?: string | null
          id?: string
          leida?: boolean | null
          mensaje: string
          rol_destino: string
          tipo: string
          titulo: string
        }
        Update: {
          creado_en?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string
          rol_destino?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      objetos_retenidos: {
        Row: {
          alumno_id: string | null
          autorizado_por: string | null
          categoria: string | null
          created_at: string | null
          entregado_a: string | null
          entregado_por: string | null
          estado: string | null
          evidencia_url: string | null
          fecha: string | null
          fecha_devolucion: string | null
          id: string
          incidencia_id: string | null
          lugar_retencion: string | null
          motivo: string
          objeto: string
          observaciones: string | null
          responsable_id: string | null
          responsable_nombre: string | null
          responsable_rol: string | null
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          autorizado_por?: string | null
          categoria?: string | null
          created_at?: string | null
          entregado_a?: string | null
          entregado_por?: string | null
          estado?: string | null
          evidencia_url?: string | null
          fecha?: string | null
          fecha_devolucion?: string | null
          id?: string
          incidencia_id?: string | null
          lugar_retencion?: string | null
          motivo: string
          objeto: string
          observaciones?: string | null
          responsable_id?: string | null
          responsable_nombre?: string | null
          responsable_rol?: string | null
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          autorizado_por?: string | null
          categoria?: string | null
          created_at?: string | null
          entregado_a?: string | null
          entregado_por?: string | null
          estado?: string | null
          evidencia_url?: string | null
          fecha?: string | null
          fecha_devolucion?: string | null
          id?: string
          incidencia_id?: string | null
          lugar_retencion?: string | null
          motivo?: string
          objeto?: string
          observaciones?: string | null
          responsable_id?: string | null
          responsable_nombre?: string | null
          responsable_rol?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objetos_retenidos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetos_retenidos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "objetos_retenidos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "objetos_retenidos_incidencia_id_fkey"
            columns: ["incidencia_id"]
            isOneToOne: false
            referencedRelation: "incidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetos_retenidos_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles_usuario: {
        Row: {
          alcances: Json | null
          created_at: string
          curp: string | null
          email: string | null
          es_tutor: boolean | null
          estado_cuenta: string | null
          estatus: string | null
          fecha_validacion: string | null
          grupo_tutor: string | null
          grupos: string[] | null
          id: string
          materias: string[] | null
          matricula_sase: string | null
          nombre_completo: string | null
          observaciones: string | null
          permisos: Json | null
          preferencias_dashboard: Json | null
          rol: string | null
          rol_solicitado: string | null
          role: string | null
          telefono: string | null
          turno: string | null
          updated_at: string | null
          validado_por: string | null
        }
        Insert: {
          alcances?: Json | null
          created_at?: string
          curp?: string | null
          email?: string | null
          es_tutor?: boolean | null
          estado_cuenta?: string | null
          estatus?: string | null
          fecha_validacion?: string | null
          grupo_tutor?: string | null
          grupos?: string[] | null
          id: string
          materias?: string[] | null
          matricula_sase?: string | null
          nombre_completo?: string | null
          observaciones?: string | null
          permisos?: Json | null
          preferencias_dashboard?: Json | null
          rol?: string | null
          rol_solicitado?: string | null
          role?: string | null
          telefono?: string | null
          turno?: string | null
          updated_at?: string | null
          validado_por?: string | null
        }
        Update: {
          alcances?: Json | null
          created_at?: string
          curp?: string | null
          email?: string | null
          es_tutor?: boolean | null
          estado_cuenta?: string | null
          estatus?: string | null
          fecha_validacion?: string | null
          grupo_tutor?: string | null
          grupos?: string[] | null
          id?: string
          materias?: string[] | null
          matricula_sase?: string | null
          nombre_completo?: string | null
          observaciones?: string | null
          permisos?: Json | null
          preferencias_dashboard?: Json | null
          rol?: string | null
          rol_solicitado?: string | null
          role?: string | null
          telefono?: string | null
          turno?: string | null
          updated_at?: string | null
          validado_por?: string | null
        }
        Relationships: []
      }
      personal: {
        Row: {
          created_at: string | null
          email: string | null
          estatus: string | null
          id: string
          nombre_completo: string
          rol: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          estatus?: string | null
          id?: string
          nombre_completo: string
          rol: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          email?: string | null
          estatus?: string | null
          id?: string
          nombre_completo?: string
          rol?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      personal_oficial: {
        Row: {
          created_at: string | null
          department: string
          full_name: string
          full_name_normalized: string
          id: string
          is_active: boolean | null
          role: string
          temporary_code: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          full_name: string
          full_name_normalized: string
          id?: string
          is_active?: boolean | null
          role: string
          temporary_code?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          full_name?: string
          full_name_normalized?: string
          id?: string
          is_active?: boolean | null
          role?: string
          temporary_code?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      protocolos: {
        Row: {
          activacion: string
          created_at: string
          fuente: string
          icono: string | null
          id: string
          objetivo: string
          roles_responsables: string[] | null
          tipo: string
          titulo: string
        }
        Insert: {
          activacion: string
          created_at?: string
          fuente: string
          icono?: string | null
          id?: string
          objetivo: string
          roles_responsables?: string[] | null
          tipo: string
          titulo: string
        }
        Update: {
          activacion?: string
          created_at?: string
          fuente?: string
          icono?: string | null
          id?: string
          objetivo?: string
          roles_responsables?: string[] | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      recordatorios: {
        Row: {
          completado: boolean | null
          creado_por: string | null
          creado_por_nombre: string | null
          created_at: string | null
          descripcion: string | null
          destinatario_id: string | null
          destinatario_rol: string | null
          fecha_recordatorio: string
          hora_recordatorio: string | null
          id: string
          titulo: string
          visto: boolean | null
        }
        Insert: {
          completado?: boolean | null
          creado_por?: string | null
          creado_por_nombre?: string | null
          created_at?: string | null
          descripcion?: string | null
          destinatario_id?: string | null
          destinatario_rol?: string | null
          fecha_recordatorio: string
          hora_recordatorio?: string | null
          id?: string
          titulo: string
          visto?: boolean | null
        }
        Update: {
          completado?: boolean | null
          creado_por?: string | null
          creado_por_nombre?: string | null
          created_at?: string | null
          descripcion?: string | null
          destinatario_id?: string | null
          destinatario_rol?: string | null
          fecha_recordatorio?: string
          hora_recordatorio?: string | null
          id?: string
          titulo?: string
          visto?: boolean | null
        }
        Relationships: []
      }
      registro_lectura: {
        Row: {
          alumno_id: string
          creado_por: string | null
          fecha: string | null
          id: string
          logro_alcanzado: string | null
          observaciones: string | null
          proyecto_nombre: string | null
        }
        Insert: {
          alumno_id: string
          creado_por?: string | null
          fecha?: string | null
          id?: string
          logro_alcanzado?: string | null
          observaciones?: string | null
          proyecto_nombre?: string | null
        }
        Update: {
          alumno_id?: string
          creado_por?: string | null
          fecha?: string | null
          id?: string
          logro_alcanzado?: string | null
          observaciones?: string | null
          proyecto_nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_lectura_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_lectura_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "registro_lectura_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "registro_lectura_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      respuestas_docentes: {
        Row: {
          creado_por: string | null
          created_at: string | null
          id: string
          pregunta_id: string | null
          respuesta: string | null
        }
        Insert: {
          creado_por?: string | null
          created_at?: string | null
          id?: string
          pregunta_id?: string | null
          respuesta?: string | null
        }
        Update: {
          creado_por?: string | null
          created_at?: string | null
          id?: string
          pregunta_id?: string | null
          respuesta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respuestas_docentes_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles_permisos: {
        Row: {
          actualizado_en: string | null
          permisos: Json | null
          rol: string
        }
        Insert: {
          actualizado_en?: string | null
          permisos?: Json | null
          rol: string
        }
        Update: {
          actualizado_en?: string | null
          permisos?: Json | null
          rol?: string
        }
        Relationships: []
      }
      salud: {
        Row: {
          alergias: string | null
          alumno_id: string
          id: string
          medicamentos: string | null
          padecimiento: string | null
          ultima_actualizacion: string
        }
        Insert: {
          alergias?: string | null
          alumno_id: string
          id?: string
          medicamentos?: string | null
          padecimiento?: string | null
          ultima_actualizacion?: string
        }
        Update: {
          alergias?: string | null
          alumno_id?: string
          id?: string
          medicamentos?: string | null
          padecimiento?: string | null
          ultima_actualizacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "salud_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salud_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "salud_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      sandbox_alertas: {
        Row: {
          created_at: string | null
          estado: string | null
          id: string
          persona_id: string | null
          tipo_patron: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          id?: string
          persona_id?: string | null
          tipo_patron?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          id?: string
          persona_id?: string | null
          tipo_patron?: string | null
        }
        Relationships: []
      }
      seguimiento_bap: {
        Row: {
          ajuste_razonable: string | null
          alumno_id: string
          creado_en: string | null
          creado_por: string | null
          estatus: string | null
          id: string
          tipo_bap: string | null
        }
        Insert: {
          ajuste_razonable?: string | null
          alumno_id: string
          creado_en?: string | null
          creado_por?: string | null
          estatus?: string | null
          id?: string
          tipo_bap?: string | null
        }
        Update: {
          ajuste_razonable?: string | null
          alumno_id?: string
          creado_en?: string | null
          creado_por?: string | null
          estatus?: string | null
          id?: string
          tipo_bap?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_bap_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_bap_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_bap_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_bap_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seguimiento_social: {
        Row: {
          acuerdos: string | null
          alumno_id: string
          creado_por: string | null
          es_sensible: boolean | null
          estatus: string | null
          fecha: string | null
          id: string
          motivo: string | null
          seguimiento: string | null
        }
        Insert: {
          acuerdos?: string | null
          alumno_id: string
          creado_por?: string | null
          es_sensible?: boolean | null
          estatus?: string | null
          fecha?: string | null
          id?: string
          motivo?: string | null
          seguimiento?: string | null
        }
        Update: {
          acuerdos?: string | null
          alumno_id?: string
          creado_por?: string | null
          es_sensible?: boolean | null
          estatus?: string | null
          fecha?: string | null
          id?: string
          motivo?: string | null
          seguimiento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_social_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_social_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_social_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "seguimiento_social_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      socioeconomico_general: {
        Row: {
          alumno_id: string
          nivel_ingresos: string | null
          observaciones_generales: string | null
          situacion_familiar: string | null
          updated_at: string
        }
        Insert: {
          alumno_id: string
          nivel_ingresos?: string | null
          observaciones_generales?: string | null
          situacion_familiar?: string | null
          updated_at?: string
        }
        Update: {
          alumno_id?: string
          nivel_ingresos?: string | null
          observaciones_generales?: string | null
          situacion_familiar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "socioeconomico_general_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socioeconomico_general_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "socioeconomico_general_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      socioeconomico_privado: {
        Row: {
          alumno_id: string
          observaciones_restringidas: string | null
          updated_at: string
        }
        Insert: {
          alumno_id: string
          observaciones_restringidas?: string | null
          updated_at?: string
        }
        Update: {
          alumno_id?: string
          observaciones_restringidas?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "socioeconomico_privado_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socioeconomico_privado_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "socioeconomico_privado_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: true
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      solicitudes: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          asignado_a: string | null
          asignado_nombre: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          estado: string | null
          fecha_limite: string | null
          id: string
          prioridad: string | null
          tipo: string
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          asignado_a?: string | null
          asignado_nombre?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          prioridad?: string | null
          tipo: string
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          asignado_a?: string | null
          asignado_nombre?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          prioridad?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "solicitudes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      solicitudes_alta_personal: {
        Row: {
          acepta_auditoria: boolean
          acepta_etica: boolean
          acepta_privacidad: boolean
          apellido_materno: string
          apellido_paterno: string
          aprobado_en: string | null
          aprobado_por: string | null
          area_cobertura: string | null
          correo_institucional: string
          created_at: string
          curp: string
          es_tutor: boolean
          estado: string
          grupo_tutor: string | null
          grupos: string[] | null
          id: string
          materias: string[] | null
          matricula_sase: string | null
          metadata: Json
          nombres: string
          observaciones: string | null
          observaciones_validacion: string | null
          rol_solicitado: string[]
          telefono: string | null
          turno: string
        }
        Insert: {
          acepta_auditoria?: boolean
          acepta_etica?: boolean
          acepta_privacidad?: boolean
          apellido_materno: string
          apellido_paterno: string
          aprobado_en?: string | null
          aprobado_por?: string | null
          area_cobertura?: string | null
          correo_institucional: string
          created_at?: string
          curp: string
          es_tutor?: boolean
          estado?: string
          grupo_tutor?: string | null
          grupos?: string[] | null
          id?: string
          materias?: string[] | null
          matricula_sase?: string | null
          metadata?: Json
          nombres: string
          observaciones?: string | null
          observaciones_validacion?: string | null
          rol_solicitado: string[]
          telefono?: string | null
          turno: string
        }
        Update: {
          acepta_auditoria?: boolean
          acepta_etica?: boolean
          acepta_privacidad?: boolean
          apellido_materno?: string
          apellido_paterno?: string
          aprobado_en?: string | null
          aprobado_por?: string | null
          area_cobertura?: string | null
          correo_institucional?: string
          created_at?: string
          curp?: string
          es_tutor?: boolean
          estado?: string
          grupo_tutor?: string | null
          grupos?: string[] | null
          id?: string
          materias?: string[] | null
          matricula_sase?: string | null
          metadata?: Json
          nombres?: string
          observaciones?: string | null
          observaciones_validacion?: string | null
          rol_solicitado?: string[]
          telefono?: string | null
          turno?: string
        }
        Relationships: []
      }
      solicitudes_documentos: {
        Row: {
          alumno_id: string | null
          alumno_nombre: string | null
          asignado_a: string | null
          asignado_nombre: string | null
          completado_at: string | null
          created_at: string | null
          descripcion: string | null
          documento_url: string | null
          estado: string | null
          fecha_limite: string | null
          id: string
          notas_seguimiento: string | null
          prioridad: string | null
          solicitante_id: string | null
          solicitante_nombre: string | null
          tipo_documento: string
          updated_at: string | null
        }
        Insert: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          asignado_a?: string | null
          asignado_nombre?: string | null
          completado_at?: string | null
          created_at?: string | null
          descripcion?: string | null
          documento_url?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          notas_seguimiento?: string | null
          prioridad?: string | null
          solicitante_id?: string | null
          solicitante_nombre?: string | null
          tipo_documento: string
          updated_at?: string | null
        }
        Update: {
          alumno_id?: string | null
          alumno_nombre?: string | null
          asignado_a?: string | null
          asignado_nombre?: string | null
          completado_at?: string | null
          created_at?: string | null
          descripcion?: string | null
          documento_url?: string | null
          estado?: string | null
          fecha_limite?: string | null
          id?: string
          notas_seguimiento?: string | null
          prioridad?: string | null
          solicitante_id?: string | null
          solicitante_nombre?: string | null
          tipo_documento?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_documentos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_documentos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "solicitudes_documentos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      suministros: {
        Row: {
          actualizado_por: string | null
          cantidad: number
          cantidad_maxima: number
          categoria: string | null
          id: string
          nombre: string
          ultima_actualizacion: string | null
          unidad: string | null
        }
        Insert: {
          actualizado_por?: string | null
          cantidad?: number
          cantidad_maxima?: number
          categoria?: string | null
          id?: string
          nombre: string
          ultima_actualizacion?: string | null
          unidad?: string | null
        }
        Update: {
          actualizado_por?: string | null
          cantidad?: number
          cantidad_maxima?: number
          categoria?: string | null
          id?: string
          nombre?: string
          ultima_actualizacion?: string | null
          unidad?: string | null
        }
        Relationships: []
      }
      system_feedback: {
        Row: {
          comment: string
          created_at: string
          email: string | null
          id: number
          resolved: boolean | null
          type: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          email?: string | null
          id?: number
          resolved?: boolean | null
          type?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          email?: string | null
          id?: number
          resolved?: boolean | null
          type?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      alumnos_en_riesgo: {
        Row: {
          alumno_id: string | null
          grupo: string | null
          nivel_alerta: string | null
          nombre: string | null
          total_bap: number | null
          total_calificaciones: number | null
          total_incidencias: number | null
          total_social: number | null
        }
        Relationships: []
      }
      expediente_integral_alumno: {
        Row: {
          alumno_id: string | null
          escaneos_gamificacion: number | null
          estado_caso: Database["public"]["Enums"]["estado_caso_alumno"] | null
          grado: number | null
          grupo: string | null
          nickname_gamificacion: string | null
          nombre: string | null
          puntos_gamificacion: number | null
          tiene_ficha_social: boolean | null
          total_atenciones_medicas: number | null
          total_bap: number | null
          total_calificaciones: number | null
          total_incidencias: number | null
          total_justificantes: number | null
          total_lectura: number | null
          total_social: number | null
        }
        Relationships: []
      }
      v_data_engine: {
        Row: {
          alumno_id: string | null
          dimension: string | null
          fecha: string | null
          gravedad: string | null
          puntaje_base: number | null
          tipo_evento: Database["public"]["Enums"]["tipo_incidencia"] | null
        }
        Insert: {
          alumno_id?: string | null
          dimension?: never
          fecha?: never
          gravedad?: string | null
          puntaje_base?: never
          tipo_evento?: Database["public"]["Enums"]["tipo_incidencia"] | null
        }
        Update: {
          alumno_id?: string | null
          dimension?: never
          fecha?: never
          gravedad?: string | null
          puntaje_base?: never
          tipo_evento?: Database["public"]["Enums"]["tipo_incidencia"] | null
        }
        Relationships: [
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      v_perfiles_activos: {
        Row: {
          id: string | null
          nombre_completo: string | null
          rol: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_deriva: { Args: { alumno: string }; Returns: undefined }
      calculate_student_risk: {
        Args: { p_student_id: string }
        Returns: undefined
      }
      ejecutar_promocion: {
        Args: { p_ciclo_actual: string; p_ciclo_nuevo: string }
        Returns: Json
      }
      generar_matricula_sase: { Args: never; Returns: string }
      get_modulos_ecosistema_visibles: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          key: string
          name: string
        }[]
      }
      get_my_normalized_email: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_my_role_text: { Args: never; Returns: string }
      log_audit: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_new_values?: Json
          p_old_values?: Json
          p_target_record_id: string
          p_target_student_name?: string
          p_target_table: string
        }
        Returns: string
      }
      registrar_auditoria_sase: {
        Args: {
          p_descripcion: string
          p_email: string
          p_id_registro?: string
          p_rol: string
          p_tabla?: string
          p_tipo_accion: string
          p_usuario_id: string
        }
        Returns: string
      }
      registrar_behavior_metric: {
        Args: { p_alumno_id: string }
        Returns: undefined
      }
      simular_promocion: {
        Args: { p_ciclo_id: string }
        Returns: {
          alumno_id: string
          bap: boolean
          decision_sugerida: string
          faltas: number
          faltas_consecutivas: number
          grado: number
          grupo: string
          incidencias: number
          nombre: string
          promedio: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "directivo"
        | "docente"
        | "docente_tutor"
        | "prefectura"
        | "orientacion"
        | "trabajo_social"
        | "enfermeria"
        | "secretaria"
        | "medico_escolar"
        | "udeii"
        | "promotora_lectura"
        | "subdireccion"
        | "admin"
        | "system_admin"
      estado_caso_alumno:
        | "normal"
        | "observado"
        | "intervencion"
        | "seguimiento"
      tipo_incidencia:
        | "retardo"
        | "conducta"
        | "uniforme"
        | "otro"
        | "asistencia"
        | "academica"
        | "socioemocional"
        | "salud"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "directivo",
        "docente",
        "docente_tutor",
        "prefectura",
        "orientacion",
        "trabajo_social",
        "enfermeria",
        "secretaria",
        "medico_escolar",
        "udeii",
        "promotora_lectura",
        "subdireccion",
        "admin",
        "system_admin",
      ],
      estado_caso_alumno: [
        "normal",
        "observado",
        "intervencion",
        "seguimiento",
      ],
      tipo_incidencia: [
        "retardo",
        "conducta",
        "uniforme",
        "otro",
        "asistencia",
        "academica",
        "socioemocional",
        "salud",
      ],
    },
  },
} as const

