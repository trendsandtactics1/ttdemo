import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: string;
  email: string;
  employeeId: string;
  name: string;
  designation: string;
}

const defaultEmployees = [
  {
    email: "gowshikdr@gmail.com",
    password: "Gowshik@003",
    name: "Gowshik",
    designation: "Employee",
    employeeId: "TT001"
  },
  {
    email: "john.doe@example.com",
    password: "JohnDoe@123",
    name: "John Doe",
    designation: "Manager",
    employeeId: "TT002"
  },
  {
    email: "jane.smith@example.com",
    password: "JaneSmith@123",
    name: "Jane Smith",
    designation: "Developer",
    employeeId: "TT003"
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmployees(profiles || []);
    } catch (error) {
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

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            employeeId,
            designation,
            role: 'EMPLOYEE'
          }
        }
      });

      if (signUpError) throw signUpError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user?.id,
            email,
            name,
            employeeId,
            designation,
            role: 'EMPLOYEE'
          }
        ]);

      if (profileError) throw profileError;

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

      // Refresh employee list
      fetchEmployees();
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

  const createDefaultEmployees = async () => {
    setLoading(true);
    
    for (const employee of defaultEmployees) {
      try {
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: employee.email,
          password: employee.password,
          options: {
            data: {
              name: employee.name,
              employeeId: employee.employeeId,
              designation: employee.designation,
              role: 'EMPLOYEE'
            }
          }
        });

        if (signUpError) throw signUpError;

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user?.id,
              email: employee.email,
              name: employee.name,
              employeeId: employee.employeeId,
              designation: employee.designation,
              role: 'EMPLOYEE'
            }
          ]);

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: `Created employee: ${employee.name}`,
        });
      } catch (error: any) {
        console.error('Error creating default employee:', error);
        toast({
          title: "Error",
          description: `Failed to create ${employee.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    fetchEmployees();
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        <Button onClick={createDefaultEmployees} disabled={loading}>
          Create Default Employees
        </Button>
      </div>

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Designation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.employeeId}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.designation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Employees;
