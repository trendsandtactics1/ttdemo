export const formatHoursToHHMM = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
};

export const isWorkingHours = (date: Date): boolean => {
  const hours = date.getUTCHours();
  return hours >= 1 && hours <= 12;
};

export const getWorkingHoursForDay = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setUTCHours(1, 0, 0, 0);
  
  const end = new Date(date);
  end.setUTCHours(12, 0, 0, 0);
  
  return { start, end };
};