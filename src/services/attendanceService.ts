import { CheckInLog, AttendanceRecord } from './attendance/types';
import { parseGoogleSheetJson } from './attendance/utils';
import { getSampleData } from './attendance/sampleData';
import { processAttendanceLogs } from './attendance/processor';

const SCRIPT_URL_STORAGE_KEY = 'apps_script_url';
const SHEET_ID_STORAGE_KEY = 'sheet_id';

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  const scriptUrl = localStorage.getItem(SCRIPT_URL_STORAGE_KEY);
  const sheetId = localStorage.getItem(SHEET_ID_STORAGE_KEY);
  
  if (!scriptUrl && !sheetId) {
    console.log('No configuration found, using sample data');
    return getSampleData();
  }

  try {
    if (sheetId) {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch attendance data: ${response.status} ${response.statusText}`);
        return getSampleData();
      }
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      const logs = parseGoogleSheetJson(text);
      if (!logs || logs.length === 0) {
        console.error('No valid logs parsed from Google Sheet');
        return getSampleData();
      }
      
      console.log('Parsed logs:', logs);
      return logs;
    } else if (scriptUrl) {
      const response = await fetch(scriptUrl);
      if (!response.ok) {
        console.error('Failed to fetch attendance data from script');
        return getSampleData();
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Invalid data format from script');
        return getSampleData();
      }
      
      // Convert the response to CheckInLog format
      const logs: CheckInLog[] = data.map(item => ({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        timestamp: item.timestamp || new Date().toISOString(),
        emailId: item.emailId || '',
        position: item.position || '',
        punchType: item.punchType || 'IN'
      }));
      
      console.log('Fetched logs from script:', logs);
      return logs;
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    console.log('Falling back to sample data');
    return getSampleData();
  }
  
  return getSampleData();
};

export const attendanceService = {
  getAttendanceLogs: async (): Promise<AttendanceRecord[]> => {
    const logs = await fetchCheckInLogs();
    console.log('Total fetched logs:', logs.length);
    
    if (logs.length === 0) {
      console.log('No logs found, using sample data');
      const sampleLogs = await getSampleData();
      return processAttendanceLogs(sampleLogs);
    }
    
    const processedLogs = processAttendanceLogs(logs);
    console.log('Processed logs:', processedLogs);
    return processedLogs;
  },
  
  setScriptUrl: (url: string) => {
    localStorage.setItem(SCRIPT_URL_STORAGE_KEY, url);
    localStorage.removeItem(SHEET_ID_STORAGE_KEY);
  },

  getScriptUrl: () => {
    return localStorage.getItem(SCRIPT_URL_STORAGE_KEY);
  },

  setSheetId: (id: string) => {
    localStorage.setItem(SHEET_ID_STORAGE_KEY, id);
    localStorage.removeItem(SCRIPT_URL_STORAGE_KEY);
  },

  getSheetId: () => {
    return localStorage.getItem(SHEET_ID_STORAGE_KEY);
  }
};