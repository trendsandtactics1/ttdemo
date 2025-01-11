import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from "@/types/user";

export const createUser = async (data: UserFormData) => {
  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  try {
    // Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) throw signUpError;
    if (!authData?.user?.id) throw new Error("Failed to create user");

    const userId = authData.user.id;

    // Create user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: data.email,
        name: data.name,
        employee_id: data.employeeId,
        designation: data.designation,
      });

    if (profileError) throw profileError;

    // Assign user role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: data.role,
      });

    if (roleError) throw roleError;

    return { id: userId };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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