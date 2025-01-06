import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Announcements = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No announcements found.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;