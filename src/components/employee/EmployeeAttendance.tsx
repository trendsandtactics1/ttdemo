import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { attendanceService } from "@/services/attendanceService";
import { Badge } from "@/components/ui/badge";
import { localStorageService } from "@/services/localStorageService";

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breaks: string[];
  totalBreakHours: number;
  effectiveHours: number;
}

const EmployeeAttendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = localStorageService.getCurrentUser();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const allLogs = await attendanceService.getAttendanceLogs();
        console.log('All logs:', allLogs);
        console.log('Current user:', currentUser);
        
        // Filter logs for current employee and sort by date in descending order
        const employeeLogs = allLogs
          .filter(log => log.employeeId === currentUser?.employeeId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log('Filtered logs:', employeeLogs);
        setAttendanceLogs(employeeLogs);
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.employeeId) {
      fetchLogs();
    }
  }, [currentUser?.employeeId]);

  const formatTime = (dateTimeString: string) => {
    try {
      const date = parseISO(dateTimeString);
      return format(date, "hh:mm a");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getAttendanceStatus = (effectiveHours: number) => {
    if (effectiveHours >= 8) {
      return <Badge className="bg-green-500">Full Day</Badge>;
    } else if (effectiveHours > 0) {
      return <Badge className="bg-yellow-500">Partial Day</Badge>;
    }
    return <Badge className="bg-red-500">Absent</Badge>;
  };

  if (loading) {
    return <div>Loading attendance logs...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to view attendance.</div>;
  }

  if (attendanceLogs.length === 0) {
    return <div>No attendance records found.</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Break Hours</TableHead>
              <TableHead>Effective Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(log.date)}</TableCell>
                <TableCell>{formatTime(log.checkIn)}</TableCell>
                <TableCell>{formatTime(log.checkOut)}</TableCell>
                <TableCell>{log.totalBreakHours.toFixed(2)} hrs</TableCell>
                <TableCell>{log.effectiveHours.toFixed(2)} hrs</TableCell>
                <TableCell>{getAttendanceStatus(log.effectiveHours)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;