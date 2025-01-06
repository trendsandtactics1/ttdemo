import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Task, localStorageService } from "@/services/localStorageService";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial load
    setTasks(localStorageService.getTasks());

    // Listen for updates
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

  const handleChatClick = (taskId: string) => {
    navigate(`/employee/tasks/${taskId}/chat`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No tasks assigned.</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                  >
                    Start Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(task.id, 'completed')}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleChatClick(task.id)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
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