import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Input } from "./ui/input";

interface DepartmentHeaderBarProps {
  onNotificationsClick: () => void;
  notificationCount?: number;
  userDepartment: string;
  userName: string;
  onLogout: () => void;
}

export function DepartmentHeaderBar({ 
  onNotificationsClick, 
  notificationCount = 0,
  userDepartment,
  userName,
  onLogout
}: DepartmentHeaderBarProps) {
  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1>{userDepartment} Portal</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Department Issue Management</p>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                {userDepartment}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search department issues..."
              className="pl-10"
            />
          </div>
          
          {/* Notifications removed for Department Employee view */}
          
          {/* Profile + explicit Logout button */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">{userDepartment}</p>
              </div>
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}