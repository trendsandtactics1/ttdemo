import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const handleAuthError = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case "email_not_confirmed":
          return "Please check your email for a confirmation link. If you haven't received it, try signing up again.";
        case "invalid_credentials":
          return "Invalid email or password. Please check your credentials.";
        case "rate_limit_exceeded":
          return "Too many attempts. Please try again later.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First try to sign in
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign in fails, try to sign up
      if (authError && authError.code === "invalid_credentials") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          authData = signUpData;
        } else {
          throw new Error("Failed to create account");
        }
      } else if (authError) {
        const errorMessage = handleAuthError(authError);
        throw new Error(errorMessage);
      }

      if (!authData?.user) {
        throw new Error('No user data returned');
      }

      let userData;
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        throw new Error('Failed to fetch user data');
      }

      if (!existingUser) {
        const { data: newUserData, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: email.split('@')[0],
              employee_id: `EMP${Math.floor(Math.random() * 10000)}`,
              designation: 'employee',
              password: password,
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        userData = newUserData;
      } else {
        userData = existingUser;
      }

      localStorage.setItem('workstream_current_user', JSON.stringify(userData));
      
      if (userData.designation.toLowerCase().includes('admin')) {
        navigate("/admin");
      } else if (userData.designation.toLowerCase().includes('manager')) {
        navigate("/manager");
      } else {
        navigate("/employee");
      }

      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Login failed",
        description: errorMessage,
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
          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationError("");
                }}
                required
                className="w-full"
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;