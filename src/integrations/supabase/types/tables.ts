import type { Database } from './database'

export interface AnnouncementsTable {
  Row: {
    content: string
    created_at: string
    created_by: string | null
    id: string
    title: string
    updated_at: string
  }
  Insert: {
    content: string
    created_at?: string
    created_by?: string | null
    id?: string
    title: string
    updated_at?: string
  }
  Update: {
    content?: string
    created_at?: string
    created_by?: string | null
    id?: string
    title?: string
    updated_at?: string
  }
}

export interface AttendanceTable {
  Row: {
    breaks: string[] | null
    check_in: string | null
    check_out: string | null
    created_at: string
    date: string
    effective_hours: number | null
    employee_id: string | null
    id: string
    total_break_hours: number | null
    updated_at: string
  }
  Insert: {
    breaks?: string[] | null
    check_in?: string | null
    check_out?: string | null
    created_at?: string
    date: string
    effective_hours?: number | null
    employee_id?: string | null
    id?: string
    total_break_hours?: number | null
    updated_at?: string
  }
  Update: {
    breaks?: string[] | null
    check_in?: string | null
    check_out?: string | null
    created_at?: string
    date?: string
    effective_hours?: number | null
    employee_id?: string | null
    id?: string
    total_break_hours?: number | null
    updated_at?: string
  }
}

export interface LeaveRequestsTable {
  Row: {
    created_at: string
    employee_id: string | null
    end_date: string
    id: string
    reason: string | null
    start_date: string
    status: string | null
    type: string
    updated_at: string
  }
  Insert: {
    created_at?: string
    employee_id?: string | null
    end_date: string
    id?: string
    reason?: string | null
    start_date: string
    status?: string | null
    type: string
    updated_at?: string
  }
  Update: {
    created_at?: string
    employee_id?: string | null
    end_date?: string
    id?: string
    reason?: string | null
    start_date?: string
    status?: string | null
    type?: string
    updated_at?: string
  }
}

export interface ProfilesTable {
  Row: {
    created_at: string
    designation: string | null
    email: string | null
    employee_id: string | null
    id: string
    name: string | null
    password: string | null
    profile_photo: string | null
    updated_at: string
  }
  Insert: {
    created_at?: string
    designation?: string | null
    email?: string | null
    employee_id?: string | null
    id: string
    name?: string | null
    password?: string | null
    profile_photo?: string | null
    updated_at?: string
  }
  Update: {
    created_at?: string
    designation?: string | null
    email?: string | null
    employee_id?: string | null
    id?: string
    name?: string | null
    password?: string | null
    profile_photo?: string | null
    updated_at?: string
  }
}

export interface TaskMessagesTable {
  Row: {
    content: string
    created_at: string | null
    id: string
    sender_id: string | null
    task_id: string | null
    updated_at: string | null
  }
  Insert: {
    content: string
    created_at?: string | null
    id?: string
    sender_id?: string | null
    task_id?: string | null
    updated_at?: string | null
  }
  Update: {
    content?: string
    created_at?: string | null
    id?: string
    sender_id?: string | null
    task_id?: string | null
    updated_at?: string | null
  }
}

export interface TasksTable {
  Row: {
    assigned_date: string | null
    assigned_to: string | null
    created_at: string
    description: string | null
    due_date: string | null
    id: string
    status: string | null
    title: string
    updated_at: string
  }
  Insert: {
    assigned_date?: string | null
    assigned_to?: string | null
    created_at?: string
    description?: string | null
    due_date?: string | null
    id?: string
    status?: string | null
    title: string
    updated_at?: string
  }
  Update: {
    assigned_date?: string | null
    assigned_to?: string | null
    created_at?: string
    description?: string | null
    due_date?: string | null
    id?: string
    status?: string | null
    title?: string
    updated_at?: string
  }
}

export interface UserRolesTable {
  Row: {
    created_at: string
    id: string
    role: Database["public"]["Enums"]["user_role"] | null
    updated_at: string
    user_id: string | null
  }
  Insert: {
    created_at?: string
    id?: string
    role?: Database["public"]["Enums"]["user_role"] | null
    updated_at?: string
    user_id?: string | null
  }
  Update: {
    created_at?: string
    id?: string
    role?: Database["public"]["Enums"]["user_role"] | null
    updated_at?: string
    user_id?: string | null
  }
}