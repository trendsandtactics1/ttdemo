import { serviceRoleClient } from "@/integrations/supabase/client";
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
    const { data: authData, error: signUpError } = await serviceRoleClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    });

    if (signUpError) throw signUpError;
    if (!authData.user?.id) throw new Error("Failed to create user");

    const { error: profileError } = await serviceRoleClient
      .from("employees")
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        employee_id: data.employeeId,
        designation: data.designation,
        password: data.password,
        role: data.role
      });

    if (profileError) throw profileError;

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data: employees, error } = await serviceRoleClient
      .from("employees")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }

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
    const { error: authError } = await serviceRoleClient.auth.admin.deleteUser(userId);
    if (authError) throw authError;

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
