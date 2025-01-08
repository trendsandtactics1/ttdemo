import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementList from "./AnnouncementList";
import { useQueryClient } from "@tanstack/react-query";

const Announcements = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
      )
      .subscribe();

    const handleEdit = (e: CustomEvent) => {
      setEditingAnnouncement(e.detail);
      setIsOpen(true);
    };

    window.addEventListener('edit-announcement', handleEdit as EventListener);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('edit-announcement', handleEdit as EventListener);
    };
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        <Button onClick={() => {
          setEditingAnnouncement(null);
          setIsOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <AnnouncementForm
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        editingAnnouncement={editingAnnouncement}
      />

      <AnnouncementList />
    </div>
  );
};

export default Announcements;