import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import EmployeeForm from "./EmployeeForm";
import UserList from "./UserList";
import { createUser, fetchUsers, deleteUser } from "@/services/userService";
import type { User, UserFormData } from "@/types/user";

const UserManagement = () => {
  const { toast } = useToast();

  const handleSubmit = async (data: UserFormData) => {
    try {
      await createUser(data);
      toast({
        title: "Success",
        description: "User created successfully",
      });
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
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
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
        <EmployeeForm onSubmit={handleSubmit} />
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList onDeleteUser={handleDeleteUser} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;