import { supabase } from "@/integrations/supabase/client";
import { UserFormData } from "@/types/user";

// Fetch all users
export const fetchUsers = async () => {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Create a new user
export const createUser = async (userData: UserFormData) => {
  const { error } = await supabase.from("profiles").insert([{
    name: userData.name,
    email: userData.email,
    employee_id: userData.employeeId,
    designation: userData.designation,
    password: userData.password,
    role: userData.role
  }]);
  if (error) throw new Error(error.message);
};

// Delete a user
export const deleteUser = async (userId: string) => {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) throw new Error(error.message);
};