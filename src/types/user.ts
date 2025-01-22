export interface UserFormData {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  password: string;
  role: "admin" | "manager" | "employee";
}
