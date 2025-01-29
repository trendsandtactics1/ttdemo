import { useEffect, useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { AttendanceRecord } from "@/services/attendance/types";
import AttendanceLoading from "./attendance/AttendanceLoading";
import AttendanceTable from "./attendance/AttendanceTable";
import AttendanceDetailsModal from "./attendance/AttendanceDetailsModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const EmployeeAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) {
            console.log("User profile found:", data);
            setUserProfile(data);
          } else {
            console.log("No user profile found");
          }
        } else {
          toast({
            title: "Authentication required",
            description: "Please log in to view attendance records",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, [navigate, toast]);

  const handleViewDetails = (log: AttendanceRecord) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-4">
        <p className="text-center text-muted-foreground">No user profile found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          My Attendance
        </h2>

        <AttendanceTable
          logs={logs}
          onViewDetails={handleViewDetails}
          userEmail={userProfile.email}
        />

        <AttendanceDetailsModal
          log={selectedLog}
          open={showModal}
          onOpenChange={setShowModal}
        />
      </Card>
    </div>
  );
};

export default EmployeeAttendance;