
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaveRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface LeaveRequestsListProps {
  requests: LeaveRequest[];
}

export const LeaveRequestsList = ({ requests }: LeaveRequestsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.slice(0, 5).map((request) => (
            <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-2">
              <div className="space-y-1 w-full sm:w-auto">
                <p className="font-medium text-sm sm:text-base">{request.type}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {request.status}
              </span>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-muted-foreground text-center text-sm">No leave requests found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
