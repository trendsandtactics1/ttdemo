import { CheckInLog } from './types';

export const calculateHours = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
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
      
      // Parse date from Google Sheets format
      const dateObj = cols[0]?.v;
      const timeStr = cols[1]?.v || '';
      
      // Extract the date components from the "Date(year,month,day)" string
      const dateMatch = dateObj?.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (!dateMatch) {
        console.error('Invalid date format:', dateObj);
        return null;
      }
      
      const [_, year, month, day] = dateMatch;
      
      // Parse time (assuming format like "03.44 AM")
      const [hours, minutes] = timeStr.split(' ')[0].split('.').map(Number);
      const isPM = timeStr.includes('PM');
      
      // Create date object
      const date = new Date(
        Number(year),
        Number(month),
        Number(day),
        isPM ? hours + 12 : hours,
        minutes
      );

      return {
        employeeId: cols[2]?.v?.toString() || '',
        employeeName: cols[3]?.v?.toString() || '',
        emailId: cols[4]?.v?.toString() || '',
        position: cols[5]?.v?.toString() || '',
        punchType: cols[6]?.v?.toString()?.toUpperCase() === 'OUT' ? 'OUT' : 'IN',
        timestamp: date.toISOString()
      };
    }).filter((log: CheckInLog | null): log is CheckInLog => 
      log !== null && Boolean(log.employeeId) && Boolean(log.timestamp)
    );
  } catch (error) {
    console.error('Error parsing Google Sheet data:', error);
    return [];
  }
};