import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Building2,
  Users,
  FileText,
  TrendingUp,
  UserCheck,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

// Mock data for mandal overview
const mandalStats = {
  totalDepartments: 12,
  activeUsers: 156,
  totalIssues: 1248,
  openIssues: 342,
  inProgressIssues: 186,
  resolvedIssues: 720,
  newUsersThisMonth: 23,
  avgResolutionTime: "4.2 days"
};

const departmentOverview = [
  { name: "Public Works", staff: 24, openIssues: 89, resolved: 156, efficiency: 92 },
  { name: "Utilities", staff: 18, openIssues: 45, resolved: 98, efficiency: 87 },
  { name: "Parks & Recreation", staff: 12, openIssues: 23, resolved: 67, efficiency: 94 },
  { name: "Traffic Department", staff: 15, openIssues: 34, resolved: 78, efficiency: 89 },
  { name: "Water Department", staff: 21, openIssues: 67, resolved: 134, efficiency: 85 },
  { name: "Code Enforcement", staff: 9, openIssues: 12, resolved: 45, efficiency: 96 }
];

const recentActivity = [
  { type: "user_added", description: "New user added to Public Works", time: "2 hours ago" },
  { type: "department_updated", description: "Traffic Department staff updated", time: "4 hours ago" },
  { type: "issue_spike", description: "High issue volume in Water Department", time: "6 hours ago" },
  { type: "user_role_changed", description: "Admin role assigned to Rajesh Kumar", time: "1 day ago" }
];

interface MandalAdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function MandalAdminDashboard({ onNavigate }: MandalAdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_added":
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case "department_updated":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "issue_spike":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "user_role_changed":
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Mandal Administration Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview and management of departments and users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Mandal Admin
          </Badge>
          <Badge variant="outline">
            {mandalStats.totalDepartments} Departments
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Departments</p>
              <p className="text-3xl mb-1">{mandalStats.totalDepartments}</p>
              <p className="text-sm text-green-600">All active</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Active Users</p>
              <p className="text-3xl mb-1">{mandalStats.activeUsers}</p>
              <p className="text-sm text-green-600">+{mandalStats.newUsersThisMonth} this month</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Issues</p>
              <p className="text-3xl mb-1">{mandalStats.totalIssues}</p>
              <p className="text-sm text-blue-600">{mandalStats.openIssues} open</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Avg Resolution</p>
              <p className="text-3xl mb-1">{mandalStats.avgResolutionTime}</p>
              <p className="text-sm text-green-600">Improving</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Issue Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Open Issues</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl mb-2">{mandalStats.openIssues}</p>
          <p className="text-sm text-muted-foreground">Require attention</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>In Progress</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl mb-2">{mandalStats.inProgressIssues}</p>
          <p className="text-sm text-muted-foreground">Being worked on</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Resolved</h3>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl mb-2">{mandalStats.resolvedIssues}</p>
          <p className="text-sm text-muted-foreground">Successfully completed</p>
        </Card>
      </div>

      {/* Department Overview and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Department Performance</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate("department-management")}
            >
              Manage All
            </Button>
          </div>

          <div className="space-y-4">
            {departmentOverview.slice(0, 5).map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.staff} staff members
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{dept.openIssues} open</p>
                  <Badge 
                    variant="secondary" 
                    className={
                      dept.efficiency >= 90 
                        ? "bg-green-50 text-green-700" 
                        : dept.efficiency >= 85 
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                    }
                  >
                    {dept.efficiency}% efficient
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Recent Activity</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => onNavigate("user-management")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </div>
              <span className="text-xs text-muted-foreground">Add, edit, or remove users</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => onNavigate("department-management")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Manage Departments</span>
              </div>
              <span className="text-xs text-muted-foreground">Configure departments</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => onNavigate("system-settings")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </div>
              <span className="text-xs text-muted-foreground">Configure system parameters</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => onNavigate("reports")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Generate Reports</span>
              </div>
              <span className="text-xs text-muted-foreground">Analytics and insights</span>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}