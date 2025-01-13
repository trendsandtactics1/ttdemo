import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, ClipboardList } from "lucide-react";
import { localStorageService } from "@/services/localStorageService";
import { leaveRequestService } from "@/services/leaveRequestService";
import AttendanceTable from "./AttendanceTable";

const AdminHome = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Employees",
      value: "9",
      icon: Users,
      description: "Active employees",
    },
    {
      title: "Present Today",
      value: "0",
      icon: CheckCircle,
      description: "Attendance rate",
    },
    {
      title: "Absent Today",
      value: "0",
      icon: XCircle,
      description: "Absence rate",
    },
    {
      title: "Pending Tasks",
      value: "0",
      icon: ClipboardList,
      description: "Due this week",
    },
  ]);

  useEffect(() => {
    const updateStats = () => {
      const employees = localStorageService.getEmployees();
      const tasks = localStorageService.getTasks();
      const leaveRequests = leaveRequestService.getAllRequests();
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const totalEmployees = employees.length;

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Count approved leave requests for today
      const approvedLeavesToday = leaveRequests.filter(request => {
        const startDate = new Date(request.startDate).toISOString().split('T')[0];
        const endDate = new Date(request.endDate).toISOString().split('T')[0];
        return (
          request.status === 'approved' &&
          today >= startDate &&
          today <= endDate
        );
      }).length;

      // Calculate present and absent counts
      const absentToday = approvedLeavesToday;
      const presentToday = totalEmployees - absentToday;
      
      setStats([
        {
          title: "Total Employees",
          value: 9,
          icon: Users,
          description: "Active employees",
        },
        {
          title: "Present Today",
          value: 8,
          icon: CheckCircle,
          description: `${Math.round((presentToday/totalEmployees || 0) * 100)}% attendance`,
        },
        {
          title: "1",
          value: absentToday.toString(),
          icon: XCircle,
          description: `${Math.round((absentToday/totalEmployees || 0) * 100)}% absence rate`,
        },
        {
          title: "Pending Tasks",
          value: pendingTasks.toString(),
          icon: ClipboardList,
          description: "Due this week",
        },
      ]);
    };

    updateStats();
    window.addEventListener('employees-updated', updateStats);
    window.addEventListener('tasks-updated', updateStats);
    window.addEventListener('leave-requests-updated', updateStats);
    
    return () => {
      window.removeEventListener('employees-updated', updateStats);
      window.removeEventListener('tasks-updated', updateStats);
      window.removeEventListener('leave-requests-updated', updateStats);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-bold tracking-tight">Today's Attendance</h3>
        <AttendanceTable showTodayOnly={true} />
      </div>
    </div>
  );
};

export default AdminHome;
