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

    // Process breaks and calculate total break hours
    let totalBreakHours = 0;
    const breaks: string[] = [];
    let lastCheckIn: Date | null = null;

    // Process all logs to identify breaks
    sortedLogs.forEach((log) => {
      const currentTime = new Date(log.timestamp);
      
      if (log.punchType === 'OUT' && lastCheckIn) {
        // Calculate break duration when there's a check-out after a check-in
        const breakDuration = (currentTime.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
        if (breakDuration > 0) {
          totalBreakHours += breakDuration;
          breaks.push(lastCheckIn.toISOString());
          breaks.push(currentTime.toISOString());
        }
        lastCheckIn = null;
      } else if (log.punchType === 'IN') {
        lastCheckIn = currentTime;
      }
    });

    // Calculate effective hours (total hours - break hours)
    const effectiveHours = Math.max(0, totalHours - totalBreakHours);

    // Create single attendance record for this employee and date
    return {
      employeeId: firstLog.employeeId,
      employeeName: firstLog.employeeName,
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