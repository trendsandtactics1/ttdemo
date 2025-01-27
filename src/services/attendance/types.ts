export interface CheckInLog {
  employeeId: string;
  timestamp: string;
  employeeName: string;
  emailId: string;
  position: string;
  punchType: 'IN' | 'OUT';
}

export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  email: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breaks: string[];
  totalBreakHours: number;
  effectiveHours: number;
  status: string;
}

export interface SheetRow {
  Date: string;
  Time: string;
  Employee_ID: string;
  Empolyee_Name: string;
  Employee_Email_ID: string;
  Position: string;
  Punch_In_or_Out: string;
}