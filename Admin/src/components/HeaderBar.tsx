import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Input } from "./ui/input";

interface HeaderBarProps {
  onNotificationsClick: () => void;
  notificationCount?: number;
  userName?: string;
  onLogout?: () => void;
}

export function HeaderBar({ onNotificationsClick, notificationCount = 0, userName = "John Doe", onLogout }: HeaderBarProps) {
  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground">Municipal Issue Management System</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search issues, locations, or departments..."
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
          
          {/* Profile + explicit Logout button */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden md:block">{userName}</span>
            </Button>
            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}