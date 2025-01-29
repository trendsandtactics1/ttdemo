import { useState } from "react";
import EmployeeList from "./EmployeeList";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EmployeePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', searchTerm],
    queryFn: async () => {
      console.log('Fetching employees...');
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      console.log('Fetched employees:', data);
      return data as User[];
    }
  });

  const handleEmployeeDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search by name, email, or employee ID..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <EmployeeList
        employees={employees}
        loading={isLoading}
        onEmployeeDeleted={handleEmployeeDeleted}
      />
    </div>
  );
};

export default EmployeePage;