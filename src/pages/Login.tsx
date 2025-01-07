import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/services/localStorageService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    let userData = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email: email,
      employeeId: `EMP${Math.floor(Math.random() * 1000)}`,
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
      description: "Welcome back!",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">HR Management System</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;