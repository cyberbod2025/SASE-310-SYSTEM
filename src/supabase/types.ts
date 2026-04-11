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
          tutor_escolar_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          creado_en?: string | null
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: string | null
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
          tutor_escolar_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          creado_en?: string | null
          curp?: string | null
          datos_bap?: Json | null
          datos_tutor?: Json | null
          estado_caso?: string | null
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
      audit_log: {
        Row: {
          action_description: string | null
          action_type: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          target_record_id: string | null
          target_student_name: string | null
          target_table: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_record_id?: string | null
          target_student_name?: string | null
          target_table?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_record_id?: string | null
          target_student_name?: string | null
          target_table?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      auditoria: {
        Row: {
          creado_en: string | null
          descripcion_accion: string | null
          email_usuario: string | null
          id: string
          id_registro_objetivo: string | null
          nombre_alumno_objetivo: string | null
          nuevos_valores: Json | null
          rol_usuario: string | null
          tabla_objetivo: string | null
          tipo_accion: string
          usuario_id: string | null
          valores_anteriores: Json | null
        }
        Insert: {
          creado_en?: string | null
          descripcion_accion?: string | null
          email_usuario?: string | null
          id?: string
          id_registro_objetivo?: string | null
          nombre_alumno_objetivo?: string | null
          nuevos_valores?: Json | null
          rol_usuario?: string | null
          tabla_objetivo?: string | null
          tipo_accion: string
          usuario_id?: string | null
          valores_anteriores?: Json | null
        }
        Update: {
          creado_en?: string | null
          descripcion_accion?: string | null
          email_usuario?: string | null
          id?: string
          id_registro_objetivo?: string | null
          nombre_alumno_objetivo?: string | null
          nuevos_valores?: Json | null
          rol_usuario?: string | null
          tabla_objetivo?: string | null
          tipo_accion?: string
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
      calificaciones: {
        Row: {
          actualizado_en: string | null
          actualizado_por: string | null
          alumno_id: string
          ciclo_escolar: string | null
          creado_en: string | null
          created_at: string | null
          id: string
          materia: string
          promedio: number | null
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
          created_at?: string | null
          id?: string
          materia: string
          promedio?: number | null
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
          created_at?: string | null
          id?: string
          materia?: string
          promedio?: number | null
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
      estaciones: {
        Row: {
          categoria: string
          created_at: string | null
          descripcion_pedagogica: string | null
          estado: string | null
          fotos: string[] | null
          grado: number
          grupo: string | null
          id: string
          impacto_visual: number | null
          materia: string | null
          materiales: string[] | null
          meta: string | null
          momento_wow: string | null
          nombre: string
          pda_referencia: string | null
          proceso: string | null
          visitantes_activos: number | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descripcion_pedagogica?: string | null
          estado?: string | null
          fotos?: string[] | null
          grado: number
          grupo?: string | null
          id?: string
          impacto_visual?: number | null
          materia?: string | null
          materiales?: string[] | null
          meta?: string | null
          momento_wow?: string | null
          nombre: string
          pda_referencia?: string | null
          proceso?: string | null
          visitantes_activos?: number | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descripcion_pedagogica?: string | null
          estado?: string | null
          fotos?: string[] | null
          grado?: number
          grupo?: string | null
          id?: string
          impacto_visual?: number | null
          materia?: string | null
          materiales?: string[] | null
          meta?: string | null
          momento_wow?: string | null
          nombre?: string
          pda_referencia?: string | null
          proceso?: string | null
          visitantes_activos?: number | null
        }
        Relationships: []
      }
      estudiantes: {
        Row: {
          alumno_id: string | null
          created_at: string | null
          escaneos_realizados: number | null
          grado: number
          grupo: string | null
          id: string
          nickname: string
          password_hash: string | null
          total_puntos: number | null
          ultimo_acceso: string | null
        }
        Insert: {
          alumno_id?: string | null
          created_at?: string | null
          escaneos_realizados?: number | null
          grado: number
          grupo?: string | null
          id?: string
          nickname: string
          password_hash?: string | null
          total_puntos?: number | null
          ultimo_acceso?: string | null
        }
        Update: {
          alumno_id?: string | null
          created_at?: string | null
          escaneos_realizados?: number | null
          grado?: number
          grupo?: string | null
          id?: string
          nickname?: string
          password_hash?: string | null
          total_puntos?: number | null
          ultimo_acceso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_estudiantes_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estudiantes_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_en_riesgo"
            referencedColumns: ["alumno_id"]
          },
          {
            foreignKeyName: "fk_estudiantes_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estudiantes_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "expediente_integral_alumno"
            referencedColumns: ["alumno_id"]
          },
        ]
      }
      eventos: {
        Row: {
          creado_en: string | null
          creado_por: string | null
          descripcion: string | null
          fecha: string | null
          hora: string | null
          id: string
          tipo: string | null
          titulo: string | null
        }
        Insert: {
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          fecha?: string | null
          hora?: string | null
          id?: string
          tipo?: string | null
          titulo?: string | null
        }
        Update: {
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          fecha?: string | null
          hora?: string | null
          id?: string
          tipo?: string | null
          titulo?: string | null
        }
        Relationships: []
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
          created_at: string | null
          creado_en: string | null
          creado_por: string | null
          descripcion: string | null
          fecha: string | null
          gravedad: string | null
          id: string
          nivel_gravedad: number
          reportado_por: string
          notificado_whatsapp: boolean | null
          tipo: string | null
        }
        Insert: {
          alumno_id?: string | null
          created_at?: string | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          fecha?: string | null
          gravedad?: string | null
          id?: string
          nivel_gravedad?: number
          reportado_por: string
          notificado_whatsapp?: boolean | null
          tipo?: string | null
        }
        Update: {
          alumno_id?: string | null
          created_at?: string | null
          creado_en?: string | null
          creado_por?: string | null
          descripcion?: string | null
          fecha?: string | null
          gravedad?: string | null
          id?: string
          nivel_gravedad?: number
          reportado_por?: string
          notificado_whatsapp?: boolean | null
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
      moderacion_config: {
        Row: {
          id: number
          palabra: string
        }
        Insert: {
          id?: number
          palabra: string
        }
        Update: {
          id?: number
          palabra?: string
        }
        Relationships: []
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
      preguntometro: {
        Row: {
          created_at: string | null
          es_anonima: boolean | null
          estacion_id: string | null
          estudiante_id: string | null
          id: string
          moderacion_estado: string | null
          pregunta: string
          respuesta: string | null
        }
        Insert: {
          created_at?: string | null
          es_anonima?: boolean | null
          estacion_id?: string | null
          estudiante_id?: string | null
          id?: string
          moderacion_estado?: string | null
          pregunta: string
          respuesta?: string | null
        }
        Update: {
          created_at?: string | null
          es_anonima?: boolean | null
          estacion_id?: string | null
          estudiante_id?: string | null
          id?: string
          moderacion_estado?: string | null
          pregunta?: string
          respuesta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preguntometro_estacion_id_fkey"
            columns: ["estacion_id"]
            isOneToOne: false
            referencedRelation: "estaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preguntometro_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["id"]
          },
        ]
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
      progreso_recorrido: {
        Row: {
          completado_at: string | null
          estacion_id: string | null
          estudiante_id: string | null
          id: string
          puntos_ganados: number | null
          trivia_respondida_correctamente: boolean | null
        }
        Insert: {
          completado_at?: string | null
          estacion_id?: string | null
          estudiante_id?: string | null
          id?: string
          puntos_ganados?: number | null
          trivia_respondida_correctamente?: boolean | null
        }
        Update: {
          completado_at?: string | null
          estacion_id?: string | null
          estudiante_id?: string | null
          id?: string
          puntos_ganados?: number | null
          trivia_respondida_correctamente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "progreso_recorrido_estacion_id_fkey"
            columns: ["estacion_id"]
            isOneToOne: false
            referencedRelation: "estaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_recorrido_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "estudiantes"
            referencedColumns: ["id"]
          },
        ]
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
      trivias: {
        Row: {
          created_at: string | null
          estacion_id: string | null
          explicacion_post_respuesta: string | null
          id: string
          opciones: Json
          pregunta: string
          puntos: number | null
          respuesta_correcta: string
        }
        Insert: {
          created_at?: string | null
          estacion_id?: string | null
          explicacion_post_respuesta?: string | null
          id?: string
          opciones: Json
          pregunta: string
          puntos?: number | null
          respuesta_correcta: string
        }
        Update: {
          created_at?: string | null
          estacion_id?: string | null
          explicacion_post_respuesta?: string | null
          id?: string
          opciones?: Json
          pregunta?: string
          puntos?: number | null
          respuesta_correcta?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivias_estacion_id_fkey"
            columns: ["estacion_id"]
            isOneToOne: false
            referencedRelation: "estaciones"
            referencedColumns: ["id"]
          },
        ]
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
      ranking_general: {
        Row: {
          escaneos_realizados: number | null
          grado: number | null
          nickname: string | null
          posicion: number | null
          total_puntos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generar_matricula_sase: { Args: never; Returns: string }
      get_my_rol_safe: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role: { Args: never; Returns: string }
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
