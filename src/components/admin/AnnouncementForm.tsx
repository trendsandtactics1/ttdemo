import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementFormProps {
  editingAnnouncement?: {
    id: string;
    title: string;
    content: string;
    image?: string;
  } | null;
  onSuccess: () => void;
  onClose: () => void;
}

const AnnouncementForm = ({ editingAnnouncement, onSuccess, onClose }: AnnouncementFormProps) => {
  const [title, setTitle] = useState(editingAnnouncement?.title || "");
  const [content, setContent] = useState(editingAnnouncement?.content || "");
  const [image, setImage] = useState(editingAnnouncement?.image || "");
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = editingAnnouncement
        ? await supabase
            .from("announcements")
            .update({ title, content, image })
            .eq("id", editingAnnouncement.id)
        : await supabase
            .from("announcements")
            .insert([{ title, content, image }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">
            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
              <Image className="h-4 w-4 mr-2" />
              Upload Image (Optional)
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          {image && (
            <img src={image} alt="Preview" className="mt-2 max-h-40 rounded" />
          )}
        </div>
        <Button type="submit" className="w-full">
          {editingAnnouncement ? "Update" : "Create"}
        </Button>
      </form>
    </DialogContent>
  );
};

export default AnnouncementForm;