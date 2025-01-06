import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("announcements");
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    }
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newAnnouncements = [...announcements];
    
    if (editingAnnouncement) {
      const index = newAnnouncements.findIndex(a => a.id === editingAnnouncement.id);
      newAnnouncements[index] = {
        ...editingAnnouncement,
        title,
        content,
        image: image || editingAnnouncement.image,
      };
    } else {
      newAnnouncements.push({
        id: crypto.randomUUID(),
        title,
        content,
        image,
        createdAt: new Date().toISOString(),
      });
    }

    setAnnouncements(newAnnouncements);
    localStorage.setItem("announcements", JSON.stringify(newAnnouncements));
    
    setTitle("");
    setContent("");
    setImage("");
    setEditingAnnouncement(null);
    setIsOpen(false);
    
    toast({
      title: "Success",
      description: `Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully`,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setImage(announcement.image || "");
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    const newAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(newAnnouncements);
    localStorage.setItem("announcements", JSON.stringify(newAnnouncements));
    toast({
      title: "Success",
      description: "Announcement deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAnnouncement(null);
              setTitle("");
              setContent("");
              setImage("");
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
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
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{announcement.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
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
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;