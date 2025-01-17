import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serviceRoleClient } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  designation: string;
  profile_photo?: string;
}

interface EmployeeListProps {
  employees: Employee[];
  onEmployeeDeleted: () => void;
  loading: boolean;
}

const EmployeeList = ({ employees, onEmployeeDeleted, loading }: EmployeeListProps) => {
  const { toast } = useToast();

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await serviceRoleClient
        .from("employees")
        .delete()
        .eq("employee_id", employeeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      onEmployeeDeleted();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p>Loading employees...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Employees</CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-muted-foreground">No employees found.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={employee.profile_photo} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.employee_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
