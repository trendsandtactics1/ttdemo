import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import UserForm from "./UserForm";
import UserList from "./UserList";
import { User, UserFormData } from "@/types/user";
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
        role: user.role || 'employee'
      })) as User[];

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

  const handleSubmit = async (data: UserFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .insert({
          email: data.email,
          name: data.name,
          employee_id: data.employee_id,
          designation: data.designation,
          role: data.role
        });

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
        <UserList users={users} onDeleteUser={loadUsers} />
      </div>
    </div>
  );
};

export default UserManagement;