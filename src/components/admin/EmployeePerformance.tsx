import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { attendanceService } from "@/services/attendanceService";
import { AttendanceRecord } from "@/services/attendance/types";
import { Task, User } from "@/types/user";
import AttendanceTable from "./AttendanceTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const EmployeePerformance = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
        }

        // Fetch employee tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', employeeId)
          .order('created_at', { ascending: false });

        if (tasksData) {
          setTasks(tasksData);
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
  }, [employeeId]);

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

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="tasks">Task Status</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTable showTodayOnly={false} userEmail={employee.email || ''} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Overview</CardTitle>
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
                    <p className="text-center text-muted-foreground">No tasks assigned</p>
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