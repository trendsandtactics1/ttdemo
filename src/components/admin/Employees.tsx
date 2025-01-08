import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import { employeeSchema } from "./EmployeeForm";
import type { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Employee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  designation: string;
  profile_photo?: string;
}

const Employees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees using React Query
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      return data as Employee[];
    },
  });

  // Create employee mutation
  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const { error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          name: data.name,
          employee_id: data.employeeId,
          designation: data.designation,
        },
      });

      if (error) throw error;

      // Profile will be created automatically through the database trigger
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync(data);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('employee_id', employeeId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <EmployeeForm onSubmit={handleSubmit} />
      <EmployeeTable 
        employees={employees} 
        onDelete={handleDeleteEmployee} 
      />
    </div>
  );
};

export default Employees;