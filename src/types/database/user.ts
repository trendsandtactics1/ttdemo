export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  employee_id: string;
  designation: string;
  password: string;
  created_at: string;
  profile_photo?: string | null;
}

export interface UserRole {
  id: string;
  user_id: string | null;
  role: 'admin' | 'manager' | 'employee';
  created_at: string;
}