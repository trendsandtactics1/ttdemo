import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, ClipboardList } from "lucide-react";

const AdminHome = () => {
  // Mock data - in a real app, this would come from an API
  const stats = [
    {
      title: "Total Employees",
      value: "150",
      icon: Users,
      description: "Active employees",
    },
    {
      title: "Present Today",
      value: "132",
      icon: CheckCircle,
      description: "88% attendance",
    },
    {
      title: "Absent Today",
      value: "18",
      icon: XCircle,
      description: "12% absence rate",
    },
    {
      title: "Pending Tasks",
      value: "24",
      icon: ClipboardList,
      description: "Due this week",
    },
  ];

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
    </div>
  );
};

export default AdminHome;