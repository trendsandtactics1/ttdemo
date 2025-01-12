import { CheckInLog, AttendanceRecord } from './attendance/types';
import { parseGoogleSheetJson } from './attendance/utils';
import { processAttendanceLogs } from './attendance/processor';

const SHEET_ID = '1_s2NILKubSewIlRgLPXypfGw7p5BwxZtrUjRURA4NdA';

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
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
  }
};