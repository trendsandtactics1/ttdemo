import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const AnnouncementCard = ({ announcement, onEdit, onDelete }: AnnouncementCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{announcement.title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onDelete}
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
          Posted on {new Date(announcement.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;