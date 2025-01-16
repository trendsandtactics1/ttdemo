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
    const { count, error: countError } = await serviceRoleClient
      .from('employees')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const isFirstUser = count === 0;

    const { data: authData, error: signUpError } = await serviceRoleClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        const { data: existingUser, error: fetchError } = await serviceRoleClient
          .from("employees")
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
    throw error;
  }
};

const updateUserProfile = async (userId: string, data: UserFormData, isFirstUser: boolean = false) => {
  try {
    const { error: profileError } = await serviceRoleClient
      .from("employees")
      .upsert({
        id: userId,
        email: data.email,
        name: data.name,
        employee_id: data.employeeId,
        designation: data.designation,
        password: data.password,
        role: isFirstUser ? 'admin' as UserRole : data.role,
      });

    if (profileError) throw profileError;

    return { success: true, userId };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data: employees, error } = await serviceRoleClient
      .from("employees")
      .select("*");

    if (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }

    // Type assertion to ensure role is of type UserRole
    return (employees || []).map(emp => ({
      ...emp,
      role: emp.role as UserRole
    }));
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    const { error } = await serviceRoleClient.auth.admin.deleteUser(userId);
      
    if (error) throw error;

    // Also delete from employees table
    const { error: deleteError } = await serviceRoleClient
      .from("employees")
      .delete()
      .eq("id", userId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
};