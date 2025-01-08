import { CheckInLog, AttendanceRecord } from './attendance/types';
import { parseGoogleSheetJson } from './attendance/utils';
import { getSampleData } from './attendance/sampleData';
import { processAttendanceLogs } from './attendance/processor';

const SHEET_ID_STORAGE_KEY = 'sheet_id';

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  const sheetId = localStorage.getItem(SHEET_ID_STORAGE_KEY);
  
  try {
    if (sheetId) {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch attendance data: ${response.status} ${response.statusText}`);
        const sampleData = await getSampleData();
        return sampleData.map(record => ({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          timestamp: record.checkIn,
          emailId: '',
          position: '',
          punchType: 'IN'
        }));
      }
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      const parsedLogs = parseGoogleSheetJson(text);
      if (!parsedLogs || parsedLogs.length === 0) {
        console.error('No valid logs parsed from Google Sheet');
        const sampleData = await getSampleData();
        return sampleData.map(record => ({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          timestamp: record.checkIn,
          emailId: '',
          position: '',
          punchType: 'IN'
        }));
      }
      
      console.log('Parsed logs:', parsedLogs);
      return parsedLogs;
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    console.log('Falling back to sample data');
  }
  
  const sampleData = await getSampleData();
  return sampleData.map(record => ({
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    timestamp: record.checkIn,
    emailId: '',
    position: '',
    punchType: 'IN'
  }));
};

export const attendanceService = {
  getAttendanceLogs: async (): Promise<AttendanceRecord[]> => {
    const logs = await fetchCheckInLogs();
    console.log('Total fetched logs:', logs.length);
    
    if (logs.length === 0) {
      console.log('No logs found, using sample data');
      const sampleLogs = await getSampleData();
      return processAttendanceLogs(logs);
    }
    
    const processedLogs = processAttendanceLogs(logs);
    console.log('Processed logs:', processedLogs);
    return processedLogs;
  },

  setSheetId: (id: string) => {
    localStorage.setItem(SHEET_ID_STORAGE_KEY, id);
  },

  getSheetId: () => {
    return localStorage.getItem(SHEET_ID_STORAGE_KEY);
  }
};