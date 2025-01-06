import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Tasks = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tasks assigned.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;