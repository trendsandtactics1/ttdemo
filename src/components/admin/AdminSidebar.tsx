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
            <Button variant="outline" size="icon" className="bg-white shadow-md hover:bg-gray-100">
              <Menu className="h-4 w-4" />
            </Button>
          </SidebarTrigger>
        </div>
      )}
      <Sidebar className="bg-white border-r dark:bg-gray-900 dark:border-gray-800">
        <SidebarContent>
          <div className="p-4 border-b dark:border-gray-800">
            <h1 className="text-xl font-bold dark:text-white">HR Admin</h1>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      disabled={item.disabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                        location.pathname === item.path 
                          ? "bg-gray-100 dark:bg-gray-800 text-primary" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className={`h-5 w-5 ${
                        location.pathname === item.path 
                          ? "text-primary" 
                          : "text-gray-500 dark:text-gray-400"
                      }`} />
                      <span className="truncate font-medium">{item.title}</span>
                      {item.disabled && (
                        <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto p-4 border-t dark:border-gray-800">
            <SidebarMenuButton
              onClick={() => navigate("/login")}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default AdminSidebar;