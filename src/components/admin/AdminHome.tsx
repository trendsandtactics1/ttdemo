import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AttendanceTable from "./AttendanceTable";

const AdminHome = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Employees",
      value: "0",
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
    const fetchStats = async () => {
      try {
        // Get total employees
        const { data: employees } = await supabase
          .from('profiles')
          .select('id');
        
        const totalEmployees = employees?.length || 0;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Get attendance records for today
        const { data: attendanceRecords } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('date', today);

        const presentToday = attendanceRecords?.length || 0;
        const absentToday = totalEmployees - presentToday;

        // Get pending tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('status', 'pending');

        const pendingTasks = tasks?.length || 0;

        setStats([
          {
            title: "Total Employees",
            value: totalEmployees.toString(),
            icon: Users,
            description: "Active employees",
          },
          {
            title: "Present Today",
            value: presentToday.toString(),
            icon: CheckCircle,
            description: `${Math.round((presentToday/totalEmployees || 0) * 100)}% attendance`,
          },
          {
            title: "Absent Today",
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
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        <h3 className="text-2xl font-bold tracking-tight">Attendance Logs</h3>
        <AttendanceTable />
      </div>
    </div>
  );
};

export default AdminHome;