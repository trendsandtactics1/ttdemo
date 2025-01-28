import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

export const NotificationHandler = ({ userId }: { userId: string }) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new tasks
    const taskChannel = supabase.channel('task-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${userId}`
        },
        (payload) => {
          toast({
            title: "New Task Assigned",
            description: `${payload.new.title}`,
            icon: <Bell className="h-4 w-4" />,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${userId}`
        },
        (payload) => {
          if (payload.old.status !== payload.new.status) {
            toast({
              title: "Task Status Updated",
              description: `Task "${payload.new.title}" is now ${payload.new.status}`,
              icon: <Bell className="h-4 w-4" />,
            });
          }
        }
      );

    // Subscribe to leave request updates
    const leaveChannel = supabase.channel('leave-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leave_requests',
          filter: `employee_id=eq.${userId}`
        },
        (payload) => {
          toast({
            title: "Leave Request Updated",
            description: `Your leave request status is now ${payload.new.status}`,
            icon: <Bell className="h-4 w-4" />,
          });
        }
      );

    // Subscribe to new announcements
    const announcementChannel = supabase.channel('announcement-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          toast({
            title: "New Announcement",
            description: payload.new.title,
            icon: <Bell className="h-4 w-4" />,
          });
        }
      );

    // Subscribe to all channels
    taskChannel.subscribe();
    leaveChannel.subscribe();
    announcementChannel.subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(leaveChannel);
      supabase.removeChannel(announcementChannel);
    };
  }, [userId, toast]);

  return null;
};