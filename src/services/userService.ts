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
    // First check if user exists in auth
    const { data: existingAuthUser } = await supabase.auth.admin.getUserByEmail(data.email);
    
    let userId;

    if (existingAuthUser) {
      // If user exists in auth, use their ID
      userId = existingAuthUser.id;
    } else {
      // If user doesn't exist, create new auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // If user already exists but we didn't find them, just proceed with profile update
        if (authError.message.includes("already registered")) {
          const { data: retryAuthUser } = await supabase.auth.admin.getUserByEmail(data.email);
          if (!retryAuthUser) {
            throw new Error("Failed to retrieve existing user");
          }
          userId = retryAuthUser.id;
        } else {
          throw authError;
        }
      } else if (!authData.user?.id) {
        throw new Error("Failed to create user");
      } else {
        userId = authData.user.id;
      }
    }

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
      }, {
        onConflict: 'id'
      });

    if (profileError) throw profileError;

    // Upsert user role
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