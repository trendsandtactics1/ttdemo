import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from "@/types/user";
import { AuthError } from "@supabase/supabase-js";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createUser = async (data: UserFormData) => {
  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      if (authError instanceof AuthError) {
        throw new Error(authError.message);
      }
      throw authError;
    }

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
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const fetchUsers = async () => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*, user_roles (role)");

    if (error) throw error;
    return users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const deleteUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete user");
  }
};