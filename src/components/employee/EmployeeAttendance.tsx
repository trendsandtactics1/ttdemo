import { useEffect, useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { localStorageService } from "@/services/localStorageService";
import { AttendanceRecord } from "@/services/attendance/types";
import AttendanceLoading from "./attendance/AttendanceLoading";
import AttendanceTable from "./attendance/AttendanceTable";
import AttendanceDetailsModal from "./attendance/AttendanceDetailsModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const EmployeeAttendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const currentUser = localStorageService.getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to view attendance records",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const allLogs = await attendanceService.getAttendanceLogs();
        console.log('All logs:', allLogs);
        console.log('Current user:', currentUser);
        
        // Filter logs for the current employee
        const employeeLogs = allLogs.filter(log => 
          log.employeeId === currentUser.employeeId
        ).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        console.log('Filtered logs for employee:', employeeLogs);
        setAttendanceLogs(employeeLogs);
        
        // Set the most recent log as selected by default if available
        if (employeeLogs.length > 0) {
          setSelectedLog(employeeLogs[0]);
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Set default sheet ID if none exists
    if (!attendanceService.getSheetId()) {
      attendanceService.setSheetId("1_s2NILKubSewIlRgLPXypfGw7p5BwxZtrUjRURA4NdA");
    }
    
    fetchLogs();
  }, [currentUser, navigate, toast]);

  const handleViewDetails = (log: AttendanceRecord) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <AttendanceLoading />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
      
      {attendanceLogs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-lg text-gray-600">No attendance records found.</p>
        </Card>
      ) : (
        <AttendanceTable 
          attendanceLogs={attendanceLogs} 
          onViewDetails={handleViewDetails}
        />
      )}

      <AttendanceDetailsModal
        log={selectedLog}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  );
};

export default EmployeeAttendance;