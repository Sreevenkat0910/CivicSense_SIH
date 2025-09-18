import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {
  onLogin: (userRole: "admin" | "department" | "department-employee" | "mandal-admin", department?: string, userName?: string, mandalName?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Demo credentials for testing
  const demoCredentials = [
    { email: "admin@civicsense.com", password: "admin123", role: "admin" as const, department: "Administration", name: "System Administrator" },
    { email: "priya@civicsense.com", password: "admin123", role: "department" as const, department: "Public Works", name: "Priya Sharma" },
    { email: "citizen@civicsense.com", password: "admin123", role: "citizen" as const, department: "Citizen", name: "Vikram Rao" },
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { email, password: "***" });
      const result = await login(email, password);
      console.log("Login result:", result);
      
      if (result.success) {
        // Find the user role from demo credentials for UI purposes
        const demoUser = demoCredentials.find(u => u.email === email);
        if (demoUser) {
          if (demoUser.role === "admin") {
            onLogin("admin", demoUser.department, demoUser.name);
          } else if (demoUser.role === "department") {
            onLogin("department", demoUser.department, demoUser.name);
          } else if (demoUser.role === "mandal-admin") {
            onLogin("mandal-admin", undefined, demoUser.name, demoUser.mandal);
          } else {
            onLogin("department-employee", demoUser.department, demoUser.name);
          }
        }
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block mb-3">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {/* Login Button */}
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={!email || !password || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Demo Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Demo Accounts</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-red-50 text-red-700">Admin</Badge>
                <span className="text-muted-foreground">admin@civicsense.com / admin123</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-green-50 text-green-700">Department</Badge>
                <span className="text-muted-foreground">priya@civicsense.com / admin123</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">Citizen</Badge>
                <span className="text-muted-foreground">citizen@civicsense.com / admin123</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}