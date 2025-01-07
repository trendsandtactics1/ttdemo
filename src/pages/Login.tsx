import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map email to specific employee IDs for testing
    let employeeId;
    if (email === "karthikjungleemara@gmail.com") {
      employeeId = "TT012";  // This matches the attendance log
    } else if (email.includes("admin")) {
      employeeId = "ADMIN001";
    } else if (email.includes("manager")) {
      employeeId = "MGR001";
    } else {
      employeeId = `TT${Math.floor(Math.random() * 100)}`;  // Fallback format matching attendance logs
    }

    let userData = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email: email,
      employeeId: employeeId,
      designation: "Employee",
      password: password
    };

    // For demo purposes, hardcoded roles
    if (email.includes("admin")) {
      userData.designation = "Admin";
      navigate("/admin");
    } else if (email.includes("manager")) {
      userData.designation = "Manager";
      navigate("/manager");
    } else {
      userData.designation = "Employee";
      navigate("/employee");
    }

    // Store user data in localStorage
    localStorage.setItem('workstream_current_user', JSON.stringify(userData));
    
    toast({
      title: "Logged in successfully",
      description: `Welcome back, ${userData.name}!`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-8">
        <img src="/logo.png" alt="Trends & Tactics Logo" className="w-32 h-32" />
      </div>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
            >
              Sign In
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;