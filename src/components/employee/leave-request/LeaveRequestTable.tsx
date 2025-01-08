import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LeaveRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const LeaveRequestTable = () => {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeaveRequest[];
    }
  });

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-600">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground">No leave requests found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveRequestTable;