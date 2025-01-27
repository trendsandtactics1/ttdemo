import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { AttendanceRecord } from "@/services/attendance/types";
import { formatHoursToHHMM } from "@/utils/timeFormat";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceTableProps {
  attendanceLogs: AttendanceRecord[];
  onViewDetails: (log: AttendanceRecord) => void;
}

const AttendanceTable = ({ attendanceLogs, onViewDetails }: AttendanceTableProps) => {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<AttendanceRecord[]>(attendanceLogs);

  useEffect(() => {
    const fetchEmployeeId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setEmployeeId(profile.employee_id);
        }
      }
    };

    fetchEmployeeId();
  }, []);

  useEffect(() => {
    if (employeeId) {
      const filtered = attendanceLogs.filter(log => log.employeeId === employeeId);
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(attendanceLogs);
    }
  }, [attendanceLogs, employeeId]);

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
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">Check In</TableHead>
            <TableHead className="whitespace-nowrap">Check Out</TableHead>
            <TableHead className="whitespace-nowrap">Break Hours</TableHead>
            <TableHead className="whitespace-nowrap">Effective Hours</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell className="whitespace-nowrap">{formatDate(log.date)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatTime(log.checkIn)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatTime(log.checkOut)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatHoursToHHMM(log.totalBreakHours)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatHoursToHHMM(log.effectiveHours)}</TableCell>
              <TableCell className="whitespace-nowrap">{getAttendanceStatus(log.effectiveHours)}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(log)}
                  className="whitespace-nowrap"
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;