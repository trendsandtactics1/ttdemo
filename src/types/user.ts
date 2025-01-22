export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  employee_id: string;
  designation: string;
  password: string;
  created_at?: string;
  profile_photo?: string;
  role: UserRole;
}

export interface UserFormData {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  password: string;
  role: UserRole;
}