import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AttendanceRecord } from "@/services/attendance/types";
import { Badge } from "@/components/ui/badge";
import { formatHoursToHHMM } from "@/utils/timeFormat";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface AttendanceTableProps {
  logs: AttendanceRecord[];
  onViewDetails?: (log: AttendanceRecord) => void;
  userEmail?: string;
}

const AttendanceTable = ({ logs, onViewDetails, userEmail }: AttendanceTableProps) => {
  const isMobile = useIsMobile();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-500">Present</Badge>;
      case 'Half Day':
        return <Badge className="bg-yellow-500">Half Day</Badge>;
      default:
        return <Badge className="bg-red-500">Absent</Badge>;
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(time), "hh:mm a");
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const MobileAttendanceCard = ({ log }: { log: AttendanceRecord }) => (
    <Card className="p-4 mb-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewDetails?.(log)}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">{formatDate(log.date)}</span>
          {getStatusBadge(log.status)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Check In</p>
            <p className="font-medium">{formatTime(log.checkIn)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check Out</p>
            <p className="font-medium">{formatTime(log.checkOut)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Break Hours</p>
            <p className="font-medium">{formatHoursToHHMM(log.totalBreakHours)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Work Hours</p>
            <p className="font-medium">{formatHoursToHHMM(log.effectiveHours)}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  if (!logs.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No attendance records found</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {isMobile ? (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <MobileAttendanceCard key={index} log={log} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Check In</TableHead>
                  <TableHead className="font-semibold">Check Out</TableHead>
                  <TableHead className="font-semibold">Break Hours</TableHead>
                  <TableHead className="font-semibold">Work Hours</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onViewDetails?.(log)}
                  >
                    <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
                    <TableCell>{formatTime(log.checkIn)}</TableCell>
                    <TableCell>{formatTime(log.checkOut)}</TableCell>
                    <TableCell>{formatHoursToHHMM(log.totalBreakHours)}</TableCell>
                    <TableCell>{formatHoursToHHMM(log.effectiveHours)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default AttendanceTable;