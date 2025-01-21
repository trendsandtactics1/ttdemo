import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import UserForm from "./UserForm";
import UserList from "./UserList";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        ...user,
        employee_id: user.employee_id || '',
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: Omit<User, 'id'>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
        <UserList users={users} onDeleteUser={handleDeleteUser} />
      </div>
    </div>
  );
};

export default UserManagement;