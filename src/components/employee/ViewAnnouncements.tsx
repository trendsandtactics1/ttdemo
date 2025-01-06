import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

const ViewAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("announcements");
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
      {announcements.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Latest Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No announcements found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <CardTitle>{announcement.title}</CardTitle>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAnnouncements;