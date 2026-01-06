export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      alumnos: {
        Row: {
          id: string;
          matricula: string;
          nombre_completo: string;
          curp: string | null;
          grado: string | null;
          grupo: string;
          estado_caso: string | null;
          fecha_nacimiento: string | null;
          genero: string | null;
          promedio_anterior: number | null;
          avatar_url: string | null;
          datos_tutor: Json | null;
          datos_bap: Json | null;
          modificado_por: string | null;
          modificado_en: string | null; // timestamptz
          creado_en: string;
        };
        Insert: {
          id?: string;
          matricula: string;
          nombre_completo: string;
          curp?: string | null;
          grado?: string | null;
          grupo: string;
          estado_caso?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          promedio_anterior?: number | null;
          avatar_url?: string | null;
          datos_tutor?: Json | null;
          datos_bap?: Json | null;
          modificado_por?: string | null;
          modificado_en?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          matricula?: string;
          nombre_completo?: string;
          curp?: string | null;
          grado?: string | null;
          grupo?: string;
          estado_caso?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          promedio_anterior?: number | null;
          avatar_url?: string | null;
          datos_tutor?: Json | null;
          datos_bap?: Json | null;
          modificado_por?: string | null;
          modificado_en?: string | null;
          creado_en?: string;
        };
        Relationships: [];
      };
      incidencias: {
        Row: {
          id: string;
          alumno_id: string;
          tipo: string;
          descripcion: string | null;
          fecha: string; // timestamptz
          reportado_por: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          alumno_id: string;
          tipo: string;
          descripcion?: string | null;
          fecha?: string;
          reportado_por?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          alumno_id?: string;
          tipo?: string;
          descripcion?: string | null;
          fecha?: string;
          reportado_por?: string | null;
          creado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incidencias_alumno_id_fkey";
            columns: ["alumno_id"];
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          }
        ];
      };
      justificantes: {
        Row: {
          id: string;
          alumno_id: string;
          folio: string | null;
          fecha_inicio: string | null; // date
          fecha_fin: string | null; // date
          motivo: string | null;
          descripcion: string | null;
          emitido_por: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          alumno_id: string;
          folio?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          motivo?: string | null;
          descripcion?: string | null;
          emitido_por?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          alumno_id?: string;
          folio?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          motivo?: string | null;
          descripcion?: string | null;
          emitido_por?: string | null;
          creado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "justificantes_alumno_id_fkey";
            columns: ["alumno_id"];
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          }
        ];
      };
      salud: {
        Row: {
          id: string;
          alumno_id: string;
          padecimiento: string;
          documento_url: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          alumno_id: string;
          padecimiento: string;
          documento_url?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          alumno_id?: string;
          padecimiento?: string;
          documento_url?: string | null;
          creado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "salud_alumno_id_fkey";
            columns: ["alumno_id"];
            referencedRelation: "alumnos";
            referencedColumns: ["id"];
          }
        ];
      };
      auditoria: {
        Row: {
          id: string;
          usuario_id: string | null;
          email_usuario: string | null;
          rol_usuario: string | null;
          tipo_accion: string;
          descripcion_accion: string | null;
          tabla_objetivo: string | null;
          id_registro_objetivo: string | null;
          nombre_alumno_objetivo: string | null;
          valores_anteriores: Json | null;
          nuevos_valores: Json | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string | null;
          email_usuario?: string | null;
          rol_usuario?: string | null;
          tipo_accion: string;
          descripcion_accion?: string | null;
          tabla_objetivo?: string | null;
          id_registro_objetivo?: string | null;
          nombre_alumno_objetivo?: string | null;
          valores_anteriores?: Json | null;
          nuevos_valores?: Json | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          // ... usually audit logs are append-only
        };
        Relationships: [];
      };
      perfiles_usuario: {
        Row: {
          id: string;
          rol: string | null;
          nombre_completo: string | null;
        };
        Insert: {
          id: string;
          rol?: string | null;
          nombre_completo?: string | null;
        };
        Update: {
          id?: string;
          rol?: string | null;
          nombre_completo?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"] | null;
          full_name: string | null;
          active: boolean | null;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["app_role"] | null;
          full_name?: string | null;
          active?: boolean | null;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"] | null;
          full_name?: string | null;
          active?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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
        | "secretaria";
    };
  };
};
