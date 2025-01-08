import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Employee, localStorageService } from "@/services/localStorageService";
import { useToast } from "@/hooks/use-toast";

const EmployeeAttendance = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const employees = localStorageService.getEmployees();
    // In a real app, this would come from auth context
    const currentEmployee = employees[0];
    if (currentEmployee) {
      setEmployee(currentEmployee);
    }
  }, []);

  const handleCheckIn = () => {
    if (!employee?.employee_id) {
      toast({
        title: "Error",
        description: "Employee ID not found",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = localStorageService.getAttendance();
    const existingAttendance = attendance.find(
      (a) => a.employee_id === employee.employee_id && a.date === today
    );

    if (existingAttendance?.check_in) {
      toast({
        title: "Error",
        description: "Already checked in for today",
        variant: "destructive",
      });
      return;
    }

    const newAttendance = {
      id: crypto.randomUUID(),
      employee_id: employee.employee_id,
      date: today,
      check_in: new Date().toISOString(),
      check_out: null,
      breaks: [],
      total_break_hours: 0,
      effective_hours: 0,
    };

    localStorageService.addAttendance(newAttendance);
    toast({
      title: "Success",
      description: "Checked in successfully",
    });
  };

  const handleCheckOut = () => {
    if (!employee?.employee_id) {
      toast({
        title: "Error",
        description: "Employee ID not found",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = localStorageService.getAttendance();
    const existingAttendance = attendance.find(
      (a) => a.employee_id === employee.employee_id && a.date === today
    );

    if (!existingAttendance?.check_in) {
      toast({
        title: "Error",
        description: "No check-in record found for today",
        variant: "destructive",
      });
      return;
    }

    if (existingAttendance.check_out) {
      toast({
        title: "Error",
        description: "Already checked out for today",
        variant: "destructive",
      });
      return;
    }

    const checkInTime = new Date(existingAttendance.check_in).getTime();
    const checkOutTime = new Date().getTime();
    const totalBreakHours = existingAttendance.total_break_hours || 0;
    const effectiveHours = (checkOutTime - checkInTime) / (1000 * 60 * 60) - totalBreakHours;

    localStorageService.updateAttendance(existingAttendance.id, {
      ...existingAttendance,
      check_out: new Date().toISOString(),
      effective_hours: Number(effectiveHours.toFixed(2)),
    });

    toast({
      title: "Success",
      description: "Checked out successfully",
    });
  };

  const handleStartBreak = () => {
    if (!employee?.employee_id) {
      toast({
        title: "Error",
        description: "Employee ID not found",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = localStorageService.getAttendance();
    const existingAttendance = attendance.find(
      (a) => a.employee_id === employee.employee_id && a.date === today
    );

    if (!existingAttendance?.check_in) {
      toast({
        title: "Error",
        description: "Please check in first",
        variant: "destructive",
      });
      return;
    }

    if (existingAttendance.check_out) {
      toast({
        title: "Error",
        description: "Cannot start break after check-out",
        variant: "destructive",
      });
      return;
    }

    const lastBreak = existingAttendance.breaks?.[existingAttendance.breaks.length - 1];
    if (lastBreak && !lastBreak.includes("-")) {
      toast({
        title: "Error",
        description: "Please end your current break first",
        variant: "destructive",
      });
      return;
    }

    const updatedBreaks = [...(existingAttendance.breaks || []), new Date().toISOString()];
    localStorageService.updateAttendance(existingAttendance.id, {
      ...existingAttendance,
      breaks: updatedBreaks,
    });

    toast({
      title: "Success",
      description: "Break started",
    });
  };

  const handleEndBreak = () => {
    if (!employee?.employee_id) {
      toast({
        title: "Error",
        description: "Employee ID not found",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = localStorageService.getAttendance();
    const existingAttendance = attendance.find(
      (a) => a.employee_id === employee.employee_id && a.date === today
    );

    if (!existingAttendance?.breaks?.length) {
      toast({
        title: "Error",
        description: "No active break found",
        variant: "destructive",
      });
      return;
    }

    const lastBreak = existingAttendance.breaks[existingAttendance.breaks.length - 1];
    if (lastBreak.includes("-")) {
      toast({
        title: "Error",
        description: "No active break found",
        variant: "destructive",
      });
      return;
    }

    const updatedBreaks = [...existingAttendance.breaks];
    const startTime = new Date(lastBreak).getTime();
    const endTime = new Date().getTime();
    const breakHours = (endTime - startTime) / (1000 * 60 * 60);
    
    updatedBreaks[updatedBreaks.length - 1] = `${lastBreak}-${new Date().toISOString()}`;
    
    localStorageService.updateAttendance(existingAttendance.id, {
      ...existingAttendance,
      breaks: updatedBreaks,
      total_break_hours: (existingAttendance.total_break_hours || 0) + breakHours,
    });

    toast({
      title: "Success",
      description: "Break ended",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCheckIn}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Check Out
            </button>
            <button
              onClick={handleStartBreak}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Start Break
            </button>
            <button
              onClick={handleEndBreak}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              End Break
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;