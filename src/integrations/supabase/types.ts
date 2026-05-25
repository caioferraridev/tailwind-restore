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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          company_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          assigned_to: string | null
          client_id: string | null
          color: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          start_at: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          assigned_to?: string | null
          client_id?: string | null
          color?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          start_at: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          assigned_to?: string | null
          client_id?: string | null
          color?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          start_at?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_files: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_observations: {
        Row: {
          attachments: Json
          author_id: string | null
          category: string
          client_id: string
          company_id: string
          content: string
          created_at: string
          id: string
          observation_date: string
          priority: Database["public"]["Enums"]["priority_level"]
          updated_at: string
        }
        Insert: {
          attachments?: Json
          author_id?: string | null
          category?: string
          client_id: string
          company_id: string
          content: string
          created_at?: string
          id?: string
          observation_date?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          updated_at?: string
        }
        Update: {
          attachments?: Json
          author_id?: string | null
          category?: string
          client_id?: string
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          observation_date?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obs_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_services: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          monthly_value: number
          notes: string | null
          service_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_value?: number
          notes?: string | null
          service_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_value?: number
          notes?: string | null
          service_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cs_service_fk"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          archived: boolean
          city: string | null
          cnpj: string | null
          company_id: string
          company_name: string
          company_size: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_role: string | null
          contact_whatsapp: string | null
          contract_type: string | null
          created_at: string
          created_by: string | null
          due_day: number | null
          entry_date: string | null
          facebook: string | null
          financial_email: string | null
          financial_notes: string | null
          id: string
          instagram: string | null
          internal_notes: string | null
          linkedin: string | null
          logo_url: string | null
          monthly_value: number | null
          payment_method: string | null
          payment_status: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          responsible_id: string | null
          segment: string | null
          state: string | null
          state_registration: string | null
          status: Database["public"]["Enums"]["client_status"]
          trade_name: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          archived?: boolean
          city?: string | null
          cnpj?: string | null
          company_id: string
          company_name: string
          company_size?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          contact_whatsapp?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          due_day?: number | null
          entry_date?: string | null
          facebook?: string | null
          financial_email?: string | null
          financial_notes?: string | null
          id?: string
          instagram?: string | null
          internal_notes?: string | null
          linkedin?: string | null
          logo_url?: string | null
          monthly_value?: number | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          responsible_id?: string | null
          segment?: string | null
          state?: string | null
          state_registration?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          archived?: boolean
          city?: string | null
          cnpj?: string | null
          company_id?: string
          company_name?: string
          company_size?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          contact_whatsapp?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          due_day?: number | null
          entry_date?: string | null
          facebook?: string | null
          financial_email?: string | null
          financial_notes?: string | null
          id?: string
          instagram?: string | null
          internal_notes?: string | null
          linkedin?: string | null
          logo_url?: string | null
          monthly_value?: number | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          responsible_id?: string | null
          segment?: string | null
          state?: string | null
          state_registration?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          trade_name: string | null
          updated_at: string
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          trade_name?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          trade_name?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      demands: {
        Row: {
          assigned_to: string | null
          checklist: Json | null
          client_id: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          delivery_date: string | null
          delivery_time: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          service_id: string | null
          status: Database["public"]["Enums"]["demand_status"]
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          checklist?: Json | null
          client_id?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          service_id?: string | null
          status?: Database["public"]["Enums"]["demand_status"]
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          checklist?: Json | null
          client_id?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          service_id?: string | null
          status?: Database["public"]["Enums"]["demand_status"]
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demands_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demands_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demands_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demands_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tx_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          created_by: string | null
          current_value: number
          description: string | null
          id: string
          metric: string
          period_end: string
          period_start: string
          status: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          current_value?: number
          description?: string | null
          id?: string
          metric?: string
          period_end: string
          period_start: string
          status?: string
          target_value?: number
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          current_value?: number
          description?: string | null
          id?: string
          metric?: string
          period_end?: string
          period_start?: string
          status?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_id: string
          company_name: string | null
          converted_client_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          estimated_value: number | null
          id: string
          lost_reason: string | null
          name: string
          next_followup_date: string | null
          notes: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          segment: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          company_name?: string | null
          converted_client_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          estimated_value?: number | null
          id?: string
          lost_reason?: string | null
          name: string
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          segment?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          company_name?: string | null
          converted_client_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          estimated_value?: number | null
          id?: string
          lost_reason?: string | null
          name?: string
          next_followup_date?: string | null
          notes?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          segment?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_client_id_fkey"
            columns: ["converted_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: string | null
          checklist: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          default_value: number | null
          description: string | null
          estimated_time: string | null
          id: string
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          sla_days: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          checklist?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          default_value?: number | null
          description?: string | null
          estimated_time?: string | null
          id?: string
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          sla_days?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          checklist?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          default_value?: number | null
          description?: string | null
          estimated_time?: string | null
          id?: string
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          sla_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      client_status: "ativo" | "inativo" | "pausado" | "arquivado"
      demand_status:
        | "pendente"
        | "em_andamento"
        | "aguardando_cliente"
        | "em_revisao"
        | "finalizado"
        | "atrasado"
      event_type:
        | "postagem"
        | "reuniao"
        | "entrega"
        | "aprovacao"
        | "campanha"
        | "cobranca"
        | "planejamento"
        | "ajuste"
        | "revisao"
        | "tarefa"
      lead_status:
        | "novo"
        | "contato"
        | "qualificado"
        | "proposta"
        | "negociacao"
        | "ganho"
        | "perdido"
      notification_type: "info" | "success" | "warning" | "error"
      priority_level: "baixa" | "media" | "alta" | "urgente"
      transaction_status: "pendente" | "pago" | "atrasado" | "cancelado"
      transaction_type: "receita" | "despesa"
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
      app_role: ["admin", "manager", "user"],
      client_status: ["ativo", "inativo", "pausado", "arquivado"],
      demand_status: [
        "pendente",
        "em_andamento",
        "aguardando_cliente",
        "em_revisao",
        "finalizado",
        "atrasado",
      ],
      event_type: [
        "postagem",
        "reuniao",
        "entrega",
        "aprovacao",
        "campanha",
        "cobranca",
        "planejamento",
        "ajuste",
        "revisao",
        "tarefa",
      ],
      lead_status: [
        "novo",
        "contato",
        "qualificado",
        "proposta",
        "negociacao",
        "ganho",
        "perdido",
      ],
      notification_type: ["info", "success", "warning", "error"],
      priority_level: ["baixa", "media", "alta", "urgente"],
      transaction_status: ["pendente", "pago", "atrasado", "cancelado"],
      transaction_type: ["receita", "despesa"],
    },
  },
} as const
