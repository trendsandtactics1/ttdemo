import { CheckInLog, AttendanceRecord } from './types';
import { calculateHours } from './utils';

const transformCheckInLogsToAttendanceRecords = (logs: CheckInLog[]): AttendanceRecord[] => {
  // Group logs by employee and date
  const groupedLogs: { [key: string]: CheckInLog[] } = {};
  
  logs.forEach(log => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    const key = `${log.employeeId}-${date}`;
    
    if (!groupedLogs[key]) {
      groupedLogs[key] = [];
    }
    groupedLogs[key].push(log);
  });

  // Process each group into an AttendanceRecord
  return Object.entries(groupedLogs).map(([_, dayLogs]) => {
    const sortedLogs = dayLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const checkIns = sortedLogs.filter(log => log.punchType === 'IN');
    const checkOuts = sortedLogs.filter(log => log.punchType === 'OUT');

    const firstCheckIn = checkIns[0];
    const lastCheckOut = checkOuts[checkOuts.length - 1];

    if (!firstCheckIn) return null;

    const date = new Date(firstCheckIn.timestamp).toISOString().split('T')[0];
    const breaks: string[] = [];
    let totalBreakHours = 0;

    // Calculate breaks (time between subsequent check-out and check-in)
    for (let i = 0; i < checkOuts.length - 1; i++) {
      const breakStart = checkOuts[i];
      const breakEnd = checkIns[i + 1];
      
      if (breakStart && breakEnd) {
        breaks.push(breakStart.timestamp);
        breaks.push(breakEnd.timestamp);
        totalBreakHours += calculateHours(breakStart.timestamp, breakEnd.timestamp);
      }
    }

    const totalHours = lastCheckOut 
      ? calculateHours(firstCheckIn.timestamp, lastCheckOut.timestamp)
      : 0;

    const effectiveHours = Math.max(0, totalHours - totalBreakHours);

    return {
      employeeId: firstCheckIn.employeeId,
      employeeName: firstCheckIn.employeeName,
      date,
      checkIn: firstCheckIn.timestamp,
      checkOut: lastCheckOut?.timestamp || firstCheckIn.timestamp,
      breaks,
      totalBreakHours: Math.round(totalBreakHours * 100) / 100,
      effectiveHours: Math.round(effectiveHours * 100) / 100
    };
  }).filter((record): record is AttendanceRecord => record !== null);
};

export const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  if (!logs.length) return [];
  return transformCheckInLogsToAttendanceRecords(logs);
};