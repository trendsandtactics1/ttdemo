export interface DatabaseEmployee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  designation: string;
  password: string;
  profile_photo?: string | null;
  created_at: string;
}