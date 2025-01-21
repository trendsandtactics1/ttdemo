export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  employee_id: string;
  designation: string;
  created_at?: string;
  profile_photo?: string;
  role: UserRole;
}

export interface UserFormData {
  email: string;
  name: string;
  employee_id: string;
  designation: string;
  role: UserRole;
}