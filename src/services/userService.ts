import { supabase } from "@/integrations/supabase/client";

// Fetch users
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("users") // Replace "users" with your Supabase table name
    .select("*");

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Create a user
export const createUser = async (userData) => {
  const { error } = await supabase
    .from("users") // Replace "users" with your Supabase table name
    .insert([userData]);

  if (error) {
    throw new Error(error.message);
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  const { error } = await supabase
    .from("users") // Replace "users" with your Supabase table name
    .delete()
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
};
