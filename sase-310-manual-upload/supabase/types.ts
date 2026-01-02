export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          matricula: string;
          name: string;
          group_id: string;
          avatar_url: string | null;
          created_at: string;
          // Add other columns as per types.ts manually or via generation
        };
        Insert: {
          id?: string;
          matricula: string;
          name: string;
          group_id: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          matricula?: string;
          name?: string;
          group_id?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          student_id: string;
          type: string;
          description: string | null;
          date: string;
          reported_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          type: string;
          description?: string | null;
          date?: string;
          reported_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          type?: string;
          description?: string | null;
          date?: string;
          reported_by?: string;
          created_at?: string;
        };
      };
      // Add other tables: justificantes, audit_log, etc.
      audit_log: {
        Row: {
          id: string;
          user_email: string;
          user_role: string;
          action_type: string;
          action_description: string;
          target_table: string;
          target_record_id: string;
          target_student_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          user_role: string;
          action_type: string;
          action_description: string;
          target_table: string;
          target_record_id: string;
          target_student_name?: string | null;
          created_at?: string;
        };
        Update: {
          // ...
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      log_audit: {
        Args: {
          p_action_type: string;
          p_action_description: string;
          p_target_table: string;
          p_target_record_id: string;
          p_target_student_name?: string | null;
          p_old_values?: Json | null;
          p_new_values?: Json | null;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
