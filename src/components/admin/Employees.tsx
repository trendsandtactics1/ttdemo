import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/services/localStorageService";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import { employeeSchema } from "./EmployeeForm";
import type { z } from "zod";

type EmployeeFormData = z.infer<typeof employeeSchema>;

const Employees = () => {
  const [employees, setEmployees] = useState(localStorageService.getEmployees());
  const { toast } = useToast();

  const handleSubmit = (data: EmployeeFormData) => {
    if (!data) {
      toast({
        title: "Error",
        description: "Invalid form data",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingEmployee = employees.find(
        (emp) => emp?.email === data.email || emp?.employeeId === data.employeeId
      );

      if (existingEmployee) {
        toast({
          title: "Error",
          description: "An employee with this email or ID already exists",
          variant: "destructive",
        });
        return;
      }

      const newEmployee = localStorageService.addEmployee({
        name: data.name,
        email: data.email,
        employeeId: data.employeeId,
        designation: data.designation,
        password: data.password,
      });
      
      if (!newEmployee) {
        throw new Error("Failed to add employee");
      }
      
      setEmployees([...employees, newEmployee]);
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Invalid employee ID",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorageService.deleteEmployee(employeeId);
      setEmployees(localStorageService.getEmployees());
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

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <EmployeeForm onSubmit={handleSubmit} />
      <EmployeeTable 
        employees={employees || []} 
        onDelete={handleDeleteEmployee} 
      />
    </div>
  );
};

export default Employees;