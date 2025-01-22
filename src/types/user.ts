export interface User {
  id: string;
  email: string;
  name: string;
  employee_id?: string;
  designation?: string;
  role?: string;
  profile_photo?: string;
  created_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  employee_id: string;
  designation: string;
  role: 'admin' | 'manager' | 'employee';
}