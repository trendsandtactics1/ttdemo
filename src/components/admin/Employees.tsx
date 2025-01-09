import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <EmployeeForm onEmployeeAdded={fetchEmployees} />
      <EmployeeList employees={employees} onEmployeeDeleted={fetchEmployees} />
    </div>
  );
};

export default Employees;