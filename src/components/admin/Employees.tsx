import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { localStorageService } from "@/services/localStorageService";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import type { z } from "zod";

// Re-export the schema type from EmployeeForm
type EmployeeFormData = z.infer<typeof import("./EmployeeForm").employeeSchema>;

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

    const existingEmployee = employees.find(
      (emp) => emp.email === data.email || emp.employeeId === data.employeeId
    );

    if (existingEmployee) {
      toast({
        title: "Error",
        description: "An employee with this email or ID already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      const newEmployee = localStorageService.addEmployee(data);
      setEmployees([...employees, newEmployee]);
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
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
      <EmployeeTable employees={employees} onDelete={handleDeleteEmployee} />
    </div>
  );
};

export default Employees;