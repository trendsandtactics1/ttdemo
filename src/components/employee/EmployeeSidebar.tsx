import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Bell,
  LogOut,
  Menu,
  User,
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
  const [userId, setUserId] = useState<string | null>(null);

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

  const menuItems: MenuItem[] = [
    { title: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { title: "Tasks", path: "/employee", icon: ClipboardList },
    { title: "Attendance", path: "/employee/attendance", icon: Calendar },
    { title: "Leave Request", path: "/employee/leave-request", icon: ClipboardList },
    { title: "Announcements", path: "/employee/announcements", icon: Bell },
    { title: "Profile", path: "/employee/profile", icon: User },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
            {profile?.name && (
              <p className="text-sm text-muted-foreground mt-1">{profile.name}</p>
            )}
          </div>
          <SidebarGroup>
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
              onClick={handleLogout}
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