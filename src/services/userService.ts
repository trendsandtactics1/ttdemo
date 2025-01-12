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
    // First, check if the user exists in the users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", data.email)
      .single();

    let userId;

    if (existingUser) {
      // If user exists, update their information
      userId = existingUser.id;
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: data.name,
          employee_id: data.employeeId,
          designation: data.designation,
          password: data.password,
        })
        .eq("id", userId);

      if (updateError) throw updateError;
    } else {
      // If user doesn't exist, create new auth user and profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        if (authError instanceof AuthError) {
          // Handle specific auth errors
          if (authError.message.includes("already registered")) {
            throw new Error("This email is already registered. Please use a different email.");
          }
          throw new Error(authError.message);
        }
        throw authError;
      }

      if (!authData.user?.id) throw new Error("Failed to create user");
      
      userId = authData.user.id;

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: userId,
        email: data.email,
        name: data.name,
        employee_id: data.employeeId,
        designation: data.designation,
        password: data.password,
      });

      if (profileError) throw profileError;
    }

    // Update or create user role
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: data.role,
      }, {
        onConflict: 'user_id'
      });

    if (roleError) throw roleError;

    return { success: true, userId };
  } catch (error) {
    console.error("Error in createUser:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred while creating the user");
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
