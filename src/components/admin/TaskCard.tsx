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
import { supabase } from "@/integrations/supabase/client";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    due_date: string | null;
    assigned_date: string | null;
    created_at: string | null;
    updated_at: string | null;
    assigned_to: string | null;
    assigned_by: string | null;
    assigned_to_profile: {
      name: string | null;
      employee_id: string | null;
    } | null;
    assigned_by_profile: {
      name: string | null;
      employee_id: string | null;
    } | null;
  };
}

const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Task Updated",
      description: "Task status has been successfully updated.",
    });
  };

  const handleReassign = async (taskId: string, newAssigneeId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ assigned_to: newAssigneeId })
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reassign task.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Task Reassigned",
      description: "Task has been successfully reassigned.",
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Task Deleted",
      description: "Task has been successfully deleted.",
    });
  };

  const getStatusColor = (status: string | null) => {
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
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg font-semibold text-gray-800">{task.title}</CardTitle>
          <Badge 
            className={`${getStatusColor(task.status)} text-white`}
          >
            {task.status || 'pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-gray-600">{task.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md">
          <div>
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="text-gray-800">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Assigned Date</p>
            <p className="text-gray-800">{task.assigned_date ? new Date(task.assigned_date).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created At</p>
            <p className="text-gray-800">{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Updated</p>
            <p className="text-gray-800">{task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'Not set'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10"
            onClick={() => navigate(`/admin/tasks/${task.id}/chat`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Select
            onValueChange={(value) => handleStatusUpdate(task.id, value)}
            defaultValue={task.status || 'pending'}
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
          <Button
            variant="destructive"
            size="sm"
            className="hover:bg-red-600"
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