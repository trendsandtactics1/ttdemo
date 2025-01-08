import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingAnnouncement?: {
    id: string;
    title: string;
    content: string;
    image?: string;
  };
  onSuccess: () => void;
}

const AnnouncementForm = ({ isOpen, setIsOpen, editingAnnouncement, onSuccess }: AnnouncementFormProps) => {
  const [title, setTitle] = useState(editingAnnouncement?.title || "");
  const [content, setContent] = useState(editingAnnouncement?.content || "");
  const [image, setImage] = useState<string>(editingAnnouncement?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const announcementData = {
        title,
        content,
        image,
        created_by: userData.user.id,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);
        
        if (error) throw error;
        toast.success("Announcement updated successfully");
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([announcementData]);
        
        if (error) throw error;
        toast.success("Announcement created successfully");
      }

      setTitle("");
      setContent("");
      setImage("");
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : (editingAnnouncement ? "Update" : "Create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementForm;