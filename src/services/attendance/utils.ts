import { CheckInLog } from './types';

export const calculateHours = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
};

export const parseGoogleSheetJson = (text: string): CheckInLog[] => {
  try {
    // Remove Google's JSON API response prefix and suffix
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonString);
    
    if (!data.table || !data.table.rows) {
      console.error('Invalid Google Sheets data format');
      return [];
    }

    return data.table.rows.map((row: any) => {
      const cols = row.c || [];
      
      // Parse date and time from Google Sheets
      const dateValue = cols[0]?.v;
      const timeValue = cols[1]?.v;
      
      if (!dateValue || !timeValue) {
        console.error('Missing date or time value:', { dateValue, timeValue });
        return null;
      }

      try {
        // Convert Google Sheets date (days since Dec 30, 1899) to JavaScript date
        const date = new Date(Date.UTC(1899, 11, 30));
        date.setDate(date.getDate() + Math.floor(dateValue));
        
        // Parse time (assuming format like "03:44 AM" or "03.44 AM")
        const [timeStr, period] = timeValue.split(' ');
        let [hours, minutes] = timeStr.includes('.') 
          ? timeStr.split('.')
          : timeStr.split(':');
        
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        date.setUTCHours(hours, minutes);
        
        return {
          employeeId: cols[2]?.v?.toString() || '',
          employeeName: cols[3]?.v?.toString() || '',
          emailId: cols[4]?.v?.toString() || '',
          position: cols[5]?.v?.toString() || '',
          punchType: cols[6]?.v?.toString()?.toUpperCase().includes('OUT') ? 'OUT' : 'IN',
          timestamp: date.toISOString()
        };
      } catch (error) {
        console.error('Error parsing date/time:', error, { dateValue, timeValue });
        return null;
      }
    }).filter((log: CheckInLog | null): log is CheckInLog => 
      log !== null && Boolean(log.employeeId) && Boolean(log.timestamp)
    );
  } catch (error) {
    console.error('Error parsing Google Sheet data:', error);
    return [];
  }
};