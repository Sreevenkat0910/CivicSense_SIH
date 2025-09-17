import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, X, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: "urgent" | "update" | "resolved";
  title: string;
  message: string;
  time: string;
  issueId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "urgent",
    title: "High Priority Issue Reported",
    message: "Water main break on Elm Street requiring immediate attention",
    time: "5 minutes ago",
    issueId: "ISS-2024-007"
  },
  {
    id: "2",
    type: "update",
    title: "Issue Status Updated",
    message: "Pothole repair on Main St moved to In Progress",
    time: "15 minutes ago",
    issueId: "ISS-2024-001"
  },
  {
    id: "3",
    type: "resolved",
    title: "Issue Resolved",
    message: "Street light repair completed on Oak Park Blvd",
    time: "1 hour ago",
    issueId: "ISS-2024-002"
  },
  {
    id: "4",
    type: "urgent",
    title: "Multiple Reports Received",
    message: "3 new reports for traffic signal malfunction at Broadway",
    time: "2 hours ago",
    issueId: "ISS-2024-004"
  },
  {
    id: "5",
    type: "update",
    title: "Assignment Changed",
    message: "Graffiti cleanup reassigned to Parks & Recreation",
    time: "3 hours ago",
    issueId: "ISS-2024-003"
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "urgent":
      return AlertTriangle;
    case "update":
      return Clock;
    case "resolved":
      return CheckCircle2;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "urgent":
      return "text-red-600";
    case "update":
      return "text-blue-600";
    case "resolved":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

const getNotificationBadgeColor = (type: string) => {
  switch (type) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "update":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex justify-end">
      <div className="bg-background w-80 h-full shadow-xl overflow-y-auto">
        <Card className="h-full rounded-none border-0">
          <div className="p-6 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3>Notifications</h3>
                <Badge variant="secondary" className="ml-2">
                  {mockNotifications.filter(n => n.type === "urgent").length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {mockNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50 ${getNotificationColor(notification.type)}`}>
                        <NotificationIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm truncate">{notification.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{notification.time}</span>
                          {notification.issueId && (
                            <span className="text-primary">{notification.issueId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t sticky bottom-0 bg-background">
            <Button variant="outline" className="w-full" size="sm">
              Mark All as Read
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}