import { useEffect, useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { localStorageService } from "@/services/localStorageService";
import { AttendanceRecord } from "@/services/attendance/types";
import AttendanceLoading from "./attendance/AttendanceLoading";
import AttendanceTable from "./attendance/AttendanceTable";
import AttendanceDetailsModal from "./attendance/AttendanceDetailsModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const EmployeeAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
        setLoading(false);
      } else {
        toast({
          title: "Authentication required",
          description: "Please log in to view attendance records",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    getCurrentUser();
  }, [navigate, toast]);

  const handleViewDetails = (log: AttendanceRecord) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  if (!userProfile) {
    return null;
  }

  if (loading) {
    return <AttendanceLoading />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          My Attendance
        </h2>

        <AttendanceTable
          showTodayOnly={false}
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