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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { attendanceService } from "@/services/attendanceService";

interface AttendanceTableProps {
  showTodayOnly?: boolean;
  onViewDetails: (log: AttendanceRecord) => void;
}

const AttendanceTable = ({ showTodayOnly = false, onViewDetails }: AttendanceTableProps) => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      try {
        const logs = await attendanceService.getAttendanceLogs();
        
        // Filter logs by employee ID
        let filteredLogs = logs.filter(log => 
          log.employeeId === userProfile.employee_id
        );
        
        if (showTodayOnly) {
          const today = new Date().toISOString().split('T')[0];
          filteredLogs = filteredLogs.filter(log => log.date === today);
        }
        
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
  }, [showTodayOnly, userProfile]);

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
          {attendanceLogs.map((log, index) => (
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