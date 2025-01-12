import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from "@/types/user";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sqnomwztuuaxtzdbqvji.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbm9td3p0dXVheHR6ZGJxdmppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjMzOTE0NywiZXhwIjoyMDUxOTE1MTQ3fQ.vQjgODEzKEzXRz5e_-YvQDuqxNB5E_vJNZhFE9B7MAg";

// Create a Supabase client with the service role key
const serviceRoleClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createUser = async (data: UserFormData) => {
  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  try {
    // Check if this is the first user being created
    const { count, error: countError } = await serviceRoleClient
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const isFirstUser = count === 0;

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
        
        return await updateUserProfile(existingUser.id, data, isFirstUser);
      }
      throw signUpError;
    }

    if (!authData.user?.id) {
      throw new Error("Failed to create user");
    }

    return await updateUserProfile(authData.user.id, data, isFirstUser);
  } catch (error) {
    console.error("Error in createUser:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred while creating the user");
  }
};

const updateUserProfile = async (userId: string, data: UserFormData, isFirstUser: boolean = false) => {
  // Always use service role client for first user
  const client = isFirstUser ? serviceRoleClient : supabase;

  // Upsert user profile
  const { error: profileError } = await client
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

  // Upsert user role - use service role client for first user
  const { error: roleError } = await client
    .from("user_roles")
    .upsert({
      user_id: userId,
      role: isFirstUser ? 'admin' : data.role, // First user is always admin
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