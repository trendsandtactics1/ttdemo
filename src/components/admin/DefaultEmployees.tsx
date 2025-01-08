import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DefaultEmployeesProps {
  onEmployeesCreated: () => void;
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
    email: "shinujeopoulose@gmail.com",
    password: "Shinu@TT006",
    name: "Shinu",
    designation: "Employee",
    employeeId: "TT006"
  },
  {
    email: "sristar.live@gmail.com",
    password: "Sridhar@83",
    name: "Sridhar",
    designation: "Employee",
    employeeId: "TT007"
  },
  {
    email: "tnmani.manikandan11@gmail.com",
    password: "Tnmani@2512",
    name: "Mani",
    designation: "Employee",
    employeeId: "TT008"
  },
  {
    email: "unnihari15@gmail.com",
    password: "Harry@15",
    name: "Hari",
    designation: "Employee",
    employeeId: "TT009"
  },
  {
    email: "sonukrishnan1313@gmail.com",
    password: "Sonu@123",
    name: "Sonu",
    designation: "Employee",
    employeeId: "TT010"
  },
  {
    email: "karthikjungleemara@gmail.com",
    password: "Karthik@12345",
    name: "Karthik",
    designation: "Employee",
    employeeId: "TT011"
  },
  {
    email: "vinodvinod18696@gmail.com",
    password: "Vinod@12345",
    name: "Vinod",
    designation: "Employee",
    employeeId: "TT012"
  }
];

const DefaultEmployees = ({ onEmployeesCreated }: DefaultEmployeesProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDefaultEmployees = () => {
    if (loading) return; // Prevent multiple clicks while loading
    setLoading(true);
    
    try {
      // Safely get and parse existing employees
      let existingEmployees = [];
      const storedEmployees = localStorage.getItem('employees');
      
      if (storedEmployees) {
        try {
          existingEmployees = JSON.parse(storedEmployees);
          // Ensure existingEmployees is an array
          if (!Array.isArray(existingEmployees)) {
            existingEmployees = [];
          }
        } catch (parseError) {
          console.error('Error parsing stored employees:', parseError);
          existingEmployees = [];
        }
      }
      
      // Create new employees array with default employees
      const newEmployees = defaultEmployees.map(employee => {
        if (!employee || typeof employee !== 'object') {
          throw new Error('Invalid employee data');
        }
        
        return {
          id: crypto.randomUUID(),
          email: employee.email || '',
          name: employee.name || '',
          employeeId: employee.employeeId || '',
          designation: employee.designation || '',
          role: 'EMPLOYEE',
          password: employee.password || ''
        };
      });

      // Combine existing and new employees
      const updatedEmployees = [...existingEmployees, ...newEmployees];
      
      // Save to localStorage
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));

      toast({
        title: "Success",
        description: "Default employees created successfully",
      });

      // Only call callback if it exists
      if (typeof onEmployeesCreated === 'function') {
        onEmployeesCreated();
      }
    } catch (error) {
      console.error('Error creating default employees:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create default employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={createDefaultEmployees} disabled={loading}>
      Create Default Employees
    </Button>
  );
};

export default DefaultEmployees;