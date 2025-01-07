import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isLoading } = useSessionContext();
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      setIsCheckingRole(true);
      const { data: userRole, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      // Store user role in localStorage
      localStorage.setItem("userRole", userRole.role);

      // Redirect based on role
      switch (userRole.role) {
        case "HR":
          navigate("/admin");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        default:
          navigate("/employee");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingRole(false);
    }
  };

  useEffect(() => {
    if (session?.user && !isCheckingRole) {
      checkUserRoleAndRedirect(session.user.id);
    }
  }, [session]);

  if (isLoading || isCheckingRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Logo" className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
        </div>
        <div className="rounded-lg bg-white p-8 shadow">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#333333',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;