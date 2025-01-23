export interface User {
  id: string;
  name: string | null;
  email: string | null;
  employee_id: string | null;
  designation: string | null;
  role: string | null;
  password: string | null;
}

export interface UserFormData {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  password: string;
  role: "admin" | "manager" | "employee";
}