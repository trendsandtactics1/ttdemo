import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    image?: string;
    created_at: string;
  };
  onEdit: (announcement: any) => void;
  onDelete: () => void;
}

const AnnouncementCard = ({ announcement, onEdit, onDelete }: AnnouncementCardProps) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);
      
      if (error) throw error;
      onDelete();
      toast.success("Announcement deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{announcement.title}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(announcement)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{announcement.content}</p>
        {announcement.image && (
          <img
            src={announcement.image}
            alt={announcement.title}
            className="rounded-lg max-h-60 object-cover"
          />
        )}
        <p className="text-sm text-muted-foreground">
          Posted on {new Date(announcement.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;