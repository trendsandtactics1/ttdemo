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
      announcements: AnnouncementsTable
      attendance: AttendanceTable
      leave_requests: LeaveRequestsTable
      profiles: ProfilesTable
      task_messages: TaskMessagesTable
      tasks: TasksTable
      user_roles: UserRolesTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "employee" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}