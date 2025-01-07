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

const SCRIPT_URL_STORAGE_KEY = 'apps_script_url';
const SHEET_ID_STORAGE_KEY = 'sheet_id';

const calculateHours = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
};

const parseGoogleSheetJson = (text: string): CheckInLog[] => {
  try {
    // Remove Google's JSON API response prefix and suffix
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonString);
    
    if (!data.table || !data.table.rows) {
      console.error('Invalid Google Sheets data format');
      return [];
    }

    return data.table.rows.map((row: any) => {
      // Get the employee ID from the first column
      const employeeId = row.c[0]?.v?.toString() || '';
      
      // Get the timestamp from the second column
      const dateValue = row.c[1]?.v;
      let timestamp;
      
      try {
        if (typeof dateValue === 'number') {
          // Convert Excel/Sheets date number to JavaScript date
          // Excel dates are number of days since December 30, 1899
          const date = new Date((dateValue - 25569) * 86400 * 1000);
          timestamp = date.toISOString();
        } else if (typeof dateValue === 'string') {
          // If it's already a string, try to parse it
          const date = new Date(dateValue);
          timestamp = date.toISOString();
        } else {
          console.error('Invalid date format:', dateValue);
          return null;
        }
      } catch (error) {
        console.error('Error parsing date:', dateValue, error);
        return null;
      }

      return {
        employeeId,
        timestamp
      };
    }).filter((log: CheckInLog | null): log is CheckInLog => 
      log !== null && Boolean(log.employeeId) && Boolean(log.timestamp)
    );
  } catch (error) {
    console.error('Error parsing Google Sheet data:', error);
    return [];
  }
};

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  const scriptUrl = localStorage.getItem(SCRIPT_URL_STORAGE_KEY);
  const sheetId = localStorage.getItem(SHEET_ID_STORAGE_KEY);
  
  if (!scriptUrl && !sheetId) {
    console.log('No configuration found, returning sample data');
    return [];
  }

  try {
    if (sheetId) {
      // Direct Google Sheets approach
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance data: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      return parseGoogleSheetJson(text);
    } else if (scriptUrl) {
      const response = await fetch(scriptUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return [];
  }
  
  return [];
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

const processAttendanceLogs = (logs: CheckInLog[]): AttendanceRecord[] => {
  if (logs.length === 0) {
    return getSampleData();
  }

  // Group logs by employeeId and date
  const groupedLogs: { [key: string]: CheckInLog[] } = {};
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
    console.log('Fetched logs:', logs);
    const processedLogs = processAttendanceLogs(logs);
    console.log('Processed logs:', processedLogs);
    return processedLogs;
  },
  
  setScriptUrl: (url: string) => {
    localStorage.setItem(SCRIPT_URL_STORAGE_KEY, url);
    localStorage.removeItem(SHEET_ID_STORAGE_KEY); // Clear sheet ID when using script URL
  },
  
  getScriptUrl: () => {
    return localStorage.getItem(SCRIPT_URL_STORAGE_KEY);
  },

  setSheetId: (id: string) => {
    localStorage.setItem(SHEET_ID_STORAGE_KEY, id);
    localStorage.removeItem(SCRIPT_URL_STORAGE_KEY); // Clear script URL when using sheet ID
  },

  getSheetId: () => {
    return localStorage.getItem(SHEET_ID_STORAGE_KEY);
  }
};