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
      // Using JSONP format to avoid CORS issues
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': '*/*',
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch from Google Sheet, using sample data');
        return getSampleData();
      }
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      try {
        const logs = parseGoogleSheetJson(text);
        console.log('Parsed logs:', logs);
        
        if (!logs || logs.length === 0) {
          console.log('No logs found in sheet, using sample data');
          return getSampleData();
        }
        
        return logs;
      } catch (parseError) {
        console.error('Error parsing sheet data:', parseError);
        return getSampleData();
      }
    } else if (scriptUrl) {
      try {
        const response = await fetch(scriptUrl);
        if (!response.ok) {
          console.error('Failed to fetch from Apps Script, using sample data');
          return getSampleData();
        }
        const logs = await response.json();
        console.log('Fetched logs from script:', logs);
        return logs;
      } catch (error) {
        console.error('Error fetching from Apps Script:', error);
        return getSampleData();
      }
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    console.log('Using sample data due to error');
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
        console.log('No logs found, using sample data');
        return processAttendanceLogs(getSampleData());
      }
      
      const processedLogs = processAttendanceLogs(logs);
      console.log('Processed logs:', processedLogs);
      return processedLogs;
    } catch (error) {
      console.error('Error in getAttendanceLogs:', error);
      return processAttendanceLogs(getSampleData());
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