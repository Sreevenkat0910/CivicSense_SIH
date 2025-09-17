import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Search, User, LogOut, Settings, Shield } from "lucide-react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MandalAdminHeaderBarProps {
  onNotificationsClick: () => void;
  notificationCount?: number;
  userName: string;
  mandalName: string;
  onLogout: () => void;
}

export function MandalAdminHeaderBar({ 
  onNotificationsClick, 
  notificationCount = 0,
  userName,
  mandalName,
  onLogout
}: MandalAdminHeaderBarProps) {
  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1>{mandalName} Mandal Administration</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">State Government Mandal Portal</p>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Mandal Admin
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users, departments, or issues..."
              className="pl-10"
            />
          </div>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNotificationsClick}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm">{userName}</p>
                  <p className="text-xs text-muted-foreground">Mandal Administrator</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p>{userName}</p>
                  <p className="text-xs text-muted-foreground">Mandal Administrator</p>
                  <p className="text-xs text-muted-foreground">{mandalName} Mandal</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                System Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="w-4 h-4 mr-2" />
                Notification Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}