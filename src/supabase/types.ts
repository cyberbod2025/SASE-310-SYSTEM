export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activaciones_protocolo: {
        Row: {
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          incidencia_id: string | null
          notas: string | null
          protocolo_id: string
          usuario_id: string | null
        }
        Insert: {
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          incidencia_id?: string | null
          notas?: string | null
          protocolo_id: string
          usuario_id?: string | null
        }
        Update: {
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          incidencia_id?: string | null
          notas?: string | null
          protocolo_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activaciones_protocolo_incidencia_id_fkey"
            columns: ["incidencia_id"]
            isOneToOne: false
            referencedRelation: "incidencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activaciones_protocolo_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
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
      alertas_patron: {
        Row: {
          alumno_id: string | null
          asignado_a_rol: string | null
          created_at: string | null
          estado: string | null
          id: string
          tipo_patron: string | null
        }
        Insert: {
          alumno_id?: string | null
          asignado_a_rol?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          tipo_patron?: string | null
        }
        Update: {
          alumno_id?: string | null
          asignado_a_rol?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          tipo_patron?: string | null
        }
        Relationships: []
      }
      alumnos: {
        Row: {
          avatar_url: string | null
          creado_en: string | null
          curp: string | null
          datos_bap: Json | null
          datos_tutor: Json | null
          estado_caso: string | null
          estado_semaforo: string | null
          fecha_calculo_riesgo: string | null
          fecha_nacimiento: string | null
          genero: string | null
          grado: string | null
          grupo: string | null
          id: string
          matricula: string | null
          modificado_en: string | null
          modificado_por: string | null
          nombre_completo: string | null
          promedio_anterior: number | null
          puntaje_riesgo: number | null
          riesgo_academico: number | null
          riesgo_asistencia: number | null
          riesgo_disciplina: number | null
          riesgo_socioemocional: number | null
          tutor_escolar_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          creado_en?: string | null
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: string | null
          estado_semaforo?: string | null
          fecha_calculo_riesgo?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          grado?: string | null
          grupo?: string | null
          id?: string
          matricula?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre_completo?: string | null
          promedio_anterior?: number | null
          puntaje_riesgo?: number | null
          riesgo_academico?: number | null
          riesgo_asistencia?: number | null
          riesgo_disciplina?: number | null
          riesgo_socioemocional?: number | null
          tutor_escolar_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          creado_en?: string | null
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: string | null
          estado_semaforo?: string | null
          fecha_calculo_riesgo?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          grado?: string | null
          grupo?: string | null
          id?: string
          matricula?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre_completo?: string | null
          promedio_anterior?: number | null
          puntaje_riesgo?: number | null
          riesgo_academico?: number | null
          riesgo_asistencia?: number | null
          riesgo_disciplina?: number | null
          riesgo_socioemocional?: number | null
          tutor_escolar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_tutor_escolar_id_fkey"
            columns: ["tutor_escolar_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          alumno_id: string | null
          atendido_por: string
          created_at: string | null
          id: string
          motivo: string | null
          se_fue_a_casa: boolean | null
          sintomas: string
          tratamiento: string | null
        }
        Insert: {
          alumno_id?: string | null
          atendido_por: string
          created_at?: string | null
          id?: string
          motivo?: string | null
          se_fue_a_casa?: boolean | null
          sintomas: string
          tratamiento?: string | null
        }
        Update: {
          alumno_id?: string | null
          atendido_por?: string
          created_at?: string | null
          id?: string
          motivo?: string | null
          se_fue_a_casa?: boolean | null
          sintomas?: string
          tratamiento?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
          creado_en: string | null
          descripcion_accion: string | null
          email_usuario: string | null
          fecha: string | null
          id: string
          id_registro_objetivo: string | null
          ip_address: string | null
          new_values: Json | null
          nombre_alumno_objetivo: string | null
          nuevos_valores: Json | null
          old_values: Json | null
          rol_usuario: string | null
          tabla_objetivo: string | null
          tipo_accion: string
          user_agent: string | null
          usuario_id: string | null
          valores_anteriores: Json | null
        }
        Insert: {
          creado_en?: string | null
          descripcion_accion?: string | null
          email_usuario?: string | null
          fecha?: string | null
          id?: string
          id_registro_objetivo?: string | null
          ip_address?: string | null
          new_values?: Json | null
          nombre_alumno_objetivo?: string | null
          nuevos_valores?: Json | null
          old_values?: Json | null
          rol_usuario?: string | null
          tabla_objetivo?: string | null
          tipo_accion: string
          user_agent?: string | null
          usuario_id?: string | null
          valores_anteriores?: Json | null
        }
        Update: {
          creado_en?: string | null
          descripcion_accion?: string | null
          email_usuario?: string | null
          fecha?: string | null
          id?: string
          id_registro_objetivo?: string | null
          ip_address?: string | null
          new_values?: Json | null
          nombre_alumno_objetivo?: string | null
          nuevos_valores?: Json | null
          old_values?: Json | null
          rol_usuario?: string | null
          tabla_objetivo?: string | null
          tipo_accion?: string
          user_agent?: string | null
          usuario_id?: string | null
          valores_anteriores?: Json | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
          actualizado_en: string | null
          actualizado_por: string | null
          alumno_id: string
          ciclo_escolar: string | null
          creado_en: string | null
          id: string
          materia: string
          promedio_final: number | null
          trimestre1: number | null
          trimestre2: number | null
          trimestre3: number | null
        }
        Insert: {
          actualizado_en?: string | null
          actualizado_por?: string | null
          alumno_id: string
          ciclo_escolar?: string | null
          creado_en?: string | null
          id?: string
          materia: string
          promedio_final?: number | null
          trimestre1?: number | null
          trimestre2?: number | null
          trimestre3?: number | null
        }
        Update: {
          actualizado_en?: string | null
          actualizado_por?: string | null
          alumno_id?: string
          ciclo_escolar?: string | null
          creado_en?: string | null
          id?: string
          materia?: string
          promedio_final?: number | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
        Relationships: []
      }
      colectivo_alumnos: {
        Row: {
          avatar_url: string | null
          creado_en: string | null
          curp: string | null
          datos_bap: Json | null
          datos_tutor: Json | null
          estado_caso: string | null
          estado_semaforo: string | null
          fecha_calculo_riesgo: string | null
          fecha_nacimiento: string | null
          genero: string | null
          grado: string | null
          grupo: string | null
          id: string
          matricula: string | null
          modificado_en: string | null
          modificado_por: string | null
          nombre_completo: string | null
          promedio_anterior: number | null
          puntaje_riesgo: number | null
          riesgo_academico: number | null
          riesgo_asistencia: number | null
          riesgo_disciplina: number | null
          riesgo_socioemocional: number | null
          tutor_escolar_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          creado_en?: string | null
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: string | null
          estado_semaforo?: string | null
          fecha_calculo_riesgo?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          grado?: string | null
          grupo?: string | null
          id: string
          matricula?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre_completo?: string | null
          promedio_anterior?: number | null
          puntaje_riesgo?: number | null
          riesgo_academico?: number | null
          riesgo_asistencia?: number | null
          riesgo_disciplina?: number | null
          riesgo_socioemocional?: number | null
          tutor_escolar_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          creado_en?: string | null
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: string | null
          estado_semaforo?: string | null
          fecha_calculo_riesgo?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          grado?: string | null
          grupo?: string | null
          id?: string
          matricula?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre_completo?: string | null
          promedio_anterior?: number | null
          puntaje_riesgo?: number | null
          riesgo_academico?: number | null
          riesgo_asistencia?: number | null
          riesgo_disciplina?: number | null
          riesgo_socioemocional?: number | null
          tutor_escolar_id?: string | null
        }
        Relationships: []
      }
      colectivo_personal: {
        Row: {
          acceso_pin: string | null
          created_at: string | null
          departamento: string | null
          id: string
          nombre: string | null
          pin_entregado: boolean | null
          rol: string | null
        }
        Insert: {
          acceso_pin?: string | null
          created_at?: string | null
          departamento?: string | null
          id: string
          nombre?: string | null
          pin_entregado?: boolean | null
          rol?: string | null
        }
        Update: {
          acceso_pin?: string | null
          created_at?: string | null
          departamento?: string | null
          id?: string
          nombre?: string | null
          pin_entregado?: boolean | null
          rol?: string | null
        }
        Relationships: []
      }
      colectivo_respuestas_docentes: {
        Row: {
          agresiones: number | null
          alumnos_reportados: Json | null
          ambiente: Json | null
          asignatura: string | null
          campo_formativo: string | null
          comentarios: string | null
          conductas_grupales: string[] | null
          dispositivos: number | null
          docente: string | null
          estrategias: string[] | null
          factores_externos: Json | null
          fecha: string | null
          grupo: string | null
          id: string
          impacto: string | null
          instrucciones: number | null
          interrupciones: number | null
          intervenciones: Json | null
          movimiento: number | null
          nivel_grupo: string | null
          periodo: string | null
          tiempo_conducta: string | null
        }
        Insert: {
          agresiones?: number | null
          alumnos_reportados?: Json | null
          ambiente?: Json | null
          asignatura?: string | null
          campo_formativo?: string | null
          comentarios?: string | null
          conductas_grupales?: string[] | null
          dispositivos?: number | null
          docente?: string | null
          estrategias?: string[] | null
          factores_externos?: Json | null
          fecha?: string | null
          grupo?: string | null
          id: string
          impacto?: string | null
          instrucciones?: number | null
          interrupciones?: number | null
          intervenciones?: Json | null
          movimiento?: number | null
          nivel_grupo?: string | null
          periodo?: string | null
          tiempo_conducta?: string | null
        }
        Update: {
          agresiones?: number | null
          alumnos_reportados?: Json | null
          ambiente?: Json | null
          asignatura?: string | null
          campo_formativo?: string | null
          comentarios?: string | null
          conductas_grupales?: string[] | null
          dispositivos?: number | null
          docente?: string | null
          estrategias?: string[] | null
          factores_externos?: Json | null
          fecha?: string | null
          grupo?: string | null
          id?: string
          impacto?: string | null
          instrucciones?: number | null
          interrupciones?: number | null
          intervenciones?: Json | null
          movimiento?: number | null
          nivel_grupo?: string | null
          periodo?: string | null
          tiempo_conducta?: string | null
        }
        Relationships: []
      }
      comunicados: {
        Row: {
          audiencia: string[] | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          fecha_evento: string | null
          hora_evento: string | null
          id: string
          tipo: string
          titulo: string
        }
        Insert: {
          audiencia?: string[] | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          fecha_evento?: string | null
          hora_evento?: string | null
          id?: string
          tipo: string
          titulo: string
        }
        Update: {
          audiencia?: string[] | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          fecha_evento?: string | null
          hora_evento?: string | null
          id?: string
          tipo?: string
          titulo?: string
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
        Relationships: []
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
        ]
      }
      estudiantes: {
        Row: {
          alumno_id: string | null
          escaneos_realizados: number | null
          grado: number | null
          id: string
          nickname: string | null
          total_puntos: number | null
        }
        Insert: {
          alumno_id?: string | null
          escaneos_realizados?: number | null
          grado?: number | null
          id?: string
          nickname?: string | null
          total_puntos?: number | null
        }
        Update: {
          alumno_id?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
          titulo: string | null
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
          titulo?: string | null
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
          titulo?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
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
          calificacion_ajustada: number | null
          calificacion_final: number | null
          conducta: number | null
          created_at: string | null
          feedback: string | null
          grado: number | null
          grupo: string
          id: string
          nombre_alumno: string
          participacion: number | null
          responsabilidad: number | null
          respuestas: Json | null
        }
        Insert: {
          calificacion_ajustada?: number | null
          calificacion_final?: number | null
          conducta?: number | null
          created_at?: string | null
          feedback?: string | null
          grado?: number | null
          grupo: string
          id?: string
          nombre_alumno: string
          participacion?: number | null
          responsabilidad?: number | null
          respuestas?: Json | null
        }
        Update: {
          calificacion_ajustada?: number | null
          calificacion_final?: number | null
          conducta?: number | null
          created_at?: string | null
          feedback?: string | null
          grado?: number | null
          grupo?: string
          id?: string
          nombre_alumno?: string
          participacion?: number | null
          responsabilidad?: number | null
          respuestas?: Json | null
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
          alumno_id: string | null
          clasificacion: string | null
          creado_en: string | null
          creado_por: string | null
          descripcion: string | null
          estado: string | null
          evidencia: string[] | null
          fecha: string | null
          gravedad: string | null
          id: string
          nivel_gravedad: number
          notificado_whatsapp: boolean | null
          reporta: string | null
          reportado_por: string
          reportado_por_docente: string | null
          tipo: string | null
        }
        Insert: {
          alumno_id?: string | null
          clasificacion?: string | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          estado?: string | null
          evidencia?: string[] | null
          fecha?: string | null
          gravedad?: string | null
          id?: string
          nivel_gravedad?: number
          notificado_whatsapp?: boolean | null
          reporta?: string | null
          reportado_por: string
          reportado_por_docente?: string | null
          tipo?: string | null
        }
        Update: {
          alumno_id?: string | null
          clasificacion?: string | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          estado?: string | null
          evidencia?: string[] | null
          fecha?: string | null
          gravedad?: string | null
          id?: string
          nivel_gravedad?: number
          notificado_whatsapp?: boolean | null
          reporta?: string | null
          reportado_por?: string
          reportado_por_docente?: string | null
          tipo?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "incidencias_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
        Relationships: []
      }
      justificantes: {
        Row: {
          alumno_id: string | null
          creado_en: string | null
          descripcion: string | null
          emitido_por: string
          fecha_fin: string | null
          fecha_inicio: string | null
          folio: string | null
          id: string
          motivo: string | null
          tipo: string | null
          trabajo_distancia: boolean | null
          valido_por: string | null
        }
        Insert: {
          alumno_id?: string | null
          creado_en?: string | null
          descripcion?: string | null
          emitido_por: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          folio?: string | null
          id?: string
          motivo?: string | null
          tipo?: string | null
          trabajo_distancia?: boolean | null
          valido_por?: string | null
        }
        Update: {
          alumno_id?: string | null
          creado_en?: string | null
          descripcion?: string | null
          emitido_por?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          folio?: string | null
          id?: string
          motivo?: string | null
          tipo?: string | null
          trabajo_distancia?: boolean | null
          valido_por?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificantes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "justificantes_issued_by_fkey"
            columns: ["emitido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificantes_valido_por_fkey"
            columns: ["valido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
        ]
      }
      pasos_protocolo: {
        Row: {
          accion: string
          creado_en: string | null
          descripcion_detalle: string | null
          es_advertencia: boolean | null
          id: string
          orden: number
          protocolo_id: string
          rol_responsable: string | null
        }
        Insert: {
          accion: string
          creado_en?: string | null
          descripcion_detalle?: string | null
          es_advertencia?: boolean | null
          id?: string
          orden: number
          protocolo_id: string
          rol_responsable?: string | null
        }
        Update: {
          accion?: string
          creado_en?: string | null
          descripcion_detalle?: string | null
          es_advertencia?: boolean | null
          id?: string
          orden?: number
          protocolo_id?: string
          rol_responsable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pasos_protocolo_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles_usuario: {
        Row: {
          alcances: Json | null
          curp: string | null
          email: string | null
          es_tutor: boolean | null
          estado_cuenta: string | null
          estatus: string | null
          fecha_validacion: string | null
          grupo_tutor: string | null
          grupos: string[] | null
          id: string
          materias: string | null
          matricula_sase: string | null
          nombre_completo: string | null
          observaciones: string | null
          permisos: Json | null
          preferencias_dashboard: Json | null
          rol: string | null
          rol_solicitado: string | null
          telefono: string | null
          turno: string | null
          updated_at: string | null
          validado_por: string | null
        }
        Insert: {
          alcances?: Json | null
          curp?: string | null
          email?: string | null
          es_tutor?: boolean | null
          estado_cuenta?: string | null
          estatus?: string | null
          fecha_validacion?: string | null
          grupo_tutor?: string | null
          grupos?: string[] | null
          id: string
          materias?: string | null
          matricula_sase?: string | null
          nombre_completo?: string | null
          observaciones?: string | null
          permisos?: Json | null
          preferencias_dashboard?: Json | null
          rol?: string | null
          rol_solicitado?: string | null
          telefono?: string | null
          turno?: string | null
          updated_at?: string | null
          validado_por?: string | null
        }
        Update: {
          alcances?: Json | null
          curp?: string | null
          email?: string | null
          es_tutor?: boolean | null
          estado_cuenta?: string | null
          estatus?: string | null
          fecha_validacion?: string | null
          grupo_tutor?: string | null
          grupos?: string[] | null
          id?: string
          materias?: string | null
          matricula_sase?: string | null
          nombre_completo?: string | null
          observaciones?: string | null
          permisos?: Json | null
          preferencias_dashboard?: Json | null
          rol?: string | null
          rol_solicitado?: string | null
          telefono?: string | null
          turno?: string | null
          updated_at?: string | null
          validado_por?: string | null
        }
        Relationships: []
      }
      personal: {
        Row: {
          acceso_pin: string | null
          created_at: string | null
          departamento: string | null
          id: string
          nombre: string
          rol: string | null
        }
        Insert: {
          acceso_pin?: string | null
          created_at?: string | null
          departamento?: string | null
          id?: string
          nombre: string
          rol?: string | null
        }
        Update: {
          acceso_pin?: string | null
          created_at?: string | null
          departamento?: string | null
          id?: string
          nombre?: string
          rol?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activo: boolean | null
          full_name: string | null
          id: string
          nombre: string | null
          rol: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          activo?: boolean | null
          full_name?: string | null
          id: string
          nombre?: string | null
          rol?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          activo?: boolean | null
          full_name?: string | null
          id?: string
          nombre?: string | null
          rol?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      protocolos: {
        Row: {
          activacion: string | null
          creado_en: string | null
          fuente: string | null
          icono: string | null
          id: string
          objetivo: string | null
          palabras_clave: string[] | null
          roles_responsables: string[] | null
          tipo: string
          titulo: string
        }
        Insert: {
          activacion?: string | null
          creado_en?: string | null
          fuente?: string | null
          icono?: string | null
          id?: string
          objetivo?: string | null
          palabras_clave?: string[] | null
          roles_responsables?: string[] | null
          tipo: string
          titulo: string
        }
        Update: {
          activacion?: string | null
          creado_en?: string | null
          fuente?: string | null
          icono?: string | null
          id?: string
          objetivo?: string | null
          palabras_clave?: string[] | null
          roles_responsables?: string[] | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      registro_lectura: {
        Row: {
          alumno_id: string | null
          creado_por: string | null
          fecha: string | null
          id: string
          logro_alcanzado: string | null
          observaciones: string | null
          proyecto_nombre: string | null
        }
        Insert: {
          alumno_id?: string | null
          creado_por?: string | null
          fecha?: string | null
          id?: string
          logro_alcanzado?: string | null
          observaciones?: string | null
          proyecto_nombre?: string | null
        }
        Update: {
          alumno_id?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_lectura_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      respuestas_docentes: {
        Row: {
          agresiones: number | null
          alumnos_reportados: Json | null
          ambiente: Json | null
          asignatura: string
          campo_formativo: string | null
          comentarios: string | null
          conductas_grupales: string[] | null
          dispositivos: number | null
          docente: string | null
          estrategias: string[] | null
          factores_externos: Json | null
          fecha: string | null
          grupo: string
          id: string
          impacto: string
          instrucciones: number | null
          interrupciones: number | null
          intervenciones: Json | null
          movimiento: number | null
          nivel_grupo: string | null
          periodo: string | null
          tiempo_conducta: string | null
        }
        Insert: {
          agresiones?: number | null
          alumnos_reportados?: Json | null
          ambiente?: Json | null
          asignatura: string
          campo_formativo?: string | null
          comentarios?: string | null
          conductas_grupales?: string[] | null
          dispositivos?: number | null
          docente?: string | null
          estrategias?: string[] | null
          factores_externos?: Json | null
          fecha?: string | null
          grupo: string
          id?: string
          impacto: string
          instrucciones?: number | null
          interrupciones?: number | null
          intervenciones?: Json | null
          movimiento?: number | null
          nivel_grupo?: string | null
          periodo?: string | null
          tiempo_conducta?: string | null
        }
        Update: {
          agresiones?: number | null
          alumnos_reportados?: Json | null
          ambiente?: Json | null
          asignatura?: string
          campo_formativo?: string | null
          comentarios?: string | null
          conductas_grupales?: string[] | null
          dispositivos?: number | null
          docente?: string | null
          estrategias?: string[] | null
          factores_externos?: Json | null
          fecha?: string | null
          grupo?: string
          id?: string
          impacto?: string
          instrucciones?: number | null
          interrupciones?: number | null
          intervenciones?: Json | null
          movimiento?: number | null
          nivel_grupo?: string | null
          periodo?: string | null
          tiempo_conducta?: string | null
        }
        Relationships: []
      }
      salud: {
        Row: {
          alergias: string | null
          alumno_id: string
          creado_en: string | null
          documento_url: string | null
          id: string
          medicamentos: string | null
          padecimiento: string | null
          ultima_actualizacion: string
        }
        Insert: {
          alergias?: string | null
          alumno_id: string
          creado_en?: string | null
          documento_url?: string | null
          id?: string
          medicamentos?: string | null
          padecimiento?: string | null
          ultima_actualizacion?: string
        }
        Update: {
          alergias?: string | null
          alumno_id?: string
          creado_en?: string | null
          documento_url?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
          alumno_id: string | null
          creado_en: string | null
          creado_por: string | null
          estatus: string | null
          id: string
          tipo_bap: string | null
        }
        Insert: {
          ajuste_razonable?: string | null
          alumno_id?: string | null
          creado_en?: string | null
          creado_por?: string | null
          estatus?: string | null
          id?: string
          tipo_bap?: string | null
        }
        Update: {
          ajuste_razonable?: string | null
          alumno_id?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_bap_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      seguimiento_social: {
        Row: {
          acuerdos: string | null
          alumno_id: string | null
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
          alumno_id?: string | null
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
          alumno_id?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_social_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
      alumnos_operativo: {
        Row: {
          avatar_url: string | null
          creado_en: string | null
          datos_bap: Json | null
          estado_caso: string | null
          fecha_nacimiento: string | null
          genero: string | null
          grado: string | null
          grupo: string | null
          id: string | null
          matricula: string | null
          modificado_en: string | null
          modificado_por: string | null
          nombre_completo: string | null
          promedio_anterior: number | null
          tutor_escolar_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          creado_en?: string | null
          datos_bap?: Json | null
          estado_caso?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          grado?: string | null
          grupo?: string | null
          id?: string | null
          matricula?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre_completo?: string | null
          promedio_anterior?: number | null
          tutor_escolar_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          creado_en?: string | null
          datos_bap?: Json | null
          estado_caso?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          grado?: string | null
          grupo?: string | null
          id?: string | null
          matricula?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre_completo?: string | null
          promedio_anterior?: number | null
          tutor_escolar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_tutor_escolar_id_fkey"
            columns: ["tutor_escolar_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expediente_integral_alumno: {
        Row: {
          alumno_id: string | null
          escaneos_gamificacion: number | null
          estado_caso: string | null
          grado: string | null
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
          tipo_evento: string | null
        }
        Insert: {
          alumno_id?: string | null
          dimension?: never
          fecha?: never
          gravedad?: string | null
          puntaje_base?: never
          tipo_evento?: string | null
        }
        Update: {
          alumno_id?: string | null
          dimension?: never
          fecha?: never
          gravedad?: string | null
          puntaje_base?: never
          tipo_evento?: string | null
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
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
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
      decrement_visitantes: { Args: { stand_id: string }; Returns: undefined }
      finalizar_trivia_v2: {
        Args: {
          p_estacion_id: string
          p_estudiante_id: string
          p_puntos_adicionales: number
        }
        Returns: Json
      }
      fn_get_score_by_gravedad: {
        Args: { p_gravedad: string }
        Returns: number
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
      get_my_rol_safe: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_my_role_text: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      increment_visitantes: { Args: { stand_id: string }; Returns: undefined }
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
      registrar_progreso_v2: {
        Args: {
          p_estacion_id: string
          p_estudiante_id: string
          p_puntos_ganados: number
        }
        Returns: undefined
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
        | "udeii"
        | "promotora"
        | "subdireccion"
        | "admin"
        | "system_admin"
        | "developer"
        | "guest"
      estado_caso_alumno:
        | "normal"
        | "observado"
        | "intervencion"
        | "seguimiento"
      tipo_incidencia: "retardo" | "conducta" | "uniforme" | "otro"
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
        "udeii",
        "promotora",
        "subdireccion",
        "admin",
        "system_admin",
        "developer",
        "guest",
      ],
      estado_caso_alumno: [
        "normal",
        "observado",
        "intervencion",
        "seguimiento",
      ],
      tipo_incidencia: ["retardo", "conducta", "uniforme", "otro"],
    },
  },
} as const
