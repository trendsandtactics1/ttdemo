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

const AttendanceTable = () => {
  const attendanceLogs = attendanceService.getAttendanceLogs();

  const formatTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), "hh:mm a");
  };

  return (
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
  );
};

export default AttendanceTable;