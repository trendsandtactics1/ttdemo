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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployeeAttendance {
  employeeId: string;
  employeeName: string;
  logs: Array<{
    date: string;
    checkIn: string;
    checkOut: string;
    breakHours: number;
    effectiveHours: number;
  }>;
}

const AttendanceTable = () => {
  const [employeeAttendance, setEmployeeAttendance] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const logs = await attendanceService.getAttendanceLogs();
      
      // Group logs by employee
      const groupedLogs = logs.reduce((acc: { [key: string]: EmployeeAttendance }, log) => {
        if (!acc[log.employeeId]) {
          acc[log.employeeId] = {
            employeeId: log.employeeId,
            employeeName: log.employeeName,
            logs: [],
          };
        }
        
        acc[log.employeeId].logs.push({
          date: log.date,
          checkIn: log.checkIn,
          checkOut: log.checkOut,
          breakHours: log.totalBreakHours,
          effectiveHours: log.effectiveHours,
        });
        
        return acc;
      }, {});

      setEmployeeAttendance(Object.values(groupedLogs));
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
      
      {employeeAttendance.map((employee) => (
        <Card key={employee.employeeId} className="mt-4">
          <CardHeader>
            <CardTitle>
              {employee.employeeName} (ID: {employee.employeeId})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Break Hours</TableHead>
                    <TableHead>Effective Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(new Date(log.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{formatTime(log.checkIn)}</TableCell>
                      <TableCell>{formatTime(log.checkOut)}</TableCell>
                      <TableCell>{log.breakHours} hrs</TableCell>
                      <TableCell>{log.effectiveHours} hrs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceTable;