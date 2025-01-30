import { CheckInLog, AttendanceRecord } from './types';
import { calculateHours } from './utils';

export const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  if (!logs.length) return [];

  // First, group logs by employee and date
  const groupedByEmployeeAndDate: { [key: string]: CheckInLog[] } = {};
  
  logs.forEach(log => {
    const timestamp = new Date(log.timestamp);
    if (isNaN(timestamp.getTime())) {
      console.error('Invalid timestamp:', log.timestamp);
      return;
    }
    
    const date = timestamp.toISOString().split('T')[0];
    const key = `${log.employeeId}-${date}`;
    
    if (!groupedByEmployeeAndDate[key]) {
      groupedByEmployeeAndDate[key] = [];
    }
    groupedByEmployeeAndDate[key].push(log);
  });

  // Process each group to create attendance records with task status
  const processedLogs = Object.entries(groupedByEmployeeAndDate).map(([key, employeeDayLogs]) => {
    const sortedLogs = employeeDayLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstLog = sortedLogs[0];
    const lastLog = sortedLogs[sortedLogs.length - 1];
    const date = new Date(firstLog.timestamp).toISOString().split('T')[0];

    // Calculate total working hours
    const totalHours = calculateHours(firstLog.timestamp, lastLog.timestamp);

    // Process breaks
    const breaks: string[] = [];
    let totalBreakHours = 0;

    const intermediateLogs = sortedLogs.slice(1, -1);
    for (let i = 0; i < intermediateLogs.length - 1; i += 2) {
      const breakStart = intermediateLogs[i];
      const breakEnd = intermediateLogs[i + 1];
      
      if (breakEnd) {
        const breakDuration = calculateHours(breakStart.timestamp, breakEnd.timestamp);
        totalBreakHours += breakDuration;
        breaks.push(breakStart.timestamp);
        breaks.push(breakEnd.timestamp);
      }
    }

    // Calculate effective hours
    const effectiveHours = Math.max(0, totalHours - totalBreakHours);

    // Determine status
    let status = 'Absent';
    if (effectiveHours >= 8) {
      status = 'Present';
    } else if (effectiveHours > 0) {
      status = 'Half Day';
    }

    return {
      employeeId: firstLog.employeeId,
      employeeName: firstLog.employeeName,
      email: firstLog.emailId,
      date: date,
      checkIn: firstLog.timestamp,
      checkOut: lastLog.timestamp,
      breaks: breaks,
      totalBreakHours: Math.round(totalBreakHours * 100) / 100,
      effectiveHours: Math.round(effectiveHours * 100) / 100,
      status: status,
      position: firstLog.position // Added position field
    };
  });

  // Sort by date (newest first)
  return processedLogs.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};