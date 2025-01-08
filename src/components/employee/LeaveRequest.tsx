import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { leaveRequestService } from "@/services/leaveRequestService";
import { localStorageService } from "@/services/localStorageService";

interface LeaveRequestFormData {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const initialFormData: LeaveRequestFormData = {
  type: "",
  startDate: "",
  endDate: "",
  reason: ""
};

const LeaveRequest = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState<LeaveRequestFormData>(initialFormData);
  const currentUser = localStorageService.getCurrentUser();

  useEffect(() => {
    if (currentUser?.employeeId) {
      const employeeRequests = leaveRequestService.getAllRequests();
      setRequests(employeeRequests);
    }
  }, [currentUser?.employeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.employeeId) {
      toast.error("User information not found");
      return;
    }

    const newRequest = leaveRequestService.addRequest(formData);
    setRequests(prev => [...prev, newRequest]);
    setFormData(initialFormData);
    toast.success("Leave request submitted successfully");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  if (!currentUser) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-600">Please log in to submit leave requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Leave Request</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Submit Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Leave Type</Label>
                <Input 
                  id="type" 
                  placeholder="e.g., Vacation, Sick Leave" 
                  required 
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  required 
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  required 
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea 
                id="reason" 
                placeholder="Please provide a reason for your leave request" 
                required 
                value={formData.reason}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit">Submit Request</Button>
          </form>
        </CardContent>
      </Card>

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
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequest;