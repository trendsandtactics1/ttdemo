import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types/task";
import { Employee } from "@/types/employee";
import CreateTaskModal from "./CreateTaskModal";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";
import { supabase } from "@/integrations/supabase/client";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: sortOrder === "asc" });
      
      if (tasksData) {
        setTasks(tasksData as Task[]);
      }
    };

    const fetchEmployees = async () => {
      const { data: employeesData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "employee");
      
      if (employeesData) {
        setEmployees(employeesData);
      }
    };

    fetchTasks();
    fetchEmployees();
  }, [sortOrder]);

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === "all" || task.assigned_to === assigneeFilter;
      return matchesSearch && matchesStatus && matchesAssignee;
    });

  const handleTaskCreated = async () => {
    // Refresh tasks list
    const { data: updatedTasks } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (updatedTasks) {
      setTasks(updatedTasks as Task[]);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <CreateTaskModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onTaskCreated={handleTaskCreated}
        />
      </div>

      <TaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        employees={employees}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No tasks found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              employees={employees}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;