import { CheckInLog } from './types';

export const getSampleData = (): CheckInLog[] => {
  const currentDate = new Date();
  const baseTimestamp = new Date(currentDate.setHours(9, 0, 0, 0)).toISOString();

  return [
    {
      employeeId: "EMP001",
      employeeName: "John Doe",
      timestamp: baseTimestamp,
      emailId: "john.doe@example.com",
      position: "Software Engineer",
      punchType: "IN"
    },
    {
      employeeId: "EMP001",
      employeeName: "John Doe",
      timestamp: new Date(currentDate.setHours(17, 0, 0, 0)).toISOString(),
      emailId: "john.doe@example.com",
      position: "Software Engineer",
      punchType: "OUT"
    },
    {
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      timestamp: baseTimestamp,
      emailId: "jane.smith@example.com",
      position: "Product Manager",
      punchType: "IN"
    },
    {
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      timestamp: new Date(currentDate.setHours(17, 30, 0, 0)).toISOString(),
      emailId: "jane.smith@example.com",
      position: "Product Manager",
      punchType: "OUT"
    }
  ];
};