import { CheckInLog, AttendanceRecord } from './types';
import { calculateHours } from './utils';

export const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  if (!logs.length) return [];

  // Group logs by employee and date
  const groupedLogs: { [key: string]: CheckInLog[] } = {};
  logs.forEach(log => {
    // Parse the timestamp to ensure we're working with valid dates
    const timestamp = new Date(log.timestamp);
    if (isNaN(timestamp.getTime())) {
      console.error('Invalid timestamp:', log.timestamp);
      return;
    }
    
    const date = timestamp.toISOString().split('T')[0];
    const key = `${log.employeeId}-${date}`;
    if (!groupedLogs[key]) {
      groupedLogs[key] = [];
    }
    groupedLogs[key].push(log);
  });

  // Process and sort logs in descending order
  return Object.entries(groupedLogs)
    .map(([key, dayLogs]) => {
      // Sort logs by timestamp for each day
      const sortedLogs = dayLogs.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const firstLog = sortedLogs[0];
      const lastLog = sortedLogs[sortedLogs.length - 1];
      
      // Get all timestamps between first and last as breaks
      const breakLogs = sortedLogs
        .slice(1, -1)
        .map(log => log.timestamp);

      // Calculate total break hours
      let totalBreakHours = 0;
      if (breakLogs.length > 0) {
        for (let i = 0; i < breakLogs.length - 1; i += 2) {
          const breakStart = new Date(breakLogs[i]);
          const breakEnd = breakLogs[i + 1] ? new Date(breakLogs[i + 1]) : new Date(lastLog.timestamp);
          totalBreakHours += (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
        }
      }

      const totalHours = calculateHours(firstLog.timestamp, lastLog.timestamp);
      const effectiveHours = Math.max(0, totalHours - totalBreakHours);

      // Ensure we're using the correct date from the timestamp
      const logDate = new Date(firstLog.timestamp);
      const formattedDate = logDate.toISOString().split('T')[0];

      return {
        employeeId: firstLog.employeeId,
        employeeName: firstLog.employeeName,
        date: formattedDate,
        checkIn: firstLog.timestamp,
        checkOut: lastLog.timestamp,
        breaks: breakLogs,
        totalBreakHours: Math.round(totalBreakHours * 100) / 100,
        effectiveHours: Math.round(effectiveHours * 100) / 100
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort in descending order
};