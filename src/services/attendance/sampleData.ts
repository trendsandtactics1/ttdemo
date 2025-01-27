import { AttendanceRecord } from './types';

export const getSampleData = (): AttendanceRecord[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      employeeId: "EMP001",
      employeeName: "John Doe",
      email: "john.doe@example.com",
      date: today.toISOString(),
      checkIn: new Date(today.setHours(9, 0)).toISOString(),
      checkOut: new Date(today.setHours(17, 30)).toISOString(),
      breaks: [
        new Date(today.setHours(12, 0)).toISOString(),
        new Date(today.setHours(13, 0)).toISOString()
      ],
      totalBreakHours: 1,
      effectiveHours: 7.5,
      status: "Present"
    },
    {
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      email: "jane.smith@example.com",
      date: yesterday.toISOString(),
      checkIn: new Date(yesterday.setHours(8, 45)).toISOString(),
      checkOut: new Date(yesterday.setHours(17, 15)).toISOString(),
      breaks: [
        new Date(yesterday.setHours(12, 15)).toISOString(),
        new Date(yesterday.setHours(13, 15)).toISOString()
      ],
      totalBreakHours: 1,
      effectiveHours: 7.5,
      status: "Present"
    }
  ];
};