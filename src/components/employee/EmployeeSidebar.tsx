import { useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
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

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Attendance", path: "/employee/attendance", icon: Calendar, disabled: true },
    { title: "Tasks", path: "/employee", icon: ClipboardList },
    { title: "Leave Request", path: "/employee/leave-request", icon: ClipboardList },
    { title: "Announcements", path: "/employee/announcements", icon: Bell },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-xl font-bold">Employee Portal</h1>
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

export default EmployeeSidebar;