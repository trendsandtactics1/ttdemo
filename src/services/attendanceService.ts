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

const SHEETS_API_KEY_STORAGE_KEY = 'sheets_api_key';
const SHEET_ID = ''; // User needs to provide their Sheet ID
const RANGE = 'A2:B'; // Adjust based on your sheet structure

const calculateHours = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
};

const getSampleData = (): AttendanceRecord[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      employeeId: "EMP001",
      date: today.toISOString(),
      checkIn: new Date(today.setHours(9, 0)).toISOString(),
      checkOut: new Date(today.setHours(17, 30)).toISOString(),
      breaks: [
        new Date(today.setHours(12, 0)).toISOString(),
        new Date(today.setHours(13, 0)).toISOString()
      ],
      totalBreakHours: 1,
      effectiveHours: 7.5
    },
    {
      employeeId: "EMP002",
      date: yesterday.toISOString(),
      checkIn: new Date(yesterday.setHours(8, 45)).toISOString(),
      checkOut: new Date(yesterday.setHours(17, 15)).toISOString(),
      breaks: [
        new Date(yesterday.setHours(12, 15)).toISOString(),
        new Date(yesterday.setHours(13, 15)).toISOString()
      ],
      totalBreakHours: 1,
      effectiveHours: 7.5
    }
  ];
};

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  const apiKey = localStorage.getItem(SHEETS_API_KEY_STORAGE_KEY);
  
  if (!apiKey || !SHEET_ID) {
    console.log('No API key or Sheet ID configured, returning sample data');
    return [];
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }

    const data = await response.json();
    
    return data.values?.map((row: string[]) => ({
      employeeId: row[0],
      timestamp: row[1],
    })) || [];
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return [];
  }
};

const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  if (logs.length === 0) {
    return getSampleData();
  }

  const groupedLogs: { [key: string]: CheckInLog[] } = {};
  
  // Group logs by employeeId and date
  logs.forEach(log => {
    const date = log.timestamp.split('T')[0];
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
  getAttendanceLogs: async () => {
    const logs = await fetchCheckInLogs();
    return processAttendanceLogs(logs);
  },
  
  setApiKey: (apiKey: string) => {
    localStorage.setItem(SHEETS_API_KEY_STORAGE_KEY, apiKey);
  },
  
  getApiKey: () => {
    return localStorage.getItem(SHEETS_API_KEY_STORAGE_KEY);
  },
  
  setSheetId: (sheetId: string) => {
    localStorage.setItem('sheets_id', sheetId);
  }
};