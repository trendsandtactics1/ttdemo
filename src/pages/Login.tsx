import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if the user exists in our custom users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (userError) {
        throw userError;
      }

      if (!userData) {
        throw new Error("User not found");
      }

      if (userData.password !== password) {
        throw new Error("Invalid password");
      }

      // Try to sign in with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            employee_id: userData.employee_id,
          }
        }
      });

      if (signInError) {
        // Handle email not confirmed error specifically
        if (signInError.message.includes("Email not confirmed")) {
          // Create the user in auth if they don't exist
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: userData.name,
                employee_id: userData.employee_id,
              },
              emailRedirectTo: window.location.origin,
            }
          });

          if (signUpError) throw signUpError;

          // Try signing in again without email verification
          const { data: session, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (retryError) throw retryError;
          
          if (!session) throw new Error("Failed to create session");
        } else {
          throw signInError;
        }
      }

      // Determine role and redirect
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.id)
        .maybeSingle();

      const role = roleData?.role || 'employee';

      if (role === 'admin') {
        navigate("/admin");
      } else if (role === 'manager') {
        navigate("/manager");
      } else {
        navigate("/employee");
      }

      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <Card className="w-full max-w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;