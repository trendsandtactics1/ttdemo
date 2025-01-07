import { supabase } from '@/integrations/supabase/client';
import { CheckInLog, AttendanceRecord } from './attendance/types';
import { processAttendanceLogs } from './attendance/processor';

const SCRIPT_URL_STORAGE_KEY = 'apps_script_url';
const SHEET_ID_STORAGE_KEY = 'sheet_id';

const fetchCheckInLogs = async (): Promise<CheckInLog[]> => {
  try {
    const { data: attendanceRecords, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        employee:profiles(name, employee_id, position)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }

    // Transform Supabase records to CheckInLog format
    const logs: CheckInLog[] = attendanceRecords.map(record => ({
      employeeId: record.employee.employee_id || '',
      employeeName: record.employee.name,
      emailId: '', // Not needed for display
      position: record.employee.position || '',
      punchType: record.check_out ? 'OUT' : 'IN',
      timestamp: record.check_in
    }));

    console.log('Fetched logs from Supabase:', logs);
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
      console.log('No logs found in configured source');
      return [];
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