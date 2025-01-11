import { CheckInLog } from './types';

export const getSampleData = (): CheckInLog[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      employeeId: "TT012",
      employeeName: "Karthik",
      timestamp: now.toISOString(),
      emailId: "karthikjungleemara@gmail.com",
      position: "Developer",
      punchType: "IN"
    },
    {
      employeeId: "TT012",
      employeeName: "Karthik",
      timestamp: new Date(now.setHours(now.getHours() + 9)).toISOString(),
      emailId: "karthikjungleemara@gmail.com",
      position: "Developer",
      punchType: "OUT"
    },
    {
      employeeId: "TT012",
      employeeName: "Karthik",
      timestamp: yesterday.toISOString(),
      emailId: "karthikjungleemara@gmail.com",
      position: "Developer",
      punchType: "IN"
    },
    {
      employeeId: "TT012",
      employeeName: "Karthik",
      timestamp: new Date(yesterday.setHours(yesterday.getHours() + 9)).toISOString(),
      emailId: "karthikjungleemara@gmail.com",
      position: "Developer",
      punchType: "OUT"
    }
  ];
};