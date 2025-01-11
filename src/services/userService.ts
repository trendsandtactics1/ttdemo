import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from "@/types/user";
import { AuthError, User as AuthUser } from "@supabase/supabase-js";

export const createUser = async (data: UserFormData) => {
  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  try {
    // First check if user exists in auth system
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) throw getUserError;
    
    const existingUser = users?.find((user: AuthUser) => user.email === data.email);
    let userId;

    if (existingUser) {
      // If user exists in auth, use their ID
      userId = existingUser.id;
    } else {
      // If user doesn't exist in auth, create new auth user
      const { data: newAuthUser, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        if (signUpError instanceof AuthError) {
          throw new Error(signUpError.message);
        }
        throw signUpError;
      }

      if (!newAuthUser?.user?.id) throw new Error("Failed to create user");
      userId = newAuthUser.user.id;
    }

    // Check if user exists in users table
    const { data: existingDbUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', data.email)
      .maybeSingle();

    if (userError) throw userError;

    // Upsert user data
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: existingDbUser?.id || userId,
        email: data.email,
        name: data.name,
        employee_id: data.employeeId,
        designation: data.designation,
        password: data.password,
      });

    if (profileError) throw profileError;

    // Upsert user role
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: existingDbUser?.id || userId,
        role: data.role,
      });

    if (roleError) throw roleError;

    return { id: existingDbUser?.id || userId };
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