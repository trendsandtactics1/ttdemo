import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import { employeeSchema } from "./EmployeeForm";
import type { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type EmployeeFormData = z.infer<typeof employeeSchema>;
type Profile = Database['public']['Tables']['profiles']['Row'];

const Employees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees using React Query with proper error handling
  const { data: employees = [], isLoading, error: queryError } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      return data as Profile[] || [];
    },
  });

  // Create employee mutation with proper error handling
  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      if (!data) {
        throw new Error("Employee data is required");
      }

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          designation: data.designation,
          password: data.password,
          employee_id: data.employeeId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error in createEmployee:', error);
        throw error;
      }

      return newProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    if (!data) {
      toast({
        title: "Error",
        description: "Please provide employee data",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEmployee.mutateAsync(data);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Employee ID is required",
        variant: "destructive",
      });
      return;
    }

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

  if (queryError) {
    return (
      <div className="p-4 text-red-500">
        Error loading employees: {queryError.message}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
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