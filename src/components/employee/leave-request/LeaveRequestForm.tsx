import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

const LeaveRequestForm = () => {
  const [formData, setFormData] = useState<LeaveRequestFormData>(initialFormData);
  const queryClient = useQueryClient();

  const createLeaveRequest = useMutation({
    mutationFn: async (formData: LeaveRequestFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) throw new Error('Not authenticated');

      // First, ensure user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.session.user.id)
        .maybeSingle();

      if (!profile) {
        throw new Error('Profile not found. Please complete your profile first.');
      }

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
    onError: (error: Error) => {
      toast.error(error.message);
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

  return (
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
  );
};

export default LeaveRequestForm;