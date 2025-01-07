import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  Bell,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  path: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}

const ManagerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { title: "Dashboard", path: "/manager", icon: LayoutDashboard },
    { title: "Attendance", path: "/manager/attendance", icon: Calendar },
    { title: "Leave Requests", path: "/manager/leave-requests", icon: ClipboardList },
    { title: "Tasks", path: "/manager/tasks", icon: ClipboardList },
    { title: "Employees", path: "/manager/employees", icon: Users },
    { title: "Announcements", path: "/manager/announcements", icon: Bell },
    { title: "My Leave Request", path: "/manager/leave-request", icon: ClipboardList },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-xl font-bold">Manager Portal</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    disabled={item.disabled}
                    className={location.pathname === item.path ? "bg-secondary" : ""}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.disabled && <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <SidebarMenuButton onClick={() => navigate("/login")} className="w-full">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default ManagerSidebar;