import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { localStorageService } from "@/services/localStorageService";

const Employees = () => {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setEmployees(localStorageService.getEmployees());
  }, []);

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter employee name",
        variant: "destructive",
      });
      return;
    }

    const newEmployee = {
      id: crypto.randomUUID(),
      name: newEmployeeName.trim(),
    };

    localStorageService.addEmployee(newEmployee);
    setEmployees([...employees, newEmployee]);
    setNewEmployeeName("");

    toast({
      title: "Success",
      description: "Employee added successfully",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Enter employee name"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
            />
            <Button onClick={handleAddEmployee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
          {employees.length === 0 ? (
            <p className="text-muted-foreground">No employees found.</p>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>{employee.name}</span>
                  <span className="text-sm text-muted-foreground">ID: {employee.id}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;