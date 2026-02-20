export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      activaciones_protocolo: {
        Row: {
          estado: string | null;
          fecha_fin: string | null;
          fecha_inicio: string | null;
          id: string;
          incidencia_id: string | null;
          notas: string | null;
          protocolo_id: string;
          usuario_id: string | null;
        };
        Insert: {
          estado?: string | null;
          fecha_fin?: string | null;
          fecha_inicio?: string | null;
          id?: string;
          incidencia_id?: string | null;
          notas?: string | null;
          protocolo_id: string;
          usuario_id?: string | null;
        };
        Update: {
          estado?: string | null;
          fecha_fin?: string | null;
          fecha_inicio?: string | null;
          id?: string;
          incidencia_id?: string | null;
          notas?: string | null;
          protocolo_id?: string;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activaciones_protocolo_incidencia_id_fkey";
            columns: ["incidencia_id"];
            isOneToOne: false;
            referencedRelation: "incidencias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activaciones_protocolo_protocolo_id_fkey";
            columns: ["protocolo_id"];
            isOneToOne: false;
            referencedRelation: "protocolos";
            referencedColumns: ["id"];
          },
        ];
      };
      activities_log: {
        Row: {
          created_at: string | null;
          date: string | null;
          description: string | null;
          group_id: string | null;
          id: string;
          role: string | null;
          type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          date?: string | null;
          description?: string | null;
          group_id?: string | null;
          id?: string;
          role?: string | null;
          type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          date?: string | null;
          description?: string | null;
          group_id?: string | null;
          id?: string;
          role?: string | null;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      alertas_patron: {
        Row: {
          alumno_id: string | null;
          asignado_a_rol: string | null;
          created_at: string | null;
          estado: string | null;
          id: string;
          tipo_patron: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          asignado_a_rol?: string | null;
          created_at?: string | null;
          estado?: string | null;
          id?: string;
          tipo_patron?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          asignado_a_rol?: string | null;
          created_at?: string | null;
          estado?: string | null;
          id?: string;
          tipo_patron?: string | null;
        };
        Relationships: [];
      };
      alumnos: {
        Row: {
          avatar_url: string | null;
          creado_en: string | null;
          curp: string | null;
          datos_bap: Json | null;
          datos_tutor: Json | null;
          estado_caso: string | null;
          fecha_nacimiento: string | null;
          genero: string | null;
          grado: string | null;
          grupo: string | null;
          id: string;
          matricula: string | null;
          modificado_en: string | null;
          modificado_por: string | null;
          nombre_completo: string | null;
          is_distancia: boolean | null;
          promedio_anterior: number | null;
          tutor_escolar_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          creado_en?: string | null;
          curp?: string | null;
          datos_bap?: Json | null;
          datos_tutor?: Json | null;
          estado_caso?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          grado?: string | null;
          grupo?: string | null;
          id?: string;
          matricula?: string | null;
          modificado_en?: string | null;
          modificado_por?: string | null;
          nombre_completo?: string | null;
          is_distancia?: boolean | null;
          promedio_anterior?: number | null;
          tutor_escolar_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          creado_en?: string | null;
          curp?: string | null;
          datos_bap?: Json | null;
          datos_tutor?: Json | null;
          estado_caso?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          grado?: string | null;
          grupo?: string | null;
          id?: string;
          matricula?: string | null;
          modificado_en?: string | null;
          modificado_por?: string | null;
          nombre_completo?: string | null;
          is_distancia?: boolean | null;
          promedio_anterior?: number | null;
          tutor_escolar_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alumnos_tutor_escolar_id_fkey";
            columns: ["tutor_escolar_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      atenciones_medicas: {
        Row: {
          alumno_id: string | null;
          atendido_por: string;
          created_at: string | null;
          id: string;
          motivo: string | null;
          se_fue_a_casa: boolean | null;
          sintomas: string;
          tratamiento: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          atendido_por: string;
          created_at?: string | null;
          id?: string;
          motivo?: string | null;
          se_fue_a_casa?: boolean | null;
          sintomas: string;
          tratamiento?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          atendido_por?: string;
          created_at?: string | null;
          id?: string;
          motivo?: string | null;
          se_fue_a_casa?: boolean | null;
          sintomas?: string;
          tratamiento?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "atenciones_medicas_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "atenciones_medicas_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "atenciones_medicas_atendido_por_fkey";
            columns: ["atendido_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance_logs: {
        Row: {
          comentarios: string | null;
          created_at: string | null;
          docente_id: string | null;
          fecha: string;
          grupo_id: string;
          id: string;
          registros: Json;
        };
        Insert: {
          comentarios?: string | null;
          created_at?: string | null;
          docente_id?: string | null;
          fecha: string;
          grupo_id: string;
          id?: string;
          registros: Json;
        };
        Update: {
          comentarios?: string | null;
          created_at?: string | null;
          docente_id?: string | null;
          fecha?: string;
          grupo_id?: string;
          id?: string;
          registros?: Json;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          action_description: string | null;
          action_type: string;
          created_at: string | null;
          id: string;
          new_values: Json | null;
          old_values: Json | null;
          target_record_id: string | null;
          target_student_name: string | null;
          target_table: string | null;
          user_email: string | null;
          user_id: string | null;
          user_role: string | null;
        };
        Insert: {
          action_description?: string | null;
          action_type: string;
          created_at?: string | null;
          id?: string;
          new_values?: Json | null;
          old_values?: Json | null;
          target_record_id?: string | null;
          target_student_name?: string | null;
          target_table?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          user_role?: string | null;
        };
        Update: {
          action_description?: string | null;
          action_type?: string;
          created_at?: string | null;
          id?: string;
          new_values?: Json | null;
          old_values?: Json | null;
          target_record_id?: string | null;
          target_student_name?: string | null;
          target_table?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          user_role?: string | null;
        };
        Relationships: [];
      };
      auditoria: {
        Row: {
          creado_en: string | null;
          descripcion_accion: string | null;
          email_usuario: string | null;
          id: string;
          id_registro_objetivo: string | null;
          nombre_alumno_objetivo: string | null;
          nuevos_valores: Json | null;
          rol_usuario: string | null;
          tabla_objetivo: string | null;
          tipo_accion: string;
          usuario_id: string | null;
          valores_anteriores: Json | null;
        };
        Insert: {
          creado_en?: string | null;
          descripcion_accion?: string | null;
          email_usuario?: string | null;
          id?: string;
          id_registro_objetivo?: string | null;
          nombre_alumno_objetivo?: string | null;
          nuevos_valores?: Json | null;
          rol_usuario?: string | null;
          tabla_objetivo?: string | null;
          tipo_accion: string;
          usuario_id?: string | null;
          valores_anteriores?: Json | null;
        };
        Update: {
          creado_en?: string | null;
          descripcion_accion?: string | null;
          email_usuario?: string | null;
          id?: string;
          id_registro_objetivo?: string | null;
          nombre_alumno_objetivo?: string | null;
          nuevos_valores?: Json | null;
          rol_usuario?: string | null;
          tabla_objetivo?: string | null;
          tipo_accion?: string;
          usuario_id?: string | null;
          valores_anteriores?: Json | null;
        };
        Relationships: [];
      };
      calificaciones: {
        Row: {
          actualizado_en: string | null;
          actualizado_por: string | null;
          alumno_id: string;
          ciclo_escolar: string | null;
          creado_en: string | null;
          id: string;
          materia: string;
          promedio_final: number | null;
          trimestre1: number | null;
          trimestre2: number | null;
          trimestre3: number | null;
        };
        Insert: {
          actualizado_en?: string | null;
          actualizado_por?: string | null;
          alumno_id: string;
          ciclo_escolar?: string | null;
          creado_en?: string | null;
          id?: string;
          materia: string;
          promedio_final?: number | null;
          trimestre1?: number | null;
          trimestre2?: number | null;
          trimestre3?: number | null;
        };
        Update: {
          actualizado_en?: string | null;
          actualizado_por?: string | null;
          alumno_id?: string;
          ciclo_escolar?: string | null;
          creado_en?: string | null;
          id?: string;
          materia?: string;
          promedio_final?: number | null;
          trimestre1?: number | null;
          trimestre2?: number | null;
          trimestre3?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "calificaciones_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calificaciones_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
        ];
      };
      citas_padres: {
        Row: {
          alumno_id: string;
          creado_por: string | null;
          created_at: string | null;
          estado: string | null;
          fecha_cita: string;
          id: string;
          motivo: string;
          observaciones: string | null;
        };
        Insert: {
          alumno_id: string;
          creado_por?: string | null;
          created_at?: string | null;
          estado?: string | null;
          fecha_cita: string;
          id?: string;
          motivo: string;
          observaciones?: string | null;
        };
        Update: {
          alumno_id?: string;
          creado_por?: string | null;
          created_at?: string | null;
          estado?: string | null;
          fecha_cita?: string;
          id?: string;
          motivo?: string;
          observaciones?: string | null;
        };
        Relationships: [];
      };
      contacts_log: {
        Row: {
          created_at: string | null;
          id: string;
          method: string | null;
          notes: string | null;
          outcome: string | null;
          student_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          method?: string | null;
          notes?: string | null;
          outcome?: string | null;
          student_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          method?: string | null;
          notes?: string | null;
          outcome?: string | null;
          student_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      documentos_institucionales: {
        Row: {
          alumno_id: string | null;
          contenido: string;
          creado_en: string | null;
          creado_por: string | null;
          fecha: string | null;
          firmas: string[] | null;
          folio: string;
          id: string;
          narracion_ia: string | null;
          tipo: string;
          titulo: string;
        };
        Insert: {
          alumno_id?: string | null;
          contenido: string;
          creado_en?: string | null;
          creado_por?: string | null;
          fecha?: string | null;
          firmas?: string[] | null;
          folio: string;
          id?: string;
          narracion_ia?: string | null;
          tipo: string;
          titulo: string;
        };
        Update: {
          alumno_id?: string | null;
          contenido?: string;
          creado_en?: string | null;
          creado_por?: string | null;
          fecha?: string | null;
          firmas?: string[] | null;
          folio?: string;
          id?: string;
          narracion_ia?: string | null;
          tipo?: string;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documentos_institucionales_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documentos_institucionales_creado_por_fkey";
            columns: ["creado_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      eventos: {
        Row: {
          creado_en: string | null;
          creado_por: string | null;
          descripcion: string | null;
          fecha: string | null;
          hora: string | null;
          id: string;
          tipo: string | null;
          titulo: string | null;
        };
        Insert: {
          creado_en?: string | null;
          creado_por?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          hora?: string | null;
          id?: string;
          tipo?: string | null;
          titulo?: string | null;
        };
        Update: {
          creado_en?: string | null;
          creado_por?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          hora?: string | null;
          id?: string;
          tipo?: string | null;
          titulo?: string | null;
        };
        Relationships: [];
      };
      evidence_log: {
        Row: {
          created_at: string | null;
          file_type: string | null;
          id: string;
          link: string | null;
          notes: string | null;
          role: string | null;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          file_type?: string | null;
          id?: string;
          link?: string | null;
          notes?: string | null;
          role?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          file_type?: string | null;
          id?: string;
          link?: string | null;
          notes?: string | null;
          role?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      incidencias: {
        Row: {
          alumno_id: string | null;
          creado_en: string | null;
          creado_por: string | null;
          descripcion: string | null;
          fecha: string | null;
          id: string;
          nivel_gravedad: number;
          reportado_por: string;
          tipo: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          creado_en?: string | null;
          creado_por?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          id?: string;
          nivel_gravedad?: number;
          reportado_por: string;
          tipo?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          creado_en?: string | null;
          creado_por?: string | null;
          descripcion?: string | null;
          fecha?: string | null;
          id?: string;
          nivel_gravedad?: number;
          reportado_por?: string;
          tipo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "incidencias_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidencias_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidencias_creado_por_fkey";
            columns: ["creado_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidencias_reportado_por_fkey";
            columns: ["reportado_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      incidents: {
        Row: {
          created_at: string | null;
          date: string | null;
          description: string | null;
          id: string;
          reported_by: string | null;
          student_id: string;
          type: string;
        };
        Insert: {
          created_at?: string | null;
          date?: string | null;
          description?: string | null;
          id?: string;
          reported_by?: string | null;
          student_id: string;
          type: string;
        };
        Update: {
          created_at?: string | null;
          date?: string | null;
          description?: string | null;
          id?: string;
          reported_by?: string | null;
          student_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incidents_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      interventions_log: {
        Row: {
          created_at: string | null;
          id: string;
          notes: string | null;
          reason: string | null;
          result: string | null;
          student_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          reason?: string | null;
          result?: string | null;
          student_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          reason?: string | null;
          result?: string | null;
          student_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      justificantes: {
        Row: {
          alumno_id: string | null;
          creado_en: string | null;
          descripcion: string | null;
          emitido_por: string;
          fecha_fin: string | null;
          fecha_inicio: string | null;
          folio: string | null;
          id: string;
          motivo: string | null;
          tipo: string | null;
          valido_por: string | null;
        };
        Insert: {
          alumno_id?: string | null;
          creado_en?: string | null;
          descripcion?: string | null;
          emitido_por: string;
          fecha_fin?: string | null;
          fecha_inicio?: string | null;
          folio?: string | null;
          id?: string;
          motivo?: string | null;
          tipo?: string | null;
          valido_por?: string | null;
        };
        Update: {
          alumno_id?: string | null;
          creado_en?: string | null;
          descripcion?: string | null;
          emitido_por?: string;
          fecha_fin?: string | null;
          fecha_inicio?: string | null;
          folio?: string | null;
          id?: string;
          motivo?: string | null;
          tipo?: string | null;
          valido_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "justificantes_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "justificantes_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "justificantes_issued_by_fkey";
            columns: ["emitido_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "justificantes_valido_por_fkey";
            columns: ["valido_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pasos_protocolo: {
        Row: {
          accion: string;
          creado_en: string | null;
          descripcion_detalle: string | null;
          es_advertencia: boolean | null;
          id: string;
          orden: number;
          protocolo_id: string;
          rol_responsable: string | null;
        };
        Insert: {
          accion: string;
          creado_en?: string | null;
          descripcion_detalle?: string | null;
          es_advertencia?: boolean | null;
          id?: string;
          orden: number;
          protocolo_id: string;
          rol_responsable?: string | null;
        };
        Update: {
          accion?: string;
          creado_en?: string | null;
          descripcion_detalle?: string | null;
          es_advertencia?: boolean | null;
          id?: string;
          orden?: number;
          protocolo_id?: string;
          rol_responsable?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pasos_protocolo_protocolo_id_fkey";
            columns: ["protocolo_id"];
            isOneToOne: false;
            referencedRelation: "protocolos";
            referencedColumns: ["id"];
          },
        ];
      };
      perfiles_usuario: {
        Row: {
          alcances: Json | null;
          curp: string | null;
          email: string | null;
          es_tutor: boolean | null;
          estado_cuenta: string | null;
          fecha_validacion: string | null;
          grupo_tutor: string | null;
          grupos: string[] | null;
          id: string;
          materias: string | null;
          matricula_sase: string | null;
          nombre_completo: string | null;
          observaciones: string | null;
          permisos: Json | null;
          rol: string | null;
          rol_solicitado: string | null;
          telefono: string | null;
          turno: string | null;
          updated_at: string | null;
          validado_por: string | null;
        };
        Insert: {
          alcances?: Json | null;
          curp?: string | null;
          email?: string | null;
          es_tutor?: boolean | null;
          estado_cuenta?: string | null;
          fecha_validacion?: string | null;
          grupo_tutor?: string | null;
          grupos?: string[] | null;
          id: string;
          materias?: string | null;
          matricula_sase?: string | null;
          nombre_completo?: string | null;
          observaciones?: string | null;
          permisos?: Json | null;
          rol?: string | null;
          rol_solicitado?: string | null;
          telefono?: string | null;
          turno?: string | null;
          updated_at?: string | null;
          validado_por?: string | null;
        };
        Update: {
          alcances?: Json | null;
          curp?: string | null;
          email?: string | null;
          es_tutor?: boolean | null;
          estado_cuenta?: string | null;
          fecha_validacion?: string | null;
          grupo_tutor?: string | null;
          grupos?: string[] | null;
          id: string;
          materias?: string | null;
          matricula_sase?: string | null;
          nombre_completo?: string | null;
          observaciones?: string | null;
          permisos?: Json | null;
          rol?: string | null;
          rol_solicitado?: string | null;
          telefono?: string | null;
          turno?: string | null;
          updated_at?: string | null;
          validado_por?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          activo: boolean | null;
          full_name: string | null;
          id: string;
          nombre: string | null;
          rol: string | null;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          activo?: boolean | null;
          full_name?: string | null;
          id: string;
          nombre?: string | null;
          rol?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          activo?: boolean | null;
          full_name?: string | null;
          id?: string;
          nombre?: string | null;
          rol?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      protocolos: {
        Row: {
          activacion: string | null;
          creado_en: string | null;
          fuente: string | null;
          icono: string | null;
          id: string;
          objetivo: string | null;
          palabras_clave: string[] | null;
          roles_responsables: string[] | null;
          tipo: string;
          titulo: string;
        };
        Insert: {
          activacion?: string | null;
          creado_en?: string | null;
          fuente?: string | null;
          icono?: string | null;
          id?: string;
          objetivo?: string | null;
          palabras_clave?: string[] | null;
          roles_responsables?: string[] | null;
          tipo: string;
          titulo: string;
        };
        Update: {
          activacion?: string | null;
          creado_en?: string | null;
          fuente?: string | null;
          icono?: string | null;
          id?: string;
          objetivo?: string | null;
          palabras_clave?: string[] | null;
          roles_responsables?: string[] | null;
          tipo?: string;
          titulo?: string;
        };
        Relationships: [];
      };
      salud: {
        Row: {
          alergias: string | null;
          alumno_id: string;
          creado_en: string | null;
          documento_url: string | null;
          id: string;
          medicamentos: string | null;
          padecimiento: string | null;
          ultima_actualizacion: string;
        };
        Insert: {
          alergias?: string | null;
          alumno_id: string;
          creado_en?: string | null;
          documento_url?: string | null;
          id?: string;
          medicamentos?: string | null;
          padecimiento?: string | null;
          ultima_actualizacion?: string;
        };
        Update: {
          alergias?: string | null;
          alumno_id?: string;
          creado_en?: string | null;
          documento_url?: string | null;
          id?: string;
          medicamentos?: string | null;
          padecimiento?: string | null;
          ultima_actualizacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "salud_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "salud_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: false;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
        ];
      };
      sandbox_alertas: {
        Row: {
          created_at: string | null;
          estado: string | null;
          id: string;
          persona_id: string | null;
          tipo_patron: string | null;
        };
        Insert: {
          created_at?: string | null;
          estado?: string | null;
          id?: string;
          persona_id?: string | null;
          tipo_patron?: string | null;
        };
        Update: {
          created_at?: string | null;
          estado?: string | null;
          id?: string;
          persona_id?: string | null;
          tipo_patron?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sandbox_alertas_persona_id_fkey";
            columns: ["persona_id"];
            isOneToOne: false;
            referencedRelation: "sandbox_personas";
            referencedColumns: ["id"];
          },
        ];
      };
      sandbox_incidencias: {
        Row: {
          descripcion: string | null;
          fecha_incidencia: string | null;
          id: string;
          persona_id: string | null;
          reportado_por: string | null;
          tipo: string;
        };
        Insert: {
          descripcion?: string | null;
          fecha_incidencia?: string | null;
          id?: string;
          persona_id?: string | null;
          reportado_por?: string | null;
          tipo: string;
        };
        Update: {
          descripcion?: string | null;
          fecha_incidencia?: string | null;
          id?: string;
          persona_id?: string | null;
          reportado_por?: string | null;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sandbox_incidencias_persona_id_fkey";
            columns: ["persona_id"];
            isOneToOne: false;
            referencedRelation: "sandbox_personas";
            referencedColumns: ["id"];
          },
        ];
      };
      sandbox_personas: {
        Row: {
          created_at: string | null;
          estatus: string | null;
          grado: string;
          grupo: string;
          id: string;
          nombre_completo: string;
          riesgo_nivel: string | null;
        };
        Insert: {
          created_at?: string | null;
          estatus?: string | null;
          grado: string;
          grupo: string;
          id?: string;
          nombre_completo: string;
          riesgo_nivel?: string | null;
        };
        Update: {
          created_at?: string | null;
          estatus?: string | null;
          grado?: string;
          grupo?: string;
          id?: string;
          nombre_completo?: string;
          riesgo_nivel?: string | null;
        };
        Relationships: [];
      };
      socioeconomico_general: {
        Row: {
          alumno_id: string;
          nivel_ingresos: string | null;
          observaciones_generales: string | null;
          situacion_familiar: string | null;
          updated_at: string;
        };
        Insert: {
          alumno_id: string;
          nivel_ingresos?: string | null;
          observaciones_generales?: string | null;
          situacion_familiar?: string | null;
          updated_at?: string;
        };
        Update: {
          alumno_id?: string;
          nivel_ingresos?: string | null;
          observaciones_generales?: string | null;
          situacion_familiar?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "socioeconomico_general_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: true;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "socioeconomico_general_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: true;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
        ];
      };
      socioeconomico_privado: {
        Row: {
          alumno_id: string;
          observaciones_restringidas: string | null;
          updated_at: string;
        };
        Insert: {
          alumno_id: string;
          observaciones_restringidas?: string | null;
          updated_at?: string;
        };
        Update: {
          alumno_id?: string;
          observaciones_restringidas?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "socioeconomico_privado_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: true;
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "socioeconomico_privado_alumno_id_fkey";
            columns: ["alumno_id"];
            isOneToOne: true;
            referencedRelation: "alumnos_operativo";
            referencedColumns: ["id"];
          },
        ];
      };
      solicitudes_alta_personal: {
        Row: {
          acepta_auditoria: boolean;
          acepta_etica: boolean;
          acepta_privacidad: boolean;
          apellido_materno: string;
          apellido_paterno: string;
          aprobado_en: string | null;
          aprobado_por: string | null;
          area_cobertura: string | null;
          correo_institucional: string;
          created_at: string;
          curp: string;
          es_tutor: boolean;
          estado: string;
          grupo_tutor: string | null;
          grupos: string[] | null;
          id: string;
          materias: string[] | null;
          matricula_sase: string | null;
          metadata: Json;
          nombres: string;
          observaciones: string | null;
          observaciones_validacion: string | null;
          rol_solicitado: string[];
          telefono: string | null;
          turno: string;
        };
        Insert: {
          acepta_auditoria?: boolean;
          acepta_etica?: boolean;
          acepta_privacidad?: boolean;
          apellido_materno: string;
          apellido_paterno: string;
          aprobado_en?: string | null;
          aprobado_por?: string | null;
          area_cobertura?: string | null;
          correo_institucional: string;
          created_at?: string;
          curp: string;
          es_tutor?: boolean;
          estado?: string;
          grupo_tutor?: string | null;
          grupos?: string[] | null;
          id?: string;
          materias?: string[] | null;
          matricula_sase?: string | null;
          metadata?: Json;
          nombres: string;
          observaciones?: string | null;
          observaciones_validacion?: string | null;
          rol_solicitado: string[];
          telefono?: string | null;
          turno: string;
        };
        Update: {
          acepta_auditoria?: boolean;
          acepta_etica?: boolean;
          acepta_privacidad?: boolean;
          apellido_materno?: string;
          apellido_paterno?: string;
          aprobado_en?: string | null;
          aprobado_por?: string | null;
          area_cobertura?: string | null;
          correo_institucional?: string;
          created_at?: string;
          curp?: string;
          es_tutor?: boolean;
          estado?: string;
          grupo_tutor?: string | null;
          grupos?: string[] | null;
          id?: string;
          materias?: string[] | null;
          matricula_sase?: string | null;
          metadata?: Json;
          nombres?: string;
          observaciones?: string | null;
          observaciones_validacion?: string | null;
          rol_solicitado?: string[];
          telefono?: string | null;
          turno?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          avatar_url: string | null;
          bap_info: Json | null;
          created_at: string | null;
          group_id: string;
          guardian_info: Json | null;
          id: string;
          last_modified_at: string | null;
          last_modified_by: string | null;
          matricula: string;
          name: string;
        };
        Insert: {
          avatar_url?: string | null;
          bap_info?: Json | null;
          created_at?: string | null;
          group_id: string;
          guardian_info?: Json | null;
          id?: string;
          last_modified_at?: string | null;
          last_modified_by?: string | null;
          matricula: string;
          name: string;
        };
        Update: {
          avatar_url?: string | null;
          bap_info?: Json | null;
          created_at?: string | null;
          group_id?: string;
          guardian_info?: Json | null;
          id?: string;
          last_modified_at?: string | null;
          last_modified_by?: string | null;
          matricula?: string;
          name?: string;
        };
        Relationships: [];
      };
      system_feedback: {
        Row: {
          comment: string;
          created_at: string;
          email: string | null;
          id: number;
          resolved: boolean | null;
          type: string | null;
          url: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          comment: string;
          created_at?: string;
          email?: string | null;
          id?: number;
          resolved?: boolean | null;
          type?: string | null;
          url?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          comment?: string;
          created_at?: string;
          email?: string | null;
          id?: number;
          resolved?: boolean | null;
          type?: string | null;
          url?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          full_name: string | null;
          id: string;
          role: string | null;
        };
        Insert: {
          full_name?: string | null;
          id: string;
          role?: string | null;
        };
        Update: {
          full_name?: string | null;
          id?: string;
          role?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      alumnos_operativo: {
        Row: {
          avatar_url: string | null;
          creado_en: string | null;
          datos_bap: Json | null;
          estado_caso: string | null;
          fecha_nacimiento: string | null;
          genero: string | null;
          grado: string | null;
          grupo: string | null;
          id: string | null;
          matricula: string | null;
          modificado_en: string | null;
          modificado_por: string | null;
          nombre_completo: string | null;
          promedio_anterior: number | null;
          tutor_escolar_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          creado_en?: string | null;
          datos_bap?: Json | null;
          estado_caso?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          grado?: string | null;
          grupo?: string | null;
          id?: string | null;
          matricula?: string | null;
          modificado_en?: string | null;
          modificado_por?: string | null;
          nombre_completo?: string | null;
          promedio_anterior?: number | null;
          tutor_escolar_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          creado_en?: string | null;
          datos_bap?: Json | null;
          estado_caso?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          grado?: string | null;
          grupo?: string | null;
          id?: string | null;
          matricula?: string | null;
          modificado_en?: string | null;
          modificado_por?: string | null;
          nombre_completo?: string | null;
          promedio_anterior?: number | null;
          tutor_escolar_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alumnos_tutor_escolar_id_fkey";
            columns: ["tutor_escolar_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      generar_matricula_sase: { Args: never; Returns: string };
      get_my_rol_safe: { Args: never; Returns: string };
      get_my_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      registrar_auditoria_sase: {
        Args: {
          p_descripcion: string;
          p_email: string;
          p_id_registro?: string;
          p_rol: string;
          p_tabla?: string;
          p_tipo_accion: string;
          p_usuario_id: string;
        };
        Returns: string;
      };
    };
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
        | "promotora";
      estado_caso_alumno:
        | "normal"
        | "observado"
        | "intervencion"
        | "seguimiento";
      tipo_incidencia: "retardo" | "conducta" | "uniforme" | "otro";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

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
} as const;
