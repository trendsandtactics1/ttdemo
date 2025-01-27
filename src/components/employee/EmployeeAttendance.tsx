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
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const currentUser = localStorageService.getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to view attendance records",
        variant: "destructive",
      });
      navigate("/login");
    }
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
      <Card className="p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          My Attendance
        </h2>

        <AttendanceTable
          showTodayOnly={false}
          onViewDetails={handleViewDetails}
        />

        <AttendanceDetailsModal
          log={selectedLog}
          open={showModal}
          onOpenChange={setShowModal}
        />
      </Card>
    </div>
  );
};

export default EmployeeAttendance;