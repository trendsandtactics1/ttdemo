import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileUpdateModal = ({ open, onOpenChange }: ProfileUpdateModalProps) => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    employee_id: "",
    designation: "",
    profile_photo: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error",
            description: "No authenticated user found",
            variant: "destructive",
          });
          return;
        }

        const { data: employeeData, error } = await supabase
          .from("employees")
          .select("*")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching employee data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch employee data",
            variant: "destructive",
          });
          return;
        }

        if (employeeData) {
          setEmployeeData(employeeData);
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchEmployeeData();
    }
  }, [open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={employeeData.name}
                onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={employeeData.email}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                type="text"
                id="employeeId"
                value={employeeData.employee_id}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                type="text"
                id="designation"
                value={employeeData.designation}
                onChange={(e) => setEmployeeData({ ...employeeData, designation: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateModal;
