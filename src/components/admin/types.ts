export interface Employee {
  id: string;
  name: string;
  email: string;
  employee_id: string | null;
  designation: string | null;
  profile_photo?: string | null;
  created_at?: string;
  role?: string | null;
}