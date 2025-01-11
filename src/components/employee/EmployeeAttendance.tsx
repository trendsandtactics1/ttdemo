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
          .maybeSingle();

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

        if (!employeeData) {
          console.log('No employee record found for email:', currentUser.email);
          toast({
            title: "No Employee Record",
            description: "Could not find your employee record. Please contact your administrator.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('Fetching attendance logs for employee:', employeeData);
        const allLogs = await attendanceService.getAttendanceLogs();
        console.log('All logs received:', allLogs.length);
        
        // Enhanced filtering logic for matching employee IDs
        const employeeLogs = allLogs.filter(log => {
          // Helper function to normalize IDs for comparison
          const normalizeId = (id: string) => {
            if (!id) return '';
            // Remove all non-alphanumeric characters and convert to lowercase
            return id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          };

          // Helper function to extract numeric part from ID
          const getNumericPart = (id: string) => {
            if (!id) return null;
            const matches = id.match(/\d+/);
            return matches ? parseInt(matches[0]) : null;
          };

          // Normalize both IDs
          const logId = normalizeId(log.employeeId);
          const employeeId = normalizeId(employeeData.employee_id);
          
          // Get numeric parts for comparison
          const logNumeric = getNumericPart(log.employeeId);
          const employeeNumeric = getNumericPart(employeeData.employee_id);

          // Also check if the email matches (some logs might have email instead of ID)
          const emailMatch = log.emailId?.toLowerCase() === employeeData.email?.toLowerCase();

          console.log('Comparing IDs:', {
            original: { log: log.employeeId, employee: employeeData.employee_id },
            normalized: { log: logId, employee: employeeId },
            numeric: { log: logNumeric, employee: employeeNumeric },
            emailMatch
          });

          // Return true if any of the matching conditions are met
          return logId === employeeId || 
                 emailMatch || 
                 (logNumeric !== null && 
                  employeeNumeric !== null && 
                  logNumeric === employeeNumeric);
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