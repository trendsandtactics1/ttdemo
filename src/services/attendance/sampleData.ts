import { CheckInLog } from './types';

export const getSampleData = (): CheckInLog[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      employeeId: "EMP001",
      employeeName: "John Doe",
      emailId: "john.doe@example.com",
      position: "Employee",
      timestamp: today.toISOString(),
      punchType: "IN"
    },
    {
      employeeId: "EMP001",
      employeeName: "John Doe",
      emailId: "john.doe@example.com",
      position: "Employee",
      timestamp: new Date(today.setHours(17, 30)).toISOString(),
      punchType: "OUT"
    },
    {
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      emailId: "jane.smith@example.com",
      position: "Employee",
      timestamp: yesterday.toISOString(),
      punchType: "IN"
    },
    {
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      emailId: "jane.smith@example.com",
      position: "Employee",
      timestamp: new Date(yesterday.setHours(17, 15)).toISOString(),
      punchType: "OUT"
    }
  ];
};