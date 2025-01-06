import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import Tasks from "@/components/employee/Tasks";
import LeaveRequest from "@/components/employee/LeaveRequest";
import ViewAnnouncements from "@/components/employee/ViewAnnouncements";
import EmployeeProfile from "@/components/employee/EmployeeProfile";
import TaskChat from "@/components/employee/TaskChat";

const EmployeeDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <EmployeeSidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Tasks />} />
            <Route path="/profile" element={<EmployeeProfile />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
            <Route path="/announcements" element={<ViewAnnouncements />} />
            <Route path="/tasks/:taskId/chat" element={<TaskChat />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeDashboard;