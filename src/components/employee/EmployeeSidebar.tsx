import { useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  Calendar,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const menuItems = [
    { title: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { title: "Tasks", path: "/employee", icon: ClipboardList },
    { title: "Attendance", path: "/employee/attendance", icon: Calendar },
    { title: "Leave Request", path: "/employee/leave-request", icon: ClipboardList },
    { title: "Announcements", path: "/employee/announcements", icon: Bell },
    { title: "Profile", path: "/employee/profile", icon: User },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger>
            <Button variant="outline" size="icon" className="bg-white shadow-md hover:bg-gray-100">
              <img src="/logo.png" alt="Company Logo" className="h-4 w-4 object-contain" />
            </Button>
          </SidebarTrigger>
        </div>
      )}
      <Sidebar className="bg-white border-r shadow-md dark:bg-gray-900 dark:border-gray-800 fixed inset-y-0 left-0">
        <SidebarContent className="bg-white dark:bg-gray-900">
          <div className="p-4 border-b flex items-center gap-3">
            <img src="/logo.png" alt="Company Logo" className="h-8 w-8 object-contain" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate dark:text-white">Employee Portal</h1>
              {profile?.name && (
                <p className="text-sm text-muted-foreground truncate mt-1">{profile.name}</p>
              )}
            </div>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                        location.pathname === item.path 
                          ? "bg-gray-100 dark:bg-gray-800 text-primary" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${
                        location.pathname === item.path 
                          ? "text-primary" 
                          : "text-gray-500 dark:text-gray-400"
                      }`} />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto p-4 border-t">
            <SidebarMenuButton 
              onClick={() => handleNavigation("/login")}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default EmployeeSidebar;