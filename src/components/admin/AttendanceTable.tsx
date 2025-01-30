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
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface AttendanceTableProps {
  showTodayOnly?: boolean;
}

const AttendanceTable = ({ showTodayOnly = false }: AttendanceTableProps) => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const logs = await attendanceService.getAttendanceLogs();
        
        // Filter logs if showTodayOnly is true
        let filteredLogs = logs;
        if (showTodayOnly) {
          const today = new Date().toISOString().split('T')[0];
          filteredLogs = logs.filter(log => log.date === today);
        }
        
        // Filter by selected employee
        if (selectedEmployee !== "all") {
          filteredLogs = filteredLogs.filter(log => log.employeeId === selectedEmployee);
        }
        
        // Sort logs by date in descending order
        const sortedLogs = filteredLogs.sort((a, b) => 
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
  }, [showTodayOnly, selectedEmployee]);

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

  const getUniqueEmployees = () => {
    const employees = new Set(attendanceLogs.map(log => log.employeeId));
    return Array.from(employees);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const MobileAttendanceCard = ({ log }: { log: AttendanceRecord }) => (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{formatDate(log.date)}</span>
          {getAttendanceStatus(log.effectiveHours)}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p>{log.employeeName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ID</p>
            <p>{log.employeeId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check In</p>
            <p>{formatTime(log.checkIn)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check Out</p>
            <p>{formatTime(log.checkOut)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Break Hours</p>
            <p>{formatHoursToHHMM(log.totalBreakHours)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Effective Hours</p>
            <p>{formatHoursToHHMM(log.effectiveHours)}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {!showTodayOnly && (
        <div className="mb-4">
          <Select
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {getUniqueEmployees().map((employeeId) => {
                const employee = attendanceLogs.find(log => log.employeeId === employeeId);
                return (
                  <SelectItem key={employeeId} value={employeeId}>
                    {employee?.employeeName || employeeId}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      <Card className="p-4">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {isMobile ? (
            <div className="space-y-4">
              {attendanceLogs.length === 0 ? (
                <p className="text-center py-4">No attendance records found</p>
              ) : (
                attendanceLogs.map((log, index) => (
                  <MobileAttendanceCard key={index} log={log} />
                ))
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
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
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AttendanceTable;