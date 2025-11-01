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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          admin_user_id: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          created_at: string | null
          feedback: string
          id: string
          suggestion_data: Json
          suggestion_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback: string
          id?: string
          suggestion_data: Json
          suggestion_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string
          id?: string
          suggestion_data?: Json
          suggestion_type?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          content: string
          created_at: string | null
          date: string
          folder_ids: string[] | null
          id: string
          mood: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string | null
          date?: string
          folder_ids?: string[] | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          folder_ids?: string[] | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string | null
          export_data: Json
          export_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          export_data: Json
          export_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          export_data?: Json
          export_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category_id: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          id: string
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          color: string | null
          content_types: string[] | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          content_types?: string[] | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          content_types?: string[] | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          google_email: string | null
          id: string
          refresh_token: string
          token_expiry: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          google_email?: string | null
          id?: string
          refresh_token: string
          token_expiry: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          google_email?: string | null
          id?: string
          refresh_token?: string
          token_expiry?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          ai_suggested_connections: string[] | null
          color: string | null
          content: string
          created_at: string
          folder_ids: string[] | null
          id: string
          linked_notes: string[] | null
          manual_connections: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggested_connections?: string[] | null
          color?: string | null
          content?: string
          created_at?: string
          folder_ids?: string[] | null
          id?: string
          linked_notes?: string[] | null
          manual_connections?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggested_connections?: string[] | null
          color?: string | null
          content?: string
          created_at?: string
          folder_ids?: string[] | null
          id?: string
          linked_notes?: string[] | null
          manual_connections?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          paid_at: string | null
          payment_method: string | null
          plan_type: string | null
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_type?: string | null
          status: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_type?: string | null
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          created_at: string
          id: string
          max_ai_messages: number | null
          max_folders: number | null
          max_notes: number | null
          max_transactions: number | null
          plan_type: string
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_ai_messages?: number | null
          max_folders?: number | null
          max_notes?: number | null
          max_transactions?: number | null
          plan_type: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_ai_messages?: number | null
          max_folders?: number | null
          max_notes?: number | null
          max_transactions?: number | null
          plan_type?: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_generated: string | null
          start_date: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_generated?: string | null
          start_date?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_generated?: string | null
          start_date?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          next_billing_date: string | null
          payment_method: string | null
          plan_type: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_billing_date?: string | null
          payment_method?: string | null
          plan_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          next_billing_date?: string | null
          payment_method?: string | null
          plan_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          language: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sensitive_data: {
        Row: {
          address_encrypted: string | null
          birth_date_encrypted: string | null
          cpf_cnpj_encrypted: string | null
          created_at: string
          id: string
          phone_number_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_encrypted?: string | null
          birth_date_encrypted?: string | null
          cpf_cnpj_encrypted?: string | null
          created_at?: string
          id?: string
          phone_number_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_encrypted?: string | null
          birth_date_encrypted?: string | null
          cpf_cnpj_encrypted?: string | null
          created_at?: string
          id?: string
          phone_number_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          characters_written: number | null
          connections_created: number | null
          created_at: string | null
          date: string
          hour_of_day: number | null
          id: string
          items_created: number | null
          module: string
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
          words_written: number | null
        }
        Insert: {
          characters_written?: number | null
          connections_created?: number | null
          created_at?: string | null
          date?: string
          hour_of_day?: number | null
          id?: string
          items_created?: number | null
          module: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
          words_written?: number | null
        }
        Update: {
          characters_written?: number | null
          connections_created?: number | null
          created_at?: string | null
          date?: string
          hour_of_day?: number | null
          id?: string
          items_created?: number | null
          module?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          words_written?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_text: {
        Args: { data: string; encryption_key: string }
        Returns: string
      }
      encrypt_text: {
        Args: { data: string; encryption_key: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "admin" | "superadmin"
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
      app_role: ["user", "admin", "superadmin"],
    },
  },
} as const
