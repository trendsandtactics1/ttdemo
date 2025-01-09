export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          image: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image?: string | null
          title?: string
        }
        Relationships: []
      }
      attendance_config: {
        Row: {
          created_at: string
          id: string
          script_url: string | null
          sheet_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          script_url?: string | null
          sheet_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          script_url?: string | null
          sheet_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          designation: string
          email: string
          employee_id: string
          id: string
          name: string
          password: string
          profile_photo: string | null
        }
        Insert: {
          created_at?: string
          designation: string
          email: string
          employee_id: string
          id?: string
          name: string
          password: string
          profile_photo?: string | null
        }
        Update: {
          created_at?: string
          designation?: string
          email?: string
          employee_id?: string
          id?: string
          name?: string
          password?: string
          profile_photo?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string
          id: string
          reason: string
          start_date: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          reason: string
          start_date: string
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string
          start_date?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_date: string
          assigned_to: string
          created_at: string
          description: string
          due_date: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_date: string
          assigned_to: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          assigned_to?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          designation: string
          email: string
          employee_id: string
          id: string
          name: string
          password: string
        }
        Insert: {
          created_at?: string
          designation: string
          email: string
          employee_id: string
          id: string
          name: string
          password: string
        }
        Update: {
          created_at?: string
          designation?: string
          email?: string
          employee_id?: string
          id?: string
          name?: string
          password?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
