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
      
      return data as Profile[];
    },
  });

  // Create employee mutation
  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(), // Generate a UUID for the new profile
          name: data.name,
          email: data.email,
          designation: data.designation,
          password: data.password
        })
        .select()
        .single();

      if (error) throw error;
      return newProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating employee:', error);
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