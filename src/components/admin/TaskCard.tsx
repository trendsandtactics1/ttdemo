import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@/types/user";

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
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');
      setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

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
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3">
            <h3 className="font-semibold text-gray-800">{task.title}</h3>
            <p className="text-sm text-gray-600 truncate">{task.description}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Assigned To</p>
            <p className="text-gray-800">{task.assigned_to_profile?.name}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="text-gray-800">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div className="col-span-2">
            <Badge className={`${getStatusColor(task.status)} text-white`}>
              {task.status || 'pending'}
            </Badge>
          </div>
          <div className="col-span-3 flex gap-2">
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

            <Select
              onValueChange={(value) => handleReassign(task.id, value)}
              defaultValue={task.assigned_to || ''}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Reassign" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;