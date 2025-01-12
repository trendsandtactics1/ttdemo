import { CheckInLog, AttendanceRecord } from './attendance/types';
import { parseGoogleSheetJson } from './attendance/utils';
import { processAttendanceLogs } from './attendance/processor';

// Constants for local storage keys
const SCRIPT_URL_KEY = 'attendance_script_url';
const SHEET_ID_KEY = 'attendance_sheet_id';
const DEFAULT_SHEET_ID = '1_s2NILKubSewIlRgLPXypfGw7p5BwxZtrUjRURA4NdA';

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  try {
    const sheetId = attendanceService.getSheetId();
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch attendance data: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    const logs = parseGoogleSheetJson(text);
    console.log('Parsed logs:', logs);
    return logs;
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return [];
  }
};

export const attendanceService = {
  getAttendanceLogs: async () => {
    const logs = await fetchCheckInLogs();
    console.log('Total fetched logs:', logs.length);
    
    if (logs.length === 0) {
      console.log('No logs found');
      return [];
    }
    
    const processedLogs = processAttendanceLogs(logs);
    console.log('Processed logs:', processedLogs);
    return processedLogs;
  },

  // Add methods for managing script URL
  getScriptUrl: () => {
    return localStorage.getItem(SCRIPT_URL_KEY) || '';
  },

  setScriptUrl: (url: string) => {
    localStorage.setItem(SCRIPT_URL_KEY, url);
  },

  // Add methods for managing sheet ID
  getSheetId: () => {
    return localStorage.getItem(SHEET_ID_KEY) || DEFAULT_SHEET_ID;
  },

  setSheetId: (id: string) => {
    localStorage.setItem(SHEET_ID_KEY, id);
  }
};