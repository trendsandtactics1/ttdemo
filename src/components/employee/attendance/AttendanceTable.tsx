import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { AttendanceRecord } from "@/services/attendance/types";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { attendanceService } from "@/services/attendanceService";

interface AttendanceTableProps {
  showTodayOnly?: boolean;
  onViewDetails: (log: AttendanceRecord) => void;
}

const AttendanceTable = ({ showTodayOnly = false, onViewDetails }: AttendanceTableProps) => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      if (!userProfile?.email) return;

      try {
        const logs = await attendanceService.getAttendanceLogs();
        const filteredLogs = logs.filter(log => 
          log.email?.toLowerCase() === userProfile.email.toLowerCase() ||
          log.employeeId === userProfile.employee_id
        );

        if (showTodayOnly) {
          const today = new Date().toDateString();
          const todayLogs = filteredLogs.filter(log => 
            new Date(log.date).toDateString() === today
          );
          setAttendanceLogs(todayLogs);
        } else {
          setAttendanceLogs(filteredLogs);
        }
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceLogs();
  }, [userProfile, showTodayOnly]);

  if (loading) {
    return <div>Loading attendance records...</div>;
  }

  if (attendanceLogs.length === 0) {
    return <div>No attendance records found.</div>;
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {!isMobile && <TableHead>Employee ID</TableHead>}
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendanceLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
              {!isMobile && <TableCell>{log.employeeId}</TableCell>}
              <TableCell>{log.checkIn || 'N/A'}</TableCell>
              <TableCell>{log.checkOut || 'N/A'}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(log)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default AttendanceTable;