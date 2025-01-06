import { Task, Employee, localStorageService } from "@/services/localStorageService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskCardProps {
  task: Task;
  employees: Employee[];
}

const TaskCard = ({ task, employees }: TaskCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    localStorageService.updateTask(taskId, { status: newStatus });
    toast({
      title: "Task Updated",
      description: "Task status has been successfully updated.",
    });
  };

  const handleReassign = (taskId: string, newAssigneeId: string) => {
    localStorageService.updateTask(taskId, { assignedTo: newAssigneeId });
    toast({
      title: "Task Reassigned",
      description: "Task has been successfully reassigned.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    localStorageService.deleteTask(taskId);
    toast({
      title: "Task Deleted",
      description: "Task has been successfully deleted.",
    });
  };

  return (
    <Card>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Due Date</p>
            <p>{new Date(task.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Assigned Date</p>
            <p>{new Date(task.assignedDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created At</p>
            <p>{new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p>{new Date(task.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
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
          <Select
            onValueChange={(value) => handleReassign(task.id, value)}
            defaultValue={task.assignedTo}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Reassign to..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteTask(task.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;