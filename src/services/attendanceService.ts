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
    console.log('Using sample data as no configuration found');
    return getSampleData();
  }

  try {
    if (sheetId) {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch from Google Sheets, falling back to sample data');
        return getSampleData();
      }
      
      const text = await response.text();
      console.log('Raw response received');
      
      const logs = parseGoogleSheetJson(text);
      if (logs.length === 0) {
        console.log('No logs found in Google Sheets, falling back to sample data');
        return getSampleData();
      }
      return logs;
    } else if (scriptUrl) {
      const response = await fetch(scriptUrl);
      if (!response.ok) {
        console.error('Failed to fetch from script URL, falling back to sample data');
        return getSampleData();
      }
      const logs = await response.json();
      return logs as CheckInLog[];
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return getSampleData();
  }
  
  return getSampleData();
};

export const attendanceService = {
  getAttendanceLogs: async (): Promise<AttendanceRecord[]> => {
    try {
      const logs = await fetchCheckInLogs();
      console.log('Total fetched logs:', logs.length);
      
      if (logs.length === 0) {
        console.log('No logs found, returning empty array');
        return [];
      }
      
      const processedLogs = processAttendanceLogs(logs);
      console.log('Processed logs:', processedLogs);
      return processedLogs;
    } catch (error) {
      console.error('Error in getAttendanceLogs:', error);
      return [];
    }
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