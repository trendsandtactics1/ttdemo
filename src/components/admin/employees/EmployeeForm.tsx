import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  employeeId: z.string().min(1, "Employee ID is required"),
  designation: z.string().min(1, "Designation is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const defaultEmployees = [
  { email: "gowshikdr@gmail.com", password: "Gowshik@003", name: "Gowshik", employeeId: "EMP001", designation: "Employee" },
  { email: "shinujeopoulose@gmail.com", password: "Shinu@TT006", name: "Shinu", employeeId: "EMP002", designation: "Employee" },
  { email: "sristar.live@gmail.com", password: "Sridhar@83", name: "Sridhar", employeeId: "EMP003", designation: "Employee" },
  { email: "tnmani.manikandan11@gmail.com", password: "Tnmani@2512", name: "Mani", employeeId: "EMP004", designation: "Employee" },
  { email: "unnihari15@gmail.com", password: "Harry@15", name: "Hari", employeeId: "EMP005", designation: "Employee" },
  { email: "sonukrishnan1313@gmail.com", password: "Sonu@123", name: "Sonu", employeeId: "EMP006", designation: "Employee" },
  { email: "karthikjungleemara@gmail.com", password: "Karthik@12345", name: "Karthik", employeeId: "EMP007", designation: "Employee" },
  { email: "vinodvinod18696@gmail.com", password: "Vinod@12345", name: "Vinod", employeeId: "EMP008", designation: "Employee" },
];

export const EmployeeForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      employeeId: "",
      designation: "",
      password: "",
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            employeeId: data.employeeId,
            role: 'EMPLOYEE',
          },
        },
      });

      if (authError) throw authError;

      // 2. Create the profile (this will be handled by the database trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          name: data.name,
          email: data.email,
          employee_id: data.employeeId,
          position: data.designation,
        });

      if (profileError) throw profileError;

      // 3. Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user!.id,
          role: 'EMPLOYEE',
        });

      if (roleError) throw roleError;

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      form.reset();
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createDefaultEmployees = async () => {
    for (const employee of defaultEmployees) {
      try {
        await createEmployee.mutateAsync(employee);
        console.log(`Created employee: ${employee.email}`);
      } catch (error) {
        console.error(`Error creating employee ${employee.email}:`, error);
      }
    }
    toast({
      title: "Success",
      description: "Default employees created successfully",
    });
  };

  const onSubmit = (data: EmployeeFormData) => {
    createEmployee.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" disabled={createEmployee.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createEmployee.isPending ? "Adding..." : "Add Employee"}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={createDefaultEmployees}
                disabled={createEmployee.isPending}
              >
                Create Default Employees
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};