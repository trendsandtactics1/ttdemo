import { useEffect, useState } from "react";
import EmployeeList from "./EmployeeList";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const EmployeePage = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      console.log('Fetching employees...');
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
      
      console.log('Fetched employees:', data);
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
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
  }, [searchTerm, page]);

  const handleEmployeeDeleted = () => {
    fetchEmployees();
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search employees..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <EmployeeList
        employees={employees}
        onEmployeeDeleted={handleEmployeeDeleted}
        loading={loading}
      />
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeePage;