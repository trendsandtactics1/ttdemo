import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import DefaultEmployees from "./DefaultEmployees";

interface Employee {
  id: string;
  email: string;
  employeeId: string;
  name: string;
  designation: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      setEmployees(storedEmployees);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        <DefaultEmployees onEmployeesCreated={fetchEmployees} />
      </div>

      <EmployeeForm onEmployeeCreated={fetchEmployees} />
      <EmployeeTable employees={employees} />
    </div>
  );
};

export default Employees;