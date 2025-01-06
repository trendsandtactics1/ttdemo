import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  DollarSign,
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

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { title: "Attendance", path: "/admin/attendance", icon: Calendar },
    { title: "Leave Requests", path: "/admin/leave-requests", icon: ClipboardList },
    { title: "Tasks", path: "/admin/tasks", icon: ClipboardList },
    { title: "Employees", path: "/admin/employees", icon: Users },
    { title: "Payroll", path: "/admin/payroll", icon: DollarSign, disabled: true },
    { title: "Announcements", path: "/admin/announcements", icon: Bell },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-xl font-bold">HR Admin</h1>
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

export default AdminSidebar;