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
import { formatHoursToHHMM } from "@/utils/timeFormat";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const ManagerAttendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const logs = await attendanceService.getAttendanceLogs();
        const sortedLogs = logs.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAttendanceLogs(sortedLogs);
      } catch (error) {
        console.error("Error fetching attendance logs:", error);
      } finally {
        setLoading(false);
      }
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
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Attendance Logs</h2>
      
      <Card className="p-4">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Employee Name</TableHead>
                  <TableHead className="whitespace-nowrap">Employee ID</TableHead>
                  <TableHead className="whitespace-nowrap">Check In</TableHead>
                  <TableHead className="whitespace-nowrap">Check Out</TableHead>
                  <TableHead className="whitespace-nowrap">Break Hours</TableHead>
                  <TableHead className="whitespace-nowrap">Effective Hours</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{formatDate(log.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{log.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{log.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatTime(log.checkIn)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatTime(log.checkOut)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatHoursToHHMM(log.totalBreakHours)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatHoursToHHMM(log.effectiveHours)}</TableCell>
                      <TableCell className="whitespace-nowrap">{getAttendanceStatus(log.effectiveHours)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ManagerAttendance;