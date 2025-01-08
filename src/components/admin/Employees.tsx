import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import { employeeSchema } from "./EmployeeForm";
import type { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type EmployeeFormData = z.infer<typeof employeeSchema>;

const Employees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const { error } = await supabase
        .from('profiles')
        .insert({
          name: data.name,
          email: data.email,
          employee_id: data.employeeId,
          designation: data.designation,
          id: data.employeeId, // Added required id field
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployeeMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(employeeId);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <EmployeeForm onSubmit={handleSubmit} />
      <EmployeeTable 
        employees={employees} 
        onDelete={handleDeleteEmployee}
        isLoading={isLoading} 
      />
    </div>
  );
};

export default Employees;
