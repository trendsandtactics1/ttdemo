export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  employee_id: string;
  designation: string;
  password: string;
  created_at: string;
  profile_photo?: string;
}

export interface DatabaseEmployee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  designation: string;
  password: string;
  profile_photo?: string;
  created_at: string;
}

export interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: string;
  created_at: string;
  updated_at: string;
  due_date: string;
  assigned_date: string;
}

export interface DatabaseLeaveRequest {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}