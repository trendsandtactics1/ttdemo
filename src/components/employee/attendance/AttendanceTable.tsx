import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { AttendanceRecord } from "@/services/attendance/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { attendanceService } from "@/services/attendanceService";
import { useToast } from "@/components/ui/use-toast";

interface AttendanceTableProps {
  showTodayOnly?: boolean;
  onViewDetails: (log: AttendanceRecord) => void;
  userEmail: string;
}

const AttendanceTable = ({ showTodayOnly = false, onViewDetails, userEmail }: AttendanceTableProps) => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logs = await attendanceService.getAttendanceLogs();
        console.log('Fetched logs:', logs);
        console.log('User email:', userEmail);
        
        const filteredLogs = logs.filter(log => 
          log.email?.toLowerCase() === userEmail?.toLowerCase()
        );
        console.log('Filtered logs:', filteredLogs);

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
        setError('Failed to load attendance records');
        toast({
          title: "Error",
          description: "Failed to load attendance records. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchAttendanceLogs();
    }
  }, [userEmail, showTodayOnly, toast]);

  if (loading) {
    return <div className="text-center py-4">Loading attendance records...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (attendanceLogs.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No attendance records found.</div>;
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