import { supabase } from "@/integrations/supabase/client";
import { CheckInLog, AttendanceRecord } from './attendance/types';
import { parseGoogleSheetJson } from './attendance/utils';
import { processAttendanceLogs } from './attendance/processor';

const fetchCheckInLogs = async () => {
  const { data: config, error: configError } = await supabase
    .from('attendance_config')
    .select('script_url, sheet_id')
    .maybeSingle();

  if (configError) {
    console.error('Error fetching attendance config:', configError);
    return [];
  }

  const scriptUrl = config?.script_url;
  const sheetId = config?.sheet_id;
  
  if (!scriptUrl && !sheetId) {
    console.log('No configuration found, returning empty array');
    return [];
  }

  try {
    if (sheetId) {
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
    } else if (scriptUrl) {
      const response = await fetch(scriptUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      const logs = await response.json();
      console.log('Fetched logs from script:', logs);
      return logs;
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return [];
  }
  
  return [];
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
  
  setScriptUrl: async (url: string) => {
    const { error } = await supabase
      .from('attendance_config')
      .upsert({ 
        id: '00000000-0000-0000-0000-000000000000',
        script_url: url, 
        sheet_id: null 
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error setting script URL:', error);
      throw error;
    }
  },

  getScriptUrl: async () => {
    const { data, error } = await supabase
      .from('attendance_config')
      .select('script_url')
      .maybeSingle();

    if (error) {
      console.error('Error getting script URL:', error);
      return null;
    }

    return data?.script_url || null;
  },

  setSheetId: async (id: string) => {
    const { error } = await supabase
      .from('attendance_config')
      .upsert({ 
        id: '00000000-0000-0000-0000-000000000000',
        sheet_id: id, 
        script_url: null 
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error setting sheet ID:', error);
      throw error;
    }
  },

  getSheetId: async () => {
    const { data, error } = await supabase
      .from('attendance_config')
      .select('sheet_id')
      .maybeSingle();

    if (error) {
      console.error('Error getting sheet ID:', error);
      return null;
    }

    return data?.sheet_id || null;
  }
};