interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const STORAGE_KEY = 'leaveRequests';

export const leaveRequestService = {
  getAllRequests: (): LeaveRequest[] => {
    const requests = localStorage.getItem(STORAGE_KEY);
    return requests ? JSON.parse(requests) : [];
  },

  addRequest: (request: Omit<LeaveRequest, 'id' | 'employee' | 'status'>) => {
    const requests = leaveRequestService.getAllRequests();
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now(),
      employee: "John Doe", // In a real app, this would come from auth
      status: "pending"
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...requests, newRequest]));
    return newRequest;
  },

  updateRequestStatus: (id: number, status: "approved" | "rejected") => {
    const requests = leaveRequestService.getAllRequests();
    const updatedRequests = requests.map(request =>
      request.id === id ? { ...request, status } : request
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    return updatedRequests;
  },

  getEmployeeRequests: (employeeId: string) => {
    const requests = leaveRequestService.getAllRequests();
    return requests.filter(request => request.employee === employeeId);
  }
};