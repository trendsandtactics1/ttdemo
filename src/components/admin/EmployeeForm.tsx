import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  onEmployeeCreated: () => void;
}

const EmployeeForm = ({ onEmployeeCreated }: EmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      const newEmployee = {
        id: crypto.randomUUID(),
        email,
        name,
        employeeId,
        designation,
        password,
        role: 'EMPLOYEE'
      };

      existingEmployees.push(newEmployee);
      localStorage.setItem('employees', JSON.stringify(existingEmployees));

      toast({
        title: "Success",
        description: "Employee created successfully",
      });

      // Reset form
      setEmail("");
      setName("");
      setEmployeeId("");
      setDesignation("");
      setPassword("");

      onEmployeeCreated();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={createEmployee} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Designation"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        Add Employee
      </Button>
    </form>
  );
};

export default EmployeeForm;