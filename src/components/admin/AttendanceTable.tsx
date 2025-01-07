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
import { useEffect, useState } from "react";
import AttendanceConfig from "./AttendanceConfig";
import { Badge } from "@/components/ui/badge";

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

const AttendanceTable = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const logs = await attendanceService.getAttendanceLogs();
      setAttendanceLogs(logs);
      setLoading(false);
    };

    fetchLogs();
  }, []);

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

  return (
    <div className="space-y-6">
      <AttendanceConfig />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Employee ID</TableHead>
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
                <TableCell>{log.employeeName}</TableCell>
                <TableCell>{log.employeeId}</TableCell>
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

export default AttendanceTable;