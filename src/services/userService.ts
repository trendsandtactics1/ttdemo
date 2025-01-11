import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from "@/types/user";

export const createUser = async (data: UserFormData) => {
  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  try {
    // First check if user exists by trying to sign in
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    let userId: string;

    if (signInError && signInError.message !== "Invalid login credentials") {
      throw signInError;
    }

    if (existingUser?.user) {
      // User exists, use their ID
      userId = existingUser.user.id;
    } else {
      // User doesn't exist, create them
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;
      if (!newUser?.user?.id) throw new Error("Failed to create user");

      userId = newUser.user.id;
    }

    // Upsert user data
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        email: data.email,
        name: data.name,
        employee_id: data.employeeId,
        designation: data.designation,
      });

    if (profileError) throw profileError;

    // Upsert user role
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
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