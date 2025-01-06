import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Tasks = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tasks found.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tasks;