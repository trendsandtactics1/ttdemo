import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  DollarSign,
  Bell,
  LogOut,
  UserPlus,
  Menu,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const menuItems = [
    { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { title: "Attendance", path: "/admin/attendance", icon: Calendar },
    { title: "Leave Requests", path: "/admin/leave-requests", icon: ClipboardList },
    { title: "Tasks", path: "/admin/tasks", icon: ClipboardList },
    { title: "Employees", path: "/admin/employees", icon: Users },
    { title: "User Management", path: "/admin/users", icon: UserPlus },
    { title: "Payroll", path: "/admin/payroll", icon: DollarSign, disabled: true },
    { title: "Announcements", path: "/admin/announcements", icon: Bell },
  ];

  return (
    <>
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SidebarTrigger>
        </div>
      )}
      <Sidebar className="bg-white dark:bg-gray-900 border-r">
        <SidebarContent>
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">HR Admin</h1>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-2">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      disabled={item.disabled}
                      className={`w-full flex items-center gap-3 px-4 py-2 ${
                        location.pathname === item.path ? "bg-gray-100 dark:bg-gray-800" : ""
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                      {item.disabled && <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto p-4 border-t">
            <SidebarMenuButton 
              onClick={() => navigate("/login")} 
              className="w-full flex items-center gap-3 px-4 py-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default AdminSidebar;