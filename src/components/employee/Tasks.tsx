import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Task, localStorageService } from "@/services/localStorageService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      title: "Success",
      description: "Task status updated successfully",
    });
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'in-progress':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Tasks</h2>
      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No tasks assigned.</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">{task.title}</CardTitle>
                  <Badge 
                    className={`${getStatusColor(task.status)} text-white`}
                  >
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-gray-600">{task.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="text-gray-800">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned Date</p>
                    <p className="text-gray-800">{new Date(task.assignedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-gray-800">{new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-800">{new Date(task.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10"
                    onClick={() => navigate(`/employee/tasks/${task.id}/chat`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with Manager
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