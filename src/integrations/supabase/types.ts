export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          employee_id: string | null
          designation: string | null
          password: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          employee_id?: string | null
          designation?: string | null
          password?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          employee_id?: string | null
          designation?: string | null
          password?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'manager' | 'employee'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'manager' | 'employee'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'employee'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'employee'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]