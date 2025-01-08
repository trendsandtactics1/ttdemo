import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          setError("Error fetching user profile. Please try again.");
          return;
        }

        if (!profileData) {
          setError("Profile not found. Please contact your administrator.");
          return;
        }

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (roleError) {
          setError("Error fetching user role. Please try again.");
          return;
        }

        if (!roleData) {
          setError("User role not found. Please contact your administrator.");
          return;
        }

        const userData = {
          id: data.user.id,
          name: profileData.name,
          email: profileData.email,
          employeeId: profileData.employee_id,
          designation: profileData.designation,
          role: roleData.role,
        };

        localStorage.setItem('workstream_current_user', JSON.stringify(userData));

        // Route based on role
        const role = roleData.role;
        if (role === 'admin') {
          navigate("/admin");
        } else if (role === 'manager') {
          navigate("/manager");
        } else {
          navigate("/employee");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (authData.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: name.trim(),
              email: email.trim(),
            },
          ]);

        if (profileError) {
          setError("Error creating user profile. Please try again.");
          return;
        }

        setError(null);
        // Show success message and switch to login tab
        alert("Registration successful! Please check your email to verify your account, then login.");
        window.location.reload(); // Refresh to show login tab
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError("An unexpected error occurred during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                    disabled={loading}
                    placeholder="Enter your password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full"
                    disabled={loading}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                    disabled={loading}
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;