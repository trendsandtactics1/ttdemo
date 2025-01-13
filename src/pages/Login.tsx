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
    
    let employeeId;

if (email === "karthikjungleemara@gmail.com") {
  employeeId = "TT012";
} else if (email === "sonukrishnan1313@gmail.com") {
  employeeId = "TT009";
} else if (email === "sristar.live@gmail.com") {
  employeeId = "TT004";
} else if (email === "shinujeopoulose@gmail.com") {
  employeeId = "TT006";
} else if (email === "unnihari2332@gmail.com") {
  employeeId = "TT013";
} else if (email === "vinodvinod18696@gmail.com") {
  employeeId = "TT001";
} else if (email === "tnmani.manikandan11@gmail.com") {
  employeeId = "TT010";
} else if (email.includes("admin")) {
  const adminIds = ["ADMIN001", "ADMIN002", "ADMIN003"];
  employeeId = adminIds[Math.floor(Math.random() * adminIds.length)];
} else if (email === "kandhan87selvaraj@gmail.com") {
  employeeId = "TT002";
} else if (email === "sathiyamoorthytt005@gmail.com") {
  employeeId = "TT003";
  employeeId = managerIds[Math.floor(Math.random() * managerIds.length)];
} else {
  employeeId = `TT${Math.floor(Math.random() * 100)}`;
}


    let userData = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email: email,
      employeeId: employeeId,
      designation: "Employee",
      password: password
    };

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

    localStorage.setItem('workstream_current_user', JSON.stringify(userData));
    
    toast({
      title: "Logged in successfully",
      description: `Welcome back, ${userData.name}!`,
    });
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
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md transition-colors"
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
