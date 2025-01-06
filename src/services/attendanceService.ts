interface CheckInLog {
  employeeId: string;
  timestamp: string;
}

interface AttendanceRecord {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breaks: string[];
  totalBreakHours: number;
  effectiveHours: number;
}

// Mock data - replace with Google Sheets API call later
const mockCheckInLogs: CheckInLog[] = [
  { employeeId: "1", timestamp: "2024-03-20 09:00:00" },
  { employeeId: "1", timestamp: "2024-03-20 11:30:00" },
  { employeeId: "1", timestamp: "2024-03-20 12:30:00" },
  { employeeId: "1", timestamp: "2024-03-20 17:00:00" },
];

const calculateHours = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
};

const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  const groupedLogs: { [key: string]: CheckInLog[] } = {};
  
  // Group logs by employeeId and date
  logs.forEach(log => {
    const date = log.timestamp.split(' ')[0];
    const key = `${log.employeeId}-${date}`;
    if (!groupedLogs[key]) {
      groupedLogs[key] = [];
    }
    groupedLogs[key].push(log);
  });

  return Object.entries(groupedLogs).map(([key, logs]) => {
    const [employeeId, date] = key.split('-');
    const sortedLogs = logs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const checkIn = sortedLogs[0].timestamp;
    const checkOut = sortedLogs[sortedLogs.length - 1].timestamp;
    const breaks = sortedLogs.slice(1, -1).map(log => log.timestamp);
    
    let totalBreakHours = 0;
    for (let i = 1; i < sortedLogs.length - 1; i += 2) {
      totalBreakHours += calculateHours(sortedLogs[i].timestamp, sortedLogs[i + 1]?.timestamp || checkOut);
    }

    const totalHours = calculateHours(checkIn, checkOut);
    const effectiveHours = totalHours - totalBreakHours;

    return {
      employeeId,
      date,
      checkIn,
      checkOut,
      breaks,
      totalBreakHours: Math.round(totalBreakHours * 100) / 100,
      effectiveHours: Math.round(effectiveHours * 100) / 100
    };
  });
};

export const attendanceService = {
  getAttendanceLogs: () => {
    // Mock implementation - replace with actual Google Sheets API call
    return processAttendanceLogs(mockCheckInLogs);
  }
};