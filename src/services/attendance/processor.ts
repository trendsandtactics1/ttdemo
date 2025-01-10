import { CheckInLog, AttendanceRecord } from './types';
import { calculateHours } from './utils';

const WORK_START_HOUR = 1; // 1 AM
const WORK_END_HOUR = 12; // 12 PM

const isWithinWorkingHours = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  return hour >= WORK_START_HOUR && hour <= WORK_END_HOUR;
};

const adjustTimeToWorkingHours = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (hour < WORK_START_HOUR) {
    date.setHours(WORK_START_HOUR, 0, 0, 0);
  } else if (hour > WORK_END_HOUR) {
    date.setHours(WORK_END_HOUR, 0, 0, 0);
  }

  return date.toISOString();
};

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

    // Adjust check-in and check-out times to working hours
    const adjustedCheckIn = adjustTimeToWorkingHours(firstLog.timestamp);
    const adjustedCheckOut = adjustTimeToWorkingHours(lastLog.timestamp);

    // Calculate total working hours (from first check-in to last check-out)
    const totalHours = calculateHours(adjustedCheckIn, adjustedCheckOut);

    // Process intermediate punch-ins as breaks
    const breaks: string[] = [];
    let totalBreakHours = 0;

    // Skip first and last logs, process intermediate logs as breaks
    const intermediateLogs = sortedLogs.slice(1, -1);
    
    // Process breaks in pairs
    for (let i = 0; i < intermediateLogs.length - 1; i += 2) {
      const breakStart = intermediateLogs[i];
      const breakEnd = intermediateLogs[i + 1];
      
      if (breakEnd && isWithinWorkingHours(breakStart.timestamp) && isWithinWorkingHours(breakEnd.timestamp)) {
        const adjustedBreakStart = adjustTimeToWorkingHours(breakStart.timestamp);
        const adjustedBreakEnd = adjustTimeToWorkingHours(breakEnd.timestamp);
        const breakDuration = calculateHours(adjustedBreakStart, adjustedBreakEnd);
        totalBreakHours += breakDuration;
        breaks.push(adjustedBreakStart);
        breaks.push(adjustedBreakEnd);
      }
    }

    // Calculate effective hours (total hours - break hours)
    // Ensure effective hours don't exceed the maximum possible (11 hours between 1 AM and 12 PM)
    const maxPossibleHours = WORK_END_HOUR - WORK_START_HOUR;
    const effectiveHours = Math.min(
      Math.max(0, totalHours - totalBreakHours),
      maxPossibleHours
    );

    return {
      employeeId: firstLog.employeeId,
      employeeName: firstLog.employeeName,
      date: date,
      checkIn: adjustedCheckIn,
      checkOut: adjustedCheckOut,
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