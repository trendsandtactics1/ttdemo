import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    
    // Validate password before submission
    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to sign in first
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign in fails with invalid credentials, try to sign up
      if (authError && authError.message === "Invalid login credentials") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          if (signUpError.message.includes("rate_limit")) {
            throw new Error("Please wait a moment before trying again");
          }
          if (signUpError.message.includes("weak_password")) {
            throw new Error("Password should be at least 6 characters");
          }
          throw signUpError;
        }

        // Since email verification is disabled, we can proceed with the signed up user
        if (signUpData.user) {
          authData = signUpData;
        } else {
          throw new Error("Failed to create account");
        }
      } else if (authError) {
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('No user data returned');
      }

      // Now fetch the user's profile data from the users table
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
        // If user doesn't exist in users table, create them
        const { data: newUserData, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: email.split('@')[0], // Temporary name from email
              employee_id: `EMP${Math.floor(Math.random() * 10000)}`, // Temporary employee ID
              designation: 'employee', // Default designation
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

      // Store user data in localStorage (temporary, will be removed later)
      localStorage.setItem('workstream_current_user', JSON.stringify(userData));
      
      // Navigate based on role
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
      
      if (error instanceof AuthError) {
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Invalid email or password';
            break;
          case 'Email not confirmed':
            errorMessage = 'Please verify your email address';
            break;
          case 'weak_password':
            errorMessage = 'Password should be at least 6 characters';
            break;
          default:
            errorMessage = error.message;
        }
      } else if (error instanceof Error) {
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