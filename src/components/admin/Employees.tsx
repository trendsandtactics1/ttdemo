import { useEffect, useState } from "react";
import { serviceRoleClient } from "@/integrations/supabase/client";
import EmployeeList from "./EmployeeList";
import { Employee } from "./types";
import { useToast } from "@/components/ui/use-toast";

const EmployeePage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await serviceRoleClient
        .from("employees")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        throw error;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
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
      <input
        type="text"
        placeholder="Search employees..."
        className="w-full p-2 border rounded"
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