import { DatabaseUser } from './database';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserRoleObject {
  role: UserRole;
}

export interface User extends DatabaseUser {
  user_roles?: UserRoleObject[];
}

export interface UserFormData {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  password: string;
  role: UserRole;
}