export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserRoleObject {
  role: UserRole;
}

export interface User {
  id: string;
  email: string;
  name: string;
  employee_id: string;
  designation: string;
  password: string;
  created_at: string;
  user_roles?: UserRoleObject;
}

export interface UserFormData {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  password: string;
  role: UserRole;
}