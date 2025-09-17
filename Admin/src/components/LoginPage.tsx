import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Building2, Shield, User } from "lucide-react";

interface LoginPageProps {
  onLogin: (userRole: "admin" | "department" | "mandal-admin", department?: string, userName?: string, mandalName?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "department" | "mandal-admin">("admin");
  const [selectedDepartment, setSelectedDepartment] = useState("Public Works");
  const [selectedMandal, setSelectedMandal] = useState("Karimnagar");

  const departments = [
    "Public Works",
    "Utilities", 
    "Parks & Recreation",
    "Traffic Department",
    "Water Department",
    "Code Enforcement",
    "Police Department"
  ];

  const mandals = [
    "Karimnagar",
    "Warangal",
    "Nizamabad",
    "Medak",
    "Khammam",
    "Mahbubnagar"
  ];

  const handleLogin = () => {
    if (selectedRole === "admin") {
      onLogin("admin", undefined, "John Doe");
    } else if (selectedRole === "department") {
      onLogin("department", selectedDepartment, "Mike Chen");
    } else {
      onLogin("mandal-admin", undefined, "Rajesh Kumar", selectedMandal);
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
          {/* Role Selection */}
          <div>
            <label className="block mb-3">Access Level</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedRole === "admin" ? "default" : "outline"}
                onClick={() => setSelectedRole("admin")}
                className="flex flex-col gap-1 h-auto py-3 text-xs"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Button>
              <Button
                variant={selectedRole === "department" ? "default" : "outline"}
                onClick={() => setSelectedRole("department")}
                className="flex flex-col gap-1 h-auto py-3 text-xs"
              >
                <User className="w-4 h-4" />
                <span>Department</span>
              </Button>
              <Button
                variant={selectedRole === "mandal-admin" ? "default" : "outline"}
                onClick={() => setSelectedRole("mandal-admin")}
                className="flex flex-col gap-1 h-auto py-3 text-xs"
              >
                <Building2 className="w-4 h-4" />
                <span>Mandal Admin</span>
              </Button>
            </div>
          </div>

          {/* Department Selection for Department Users */}
          {selectedRole === "department" && (
            <div>
              <label className="block mb-3">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mandal Selection for Mandal Admins */}
          {selectedRole === "mandal-admin" && (
            <div>
              <label className="block mb-3">Mandal</label>
              <Select value={selectedMandal} onValueChange={setSelectedMandal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mandals.map(mandal => (
                    <SelectItem key={mandal} value={mandal}>
                      {mandal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Admin
                </Badge>
                <span className="text-muted-foreground">Full system access</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  Department
                </Badge>
                <span className="text-muted-foreground">Department-specific access</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                  Mandal Admin
                </Badge>
                <span className="text-muted-foreground">Government administration</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}