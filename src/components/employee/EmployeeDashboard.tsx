import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Calendar, Bell } from "lucide-react";
import { StatCard } from "./dashboard/StatCard";
import { TasksList } from "./dashboard/TasksList";
import { LeaveRequestsList } from "./dashboard/LeaveRequestsList";
import { Skeleton } from "@/components/ui/skeleton";

const EmployeeDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
    enabled: !!userId
  });

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['employee-tasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
    enabled: !!userId
  });

  const { data: leaveRequests = [], isLoading: isLeaveRequestsLoading } = useQuery({
    queryKey: ['employee-leave-requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leave requests",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
    enabled: !!userId
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `assigned_to=eq.${userId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leave_requests',
        filter: `employee_id=eq.${userId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  if (isProfileLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {profile?.name || 'Employee'}</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Pending Tasks"
          value={tasks.filter(task => task.status === 'pending').length}
          icon={ClipboardList}
        />
        <StatCard
          title="Leave Requests"
          value={leaveRequests.filter(request => request.status === 'pending').length}
          icon={Calendar}
        />
        <StatCard
          title="Completed Tasks"
          value={tasks.filter(task => task.status === 'completed').length}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isTasksLoading ? (
          <Skeleton className="h-[400px]" />
        ) : (
          <TasksList tasks={tasks} />
        )}
        
        {isLeaveRequestsLoading ? (
          <Skeleton className="h-[400px]" />
        ) : (
          <LeaveRequestsList requests={leaveRequests} />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;