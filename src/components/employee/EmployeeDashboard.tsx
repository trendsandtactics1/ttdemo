import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user";
import ProfileUpdateModal from "./ProfileUpdateModal";

const EmployeeDashboard = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['employee-tasks', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', currentUser?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['employee-leave-requests', currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', currentUser?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser?.id) return;

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${currentUser.id}`
        },
        () => {
          // Invalidate and refetch tasks
          void queryClient.invalidateQueries({ queryKey: ['employee-tasks'] });
        }
      )
      .subscribe();

    const leaveRequestsChannel = supabase
      .channel('leave-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests',
          filter: `employee_id=eq.${currentUser.id}`
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
        }
      )
      .subscribe();

    const announcementsChannel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(leaveRequestsChannel);
      supabase.removeChannel(announcementsChannel);
    };
  }, [currentUser?.id, queryClient]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={() => setIsUpdateModalOpen(true)}>
          Update Profile
        </Button>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {currentUser?.name}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
          <p><strong>Employee ID:</strong> {currentUser?.employee_id}</p>
          <p><strong>Designation:</strong> {currentUser?.designation}</p>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks assigned.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    <span className="px-2 py-1 rounded text-sm bg-primary/10">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <p className="text-muted-foreground">No leave requests found.</p>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{request.type}</p>
                      <p className="text-sm">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-muted-foreground">No announcements found.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <p className="text-sm">{announcement.content}</p>
                  {announcement.image && (
                    <img 
                      src={announcement.image} 
                      alt={announcement.title}
                      className="mt-2 rounded-lg max-h-40 object-cover"
                    />
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Posted on {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProfileUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default EmployeeDashboard;
