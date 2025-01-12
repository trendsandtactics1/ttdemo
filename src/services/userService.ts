import { supabase, serviceRoleClient } from "@/integrations/supabase/client";
import { User, UserFormData, UserRole } from "@/types/user";

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

    // Create auth user with service role client
    const { data: authData, error: signUpError } = await serviceRoleClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    });

    if (signUpError) {
      // If user already exists, proceed with profile update
      if (signUpError.message.includes("already registered")) {
        // Get the user's data from the users table using their email
        const { data: existingUser, error: fetchError } = await serviceRoleClient
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
  try {
    // Upsert user profile
    const { error: profileError } = await serviceRoleClient
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

    // Upsert user role
    const { error: roleError } = await serviceRoleClient
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: isFirstUser ? 'admin' as UserRole : data.role,
      });

    if (roleError) throw roleError;

    return { success: true, userId };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await serviceRoleClient
      .from("users")
      .select(`
        *,
        user_roles (
          role
        )
      `);

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    // Transform the data to match the User type
    const transformedData = data?.map(user => ({
      ...user,
      user_roles: Array.isArray(user.user_roles) ? user.user_roles : [user.user_roles]
    })) as User[];

    return transformedData || [];
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    // Delete the user from auth.users (this will cascade to public.users due to FK)
    const { error } = await serviceRoleClient.auth.admin.deleteUser(userId);
      
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete user");
  }
};