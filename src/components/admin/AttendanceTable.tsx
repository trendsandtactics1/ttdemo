import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { attendanceService } from "@/services/attendanceService";
import { useEffect, useState } from "react";
import AttendanceConfig from "./AttendanceConfig";

const AttendanceTable = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
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
    return format(new Date(dateTimeString), "hh:mm a");
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
              <TableHead>Employee ID</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Break Hours</TableHead>
              <TableHead>Effective Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(log.date), "MMM dd, yyyy")}</TableCell>
                <TableCell>{log.employeeId}</TableCell>
                <TableCell>{formatTime(log.checkIn)}</TableCell>
                <TableCell>{formatTime(log.checkOut)}</TableCell>
                <TableCell>{log.totalBreakHours} hrs</TableCell>
                <TableCell>{log.effectiveHours} hrs</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendanceTable;