import { useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  Calendar,
  Bell,
  LogOut,
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
import ProfileUpdateModal from "./ProfileUpdateModal";

interface MenuItem {
  title: string;
  path: string;
  icon: typeof ClipboardList;
  disabled?: boolean;
}

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const menuItems: MenuItem[] = [
    { title: "Attendance", path: "/employee/attendance", icon: Calendar },
    { title: "Tasks", path: "/employee", icon: ClipboardList },
    { title: "Leave Request", path: "/employee/leave-request", icon: ClipboardList },
    { title: "Announcements", path: "/employee/announcements", icon: Bell },
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
            <h1 className="text-xl font-bold">Employee Portal</h1>
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
                <SidebarMenuItem>
                  <div className="px-4 py-2">
                    <ProfileUpdateModal />
                  </div>
                </SidebarMenuItem>
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

export default EmployeeSidebar;