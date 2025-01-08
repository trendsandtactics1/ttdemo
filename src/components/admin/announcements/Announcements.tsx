import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementCard from "./AnnouncementCard";
import { useQuery } from "@tanstack/react-query";

const Announcements = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  const { data: announcements = [], refetch } = useQuery({
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
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setIsOpen(true);
  };

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
        onSuccess={() => {
          refetch();
          setEditingAnnouncement(null);
        }}
      />

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No announcements found.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={handleEdit}
              onDelete={refetch}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;