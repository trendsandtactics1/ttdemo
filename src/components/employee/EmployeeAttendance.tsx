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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const EmployeeAttendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  const handleViewDetails = (log: AttendanceRecord) => {
    setSelectedLog(log);
    setShowModal(true);
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
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(log)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Date</h4>
                    <p>{formatDate(selectedLog.date)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Employee Name</h4>
                    <p>{selectedLog.employeeName}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Check In</h4>
                    <p>{formatTime(selectedLog.checkIn)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Check Out</h4>
                    <p>{formatTime(selectedLog.checkOut)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Total Break Hours</h4>
                    <p>{selectedLog.totalBreakHours.toFixed(2)} hrs</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Effective Hours</h4>
                    <p>{selectedLog.effectiveHours.toFixed(2)} hrs</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Status</h4>
                    <div className="mt-1">
                      {getAttendanceStatus(selectedLog.effectiveHours)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Break Details</h4>
                  {selectedLog.breaks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedLog.breaks.reduce((acc: JSX.Element[], break1, index, array) => {
                        if (index % 2 === 0) {
                          const break2 = array[index + 1];
                          if (break2) {
                            acc.push(
                              <div key={index} className="flex gap-4 text-sm">
                                <span>Start: {formatTime(break1)}</span>
                                <span>End: {formatTime(break2)}</span>
                              </div>
                            );
                          }
                        }
                        return acc;
                      }, [])}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No breaks recorded</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeAttendance;