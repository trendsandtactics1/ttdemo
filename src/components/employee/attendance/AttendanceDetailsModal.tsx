import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { AttendanceRecord } from "@/services/attendance/types";

interface AttendanceDetailsModalProps {
  log: AttendanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AttendanceDetailsModal = ({ log, open, onOpenChange }: AttendanceDetailsModalProps) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>
        {log && (
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Date</h4>
                  <p>{formatDate(log.date)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Employee Name</h4>
                  <p>{log.employeeName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Check In</h4>
                  <p>{formatTime(log.checkIn)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Check Out</h4>
                  <p>{formatTime(log.checkOut)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Total Break Hours</h4>
                  <p>{log.totalBreakHours.toFixed(2)} hrs</p>
                </div>
                <div>
                  <h4 className="font-semibold">Effective Hours</h4>
                  <p>{log.effectiveHours.toFixed(2)} hrs</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <div className="mt-1">
                    {getAttendanceStatus(log.effectiveHours)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Break Details</h4>
                {log.breaks.length > 0 ? (
                  <div className="space-y-2">
                    {log.breaks.reduce((acc: JSX.Element[], break1, index, array) => {
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
  );
};

export default AttendanceDetailsModal;