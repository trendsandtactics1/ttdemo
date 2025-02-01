import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { attendanceService } from "@/services/attendanceService";
import { Task, User } from "@/types/user";
import AttendanceTable from "./AttendanceTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/employee/dashboard/StatCard";
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EmployeePerformance = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [analytics, setAnalytics] = useState({
    presentDays: 0,
    absentDays: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      options.push({ value, label });
    }
    return options;
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Fetch employee profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', employeeId)
          .single();

        if (profileData) {
          setEmployee(profileData);

          // Parse selected month
          const [year, month] = selectedMonth.split('-');
          const selectedDate = new Date(parseInt(year), parseInt(month) - 1);
          const startDate = startOfMonth(selectedDate);
          const endDate = endOfMonth(selectedDate);

          // Fetch attendance logs
          const logs = await attendanceService.getAttendanceLogs();
          const monthLogs = logs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startDate && logDate <= endDate && 
                   log.email?.toLowerCase() === profileData.email?.toLowerCase();
          });

          // Calculate attendance analytics
          const presentDays = monthLogs.filter(log => log.effectiveHours >= 8).length;
          const absentDays = monthLogs.filter(log => log.effectiveHours === 0).length;

          // Fetch month's tasks
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', employeeId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

          if (tasksData) {
            setTasks(tasksData);
            // Calculate task analytics
            const completedTasks = tasksData.filter(task => task.status === 'completed').length;
            const pendingTasks = tasksData.filter(task => task.status !== 'completed').length;

            setAnalytics({
              presentDays,
              absentDays,
              completedTasks,
              pendingTasks
            });
          }
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId, selectedMonth]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Employee Performance</h2>
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {employee.profile_photo && (
              <img
                src={employee.profile_photo}
                alt={employee.name || ''}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <div>
              <CardTitle>{employee.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{employee.designation}</p>
              <p className="text-sm text-muted-foreground">Employee ID: {employee.employee_id}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Present Days"
          value={analytics.presentDays}
          icon={CheckCircle2}
        />
        <StatCard
          title="Absent Days"
          value={analytics.absentDays}
          icon={XCircle}
        />
        <StatCard
          title="Completed Tasks"
          value={analytics.completedTasks}
          icon={CalendarDays}
        />
        <StatCard
          title="Pending Tasks"
          value={analytics.pendingTasks}
          icon={Clock}
        />
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="tasks">Task Status</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records - {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceTable 
                showTodayOnly={false} 
                userEmail={employee.email || ''} 
                selectedMonth={selectedMonth}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Overview - {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.due_date || '').toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          task.status === 'completed'
                            ? 'bg-green-500'
                            : task.status === 'in-progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-center text-muted-foreground">No tasks assigned for this month</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeePerformance;