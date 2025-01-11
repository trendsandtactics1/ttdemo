import { CheckInLog, AttendanceRecord } from './types';
import { calculateHours } from './utils';

export const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  if (!logs.length) return [];

  // First, group logs by employee and date
  const groupedByEmployeeAndDate: { [key: string]: CheckInLog[] } = {};
  
  logs.forEach(log => {
    // Parse the timestamp to ensure we're working with valid dates
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

  // Process each group to create a single entry per employee per date
  const processedLogs = Object.entries(groupedByEmployeeAndDate).map(([key, employeeDayLogs]) => {
    // Sort logs chronologically
    const sortedLogs = employeeDayLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstLog = sortedLogs[0];
    const lastLog = sortedLogs[sortedLogs.length - 1];
    const date = new Date(firstLog.timestamp).toISOString().split('T')[0];

    // Calculate total working hours (from first check-in to last check-out)
    const totalHours = calculateHours(firstLog.timestamp, lastLog.timestamp);

    // Process intermediate punch-ins as breaks
    const breaks: string[] = [];
    let totalBreakHours = 0;

    // Skip first and last logs, process intermediate logs as breaks
    const intermediateLogs = sortedLogs.slice(1, -1);
    
    // Process breaks in pairs
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

    // Calculate effective hours (total hours - break hours)
    const effectiveHours = Math.max(0, totalHours - totalBreakHours);

    return {
      employeeId: firstLog.employeeId,
      employeeName: firstLog.employeeName,
      emailId: firstLog.emailId, // Include emailId in the processed record
      date: date,
      checkIn: firstLog.timestamp,
      checkOut: lastLog.timestamp,
      breaks: breaks,
      totalBreakHours: Math.round(totalBreakHours * 100) / 100,
      effectiveHours: Math.round(effectiveHours * 100) / 100
    };
  });

  // Sort all entries by date in descending order (newest first)
  return processedLogs.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};