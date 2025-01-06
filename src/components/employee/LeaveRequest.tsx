import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LeaveRequest = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Leave Request</h2>
      <Card>
        <CardHeader>
          <CardTitle>Submit Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Leave request form coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequest;