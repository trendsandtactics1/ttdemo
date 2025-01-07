import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast({
          title: "Error",
          description: "Failed to check authentication status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (session) {
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError) {
          toast({
            title: "Error",
            description: "Could not fetch user role. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (roleData) {
          // Store user data in localStorage for backward compatibility
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0],
            email: session.user.email,
            employeeId: session.user.user_metadata.employeeId || `TT${Math.floor(Math.random() * 100)}`,
            designation: roleData.role === 'HR' ? 'Admin' : roleData.role === 'MANAGER' ? 'Manager' : 'Employee',
          };
          localStorage.setItem('workstream_current_user', JSON.stringify(userData));

          // Navigate based on role
          switch (roleData.role) {
            case 'HR':
              navigate('/admin');
              break;
            case 'MANAGER':
              navigate('/manager');
              break;
            default:
              navigate('/employee');
          }
        }
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError) {
          toast({
            title: "Error",
            description: "Could not fetch user role. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (roleData) {
          // Store user data in localStorage for backward compatibility
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0],
            email: session.user.email,
            employeeId: session.user.user_metadata.employeeId || `TT${Math.floor(Math.random() * 100)}`,
            designation: roleData.role === 'HR' ? 'Admin' : roleData.role === 'MANAGER' ? 'Manager' : 'Employee',
          };
          localStorage.setItem('workstream_current_user', JSON.stringify(userData));

          // Navigate based on role
          switch (roleData.role) {
            case 'HR':
              navigate('/admin');
              break;
            case 'MANAGER':
              navigate('/manager');
              break;
            default:
              navigate('/employee');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('workstream_current_user');
        navigate('/login');
      } else if (event === 'USER_UPDATED') {
        // Handle user updates
        checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="mb-8 flex flex-col items-center">
        <img 
          src="/logo.png" 
          alt="Trends & Tactics Logo" 
          className="w-32 h-32 object-contain mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">Trends & Tactics</h1>
      </div>
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
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
            onError={(error) => {
              toast({
                title: "Authentication Error",
                description: error.message,
                variant: "destructive",
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;