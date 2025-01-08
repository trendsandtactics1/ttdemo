import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LeaveRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  employee_id: string;
}

interface LeaveRequestFormData {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const initialFormData: LeaveRequestFormData = {
  type: "",
  start_date: "",
  end_date: "",
  reason: ""
};

const LeaveRequest = () => {
  const [formData, setFormData] = useState<LeaveRequestFormData>(initialFormData);
  const queryClient = useQueryClient();

  // Fetch current user's leave requests
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

  // Create new leave request
  const createLeaveRequest = useMutation({
    mutationFn: async (formData: LeaveRequestFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('leave_requests')
        .insert([
          {
            ...formData,
            employee_id: session.session.user.id,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      setFormData(initialFormData);
      toast.success("Leave request submitted successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to submit leave request");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createLeaveRequest.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

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
                <Label htmlFor="start_date">Start Date</Label>
                <Input 
                  id="start_date" 
                  type="date" 
                  required 
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input 
                  id="end_date" 
                  type="date" 
                  required 
                  value={formData.end_date}
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
            <Button 
              type="submit" 
              disabled={createLeaveRequest.isPending}
            >
              {createLeaveRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
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
    </div>
  );
};

export default LeaveRequest;