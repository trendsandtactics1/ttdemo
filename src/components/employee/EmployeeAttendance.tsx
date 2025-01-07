import { useEffect, useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { localStorageService } from "@/services/localStorageService";
import { AttendanceRecord } from "@/services/attendance/types";
import AttendanceLoading from "./attendance/AttendanceLoading";
import AttendanceTable from "./attendance/AttendanceTable";
import AttendanceDetailsModal from "./attendance/AttendanceDetailsModal";

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
    } else {
      setLoading(false);
    }
  }, [currentUser?.employeeId]);

  const handleViewDetails = (log: AttendanceRecord) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  if (loading) {
    return <AttendanceLoading />;
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
      
      <AttendanceTable 
        attendanceLogs={attendanceLogs} 
        onViewDetails={handleViewDetails}
      />

      <AttendanceDetailsModal
        log={selectedLog}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  );
};

export default EmployeeAttendance;