import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LeaveRequests = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Leave Requests</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No leave requests found.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequests;