import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import AdminHome from "@/components/admin/AdminHome";
import LeaveRequests from "@/components/admin/LeaveRequests";
import Tasks from "@/components/admin/Tasks";
import Employees from "@/components/admin/Employees";
import Announcements from "@/components/admin/Announcements";
import LeaveRequest from "@/components/employee/LeaveRequest";
import ManagerAttendance from "@/components/manager/ManagerAttendance";

const ManagerDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ManagerSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/attendance" element={<ManagerAttendance />} />
            <Route path="/leave-requests" element={<LeaveRequests />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManagerDashboard;