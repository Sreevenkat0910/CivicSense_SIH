import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Building2 } from "lucide-react";

interface LoginPageProps {
  onLogin: (userRole: "admin" | "department" | "department-employee" | "mandal-admin", department?: string, userName?: string, mandalName?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Simple demo user directory (replace with real API later)
  const demoUsers = [
    { username: "public", password: "public", role: "department" as const, department: "Public Works", name: "Priya Singh" },
    { username: "water", password: "water", role: "department" as const, department: "Water Department", name: "Mike Chen" },
    { username: "ravie", password: "ravie", role: "department-employee" as const, department: "Public Works", name: "Ravi Kumar" },
    { username: "mandal", password: "mandal", role: "mandal-admin" as const, mandal: "Karimnagar", name: "Rajesh Kumar" },
    { username: "hod", password: "hod", role: "department" as const, department: "Public Works", name: "Head of Department" },
  ];

  const handleLogin = () => {
    // Block any attempt to use the reserved admin username
    if (username.trim().toLowerCase() === "admin") {
      alert("Admin login is disabled.");
      return;
    }
    const user = demoUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) {
      alert("Invalid credentials. Try admin/admin, public/public, water/water, hod/hod, or mandal/mandal");
      return;
    }

    if (user.role === "admin") {
      onLogin("admin", undefined, user.name);
    } else if (user.role === "department") {
      onLogin("department", user.department, user.name);
    } else if (user.role === "department-employee") {
      onLogin("department-employee", user.department, user.name);
    } else {
      onLogin("mandal-admin", undefined, user.name, user.mandal);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1>CivicReport System</h1>
          <p className="text-muted-foreground">
            Municipal Issue Management Portal
          </p>
        </div>

        <div className="space-y-6">

          {/* Username */}
          <div>
            <label className="block mb-3">Username</label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-3">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={!username || !password}
          >
            Sign In
          </Button>

          {/* Demo Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Demo Accounts</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-green-50 text-green-700">Department</Badge>
                <span className="text-muted-foreground">public / public, water / water</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">Mandal Admin</Badge>
                <span className="text-muted-foreground">mandal / mandal</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}