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
    // Try to sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      // If user already exists, proceed with profile update
      if (signUpError.message.includes("already registered")) {
        // Get the user's data from the users table using their email
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("email", data.email)
          .single();

        if (fetchError) throw fetchError;
        if (!existingUser) throw new Error("Failed to retrieve existing user");
        
        return await updateUserProfile(existingUser.id, data);
      }
      throw signUpError;
    }

    if (!authData.user?.id) {
      throw new Error("Failed to create user");
    }

    return await updateUserProfile(authData.user.id, data);
  } catch (error) {
    console.error("Error in createUser:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred while creating the user");
  }
};

const updateUserProfile = async (userId: string, data: UserFormData) => {
  // Upsert user profile
  const { error: profileError } = await supabase
    .from("users")
    .upsert({
      id: userId,
      email: data.email,
      name: data.name,
      employee_id: data.employeeId,
      designation: data.designation,
      password: data.password,
    });

  if (profileError) throw profileError;

  // Upsert user role using the existing unique constraint
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({
      user_id: userId,
      role: data.role,
    });

  if (roleError) throw roleError;

  return { success: true, userId };
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