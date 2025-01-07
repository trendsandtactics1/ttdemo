import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeForm } from "./employees/EmployeeForm";
import { EmployeeTable } from "./employees/EmployeeTable";

const Employees = () => {
  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return profiles;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <EmployeeForm />
      <EmployeeTable employees={employees} isLoading={isLoading} />
    </div>
  );
};

export default Employees;