import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from "@/types/user";

export const createUser = async (data: UserFormData) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) throw authError;
  if (!authData.user?.id) throw new Error("Failed to create user");

  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: data.email,
    name: data.name,
    employee_id: data.employeeId,
    designation: data.designation,
    password: data.password,
  });

  if (profileError) throw profileError;

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: authData.user.id,
    role: data.role,
  });

  if (roleError) throw roleError;

  return authData.user;
};

export const fetchUsers = async () => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*, user_roles (role)");

  if (error) throw error;
  return users;
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
};