import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { attendanceService } from "@/services/attendanceService";
import { AttendanceRecord } from "@/services/attendance/types";
import AttendanceTable from "./attendance/AttendanceTable";
import AttendanceLoading from "./attendance/AttendanceLoading";
import AttendanceDetailsModal from "./attendance/AttendanceDetailsModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmployeeAttendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
          navigate("/login");
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
          toast({
            title: "Error",
            description: "Failed to fetch user profile. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        if (!userProfile?.employee_id) {
          toast({
            title: "Profile Not Found",
            description: "Your employee profile is not set up. Please contact HR.",
            variant: "destructive",
          });
          return;
        }

        const allLogs = await attendanceService.getAttendanceLogs();
        console.log('All logs:', allLogs);
        console.log('Current user profile:', userProfile);
        
        const employeeLogs = allLogs
          .filter(log => log.employeeId === userProfile.employee_id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log('Filtered logs:', employeeLogs);
        setAttendanceLogs(employeeLogs);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance logs. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [navigate, toast]);

  if (isLoading) {
    return <AttendanceLoading />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Attendance</h2>
        <AttendanceTable
          attendanceLogs={attendanceLogs}
          onViewDetails={(log) => setSelectedLog(log)}
        />
      </Card>

      <AttendanceDetailsModal
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
};

export default EmployeeAttendance;