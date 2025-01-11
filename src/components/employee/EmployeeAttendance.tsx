import { useEffect, useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { localStorageService } from "@/services/localStorageService";
import { AttendanceRecord } from "@/services/attendance/types";
import AttendanceLoading from "./attendance/AttendanceLoading";
import AttendanceTable from "./attendance/AttendanceTable";
import AttendanceDetailsModal from "./attendance/AttendanceDetailsModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
        
        // First, get the employee details from Supabase
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', currentUser.email)
          .single();

        if (employeeError) {
          console.error('Error fetching employee data:', employeeError);
          toast({
            title: "Error",
            description: "Failed to fetch employee details",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Fetching attendance logs for employee:', employeeData);
        const allLogs = await attendanceService.getAttendanceLogs();
        console.log('All logs received:', allLogs.length);
        
        // Filter logs for the current employee with improved matching
        const employeeLogs = allLogs.filter(log => {
          // Normalize both IDs by removing non-alphanumeric characters and converting to lowercase
          const normalizeId = (id: string) => id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          
          const normalizedLogId = normalizeId(log.employeeId);
          const normalizedEmployeeId = normalizeId(employeeData.employee_id);
          
          // Extract numeric parts for additional comparison
          const getNumericPart = (id: string) => {
            const matches = id?.match(/\d+/);
            return matches ? parseInt(matches[0]) : null;
          };
          
          const logIdNumber = getNumericPart(log.employeeId);
          const employeeIdNumber = getNumericPart(employeeData.employee_id);
          
          console.log('Comparing IDs:', {
            original: { log: log.employeeId, employee: employeeData.employee_id },
            normalized: { log: normalizedLogId, employee: normalizedEmployeeId },
            numeric: { log: logIdNumber, employee: employeeIdNumber }
          });
          
          // Match if either the normalized strings match or the numeric parts match
          return normalizedLogId === normalizedEmployeeId || 
                 (logIdNumber !== null && employeeIdNumber !== null && logIdNumber === employeeIdNumber);
        });
        
        console.log('Filtered logs for employee:', employeeLogs.length);
        
        // Sort logs by date in descending order
        const sortedLogs = employeeLogs.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setAttendanceLogs(sortedLogs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance records. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentUser, navigate, toast]);

  const handleViewDetails = (log: AttendanceRecord) => {
    console.log('Viewing details for log:', log);
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
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <p className="text-lg text-gray-600">No attendance records found.</p>
        </div>
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