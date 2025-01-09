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
      // Using public export format for Google Sheets
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}`;
      console.log('Fetching from URL:', url);
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('Failed to fetch from Google Sheet, using sample data');
          return getSampleData();
        }
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        if (!text.trim()) {
          console.log('Empty response from sheet, using sample data');
          return getSampleData();
        }
        
        try {
          // Parse CSV data
          const rows = text.split('\n').map(row => row.split(','));
          const logs: CheckInLog[] = rows.slice(1).map(row => ({
            employeeId: row[0] || '',
            employeeName: row[1] || '',
            timestamp: new Date(row[2] || '').toISOString(),
            emailId: row[3] || '',
            position: row[4] || '',
            punchType: row[5]?.toUpperCase().includes('OUT') ? 'OUT' : 'IN'
          })).filter(log => log.employeeId && log.timestamp);

          if (logs.length === 0) {
            console.log('No valid logs found in sheet, using sample data');
            return getSampleData();
          }

          console.log('Parsed logs:', logs);
          return logs;
        } catch (parseError) {
          console.error('Error parsing sheet data:', parseError);
          return getSampleData();
        }
      } catch (fetchError) {
        console.error('Error fetching sheet:', fetchError);
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