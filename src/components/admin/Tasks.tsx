import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Task, localStorageService } from "@/services/localStorageService";
import CreateTaskModal from "./CreateTaskModal";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setTasks(localStorageService.getTasks());
    const handleTasksUpdate = () => {
      setTasks(localStorageService.getTasks());
    };
    window.addEventListener('tasks-updated', handleTasksUpdate);
    return () => window.removeEventListener('tasks-updated', handleTasksUpdate);
  }, []);

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    localStorageService.updateTask(taskId, { status: newStatus });
    toast({
      title: "Task Updated",
      description: "Task status has been successfully updated.",
    });
  };

  const handleReassign = (taskId: string, newAssignee: string) => {
    localStorageService.updateTask(taskId, { assignedTo: newAssignee });
    toast({
      title: "Task Reassigned",
      description: "Task has been successfully reassigned.",
    });
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <CreateTaskModal />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No tasks found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge 
                    variant={
                      task.status === 'completed' 
                        ? 'default' 
                        : task.status === 'in-progress' 
                        ? 'secondary' 
                        : 'outline'
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{task.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/tasks/${task.id}/chat`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Select
                    onValueChange={(value) => handleStatusUpdate(task.id, value as Task['status'])}
                    defaultValue={task.status}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Reassign to..."
                    className="w-[140px]"
                    onBlur={(e) => {
                      if (e.target.value) {
                        handleReassign(task.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value) {
                          handleReassign(task.id, input.value);
                          input.value = '';
                          input.blur();
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;