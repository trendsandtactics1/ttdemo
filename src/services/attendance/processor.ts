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

      // First log is check-in, last log is check-out
      const firstLog = sortedLogs[0];
      const lastLog = sortedLogs[sortedLogs.length - 1];

      // Calculate breaks and total break hours
      let totalBreakHours = 0;
      const breaks: string[] = [];
      
      // Process all logs between first and last as breaks
      for (let i = 1; i < sortedLogs.length - 1; i++) {
        const currentLog = sortedLogs[i];
        breaks.push(currentLog.timestamp);
        
        // If we have a pair of break logs (in/out)
        if (i < sortedLogs.length - 2 && i % 2 === 1) {
          const breakStart = new Date(currentLog.timestamp);
          const breakEnd = new Date(sortedLogs[i + 1].timestamp);
          const breakDuration = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
          totalBreakHours += breakDuration;
        }
      }

      // Calculate total and effective hours
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
        breaks: breaks,
        totalBreakHours: Math.round(totalBreakHours * 100) / 100,
        effectiveHours: Math.round(effectiveHours * 100) / 100
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort in descending order
};