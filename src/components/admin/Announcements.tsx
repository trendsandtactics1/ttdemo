import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementCard from "./AnnouncementCard";

interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface DatabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  image?: string;
  created_at: string;
  created_by?: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const transformDatabaseAnnouncement = (dbAnnouncement: DatabaseAnnouncement): Announcement => ({
    id: dbAnnouncement.id,
    title: dbAnnouncement.title,
    content: dbAnnouncement.content,
    image: dbAnnouncement.image,
    createdAt: dbAnnouncement.created_at,
  });

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const transformedAnnouncements = (data || []).map(transformDatabaseAnnouncement);
      setAnnouncements(transformedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAnnouncement(null);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <AnnouncementForm
            editingAnnouncement={editingAnnouncement}
            onSuccess={fetchAnnouncements}
            onClose={() => setIsOpen(false)}
          />
        </Dialog>
      </div>

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
              onEdit={() => {
                setEditingAnnouncement(announcement);
                setIsOpen(true);
              }}
              onDelete={() => handleDelete(announcement.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;