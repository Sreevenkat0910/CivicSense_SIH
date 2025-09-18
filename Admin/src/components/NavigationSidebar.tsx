import { cn } from "./ui/utils";
import { 
  Home, 
  FileText, 
  BarChart3, 
  Calendar,
  Settings,
  Building2,
  Users,
  Shield,
  Clock
} from "lucide-react";

interface NavigationSidebarProps {
  className?: string;
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole?: "admin" | "department" | "department-employee" | "mandal-admin";
  userDepartment?: string;
  mandalName?: string;
}

const adminNavItems = [
  { icon: Home, label: "Dashboard", page: "dashboard" },
  { icon: FileText, label: "Issues", page: "issues" },
  { icon: BarChart3, label: "Analytics", page: "analytics" },
  { icon: Calendar, label: "Schedule", page: "schedule" },
  { icon: Clock, label: "My Timetable", page: "my-timetable" },
  { icon: Settings, label: "Settings", page: "settings" },
];

const departmentNavItems = [
  { icon: Building2, label: "Head of Department", page: "hod-dashboard" },
  { icon: FileText, label: "Department Issues", page: "department-issues" },
  { icon: Users, label: "Manage Employees", page: "department-employees" },
  { icon: Calendar, label: "Schedule", page: "schedule" },
  { icon: Clock, label: "My Timetable", page: "my-timetable" },
  { icon: Settings, label: "Department Settings", page: "department-settings" },
];

const departmentEmployeeNavItems = [
  { icon: Building2, label: "My Dashboard", page: "department-employee" },
  { icon: Calendar, label: "Schedule", page: "schedule" },
  { icon: FileText, label: "My Tasks", page: "employee-tasks" },
  { icon: Clock, label: "My Timetable", page: "my-timetable" },
  { icon: Settings, label: "Settings", page: "settings" },
];

const mandalAdminNavItems = [
  { icon: Home, label: "Mandal Admin", page: "mandal-dashboard" },
  { icon: FileText, label: "Issues", page: "issues" },
  { icon: BarChart3, label: "Analytics", page: "analytics" },
  { icon: Building2, label: "Department Management", page: "department-management" },
  { icon: Users, label: "User Management", page: "user-management" },
  { icon: Calendar, label: "Schedule", page: "mandal-schedule" },
  { icon: Clock, label: "My Timetable", page: "my-timetable" },
  { icon: Settings, label: "System Settings", page: "system-settings" },
];

export function NavigationSidebar({ 
  className, 
  currentPage, 
  onPageChange,
  userRole = "admin",
  userDepartment = "Public Works",
  mandalName = "Karimnagar"
}: NavigationSidebarProps) {
  const getNavItems = () => {
    switch (userRole) {
      case "mandal-admin":
        return mandalAdminNavItems;
      case "department":
        return departmentNavItems;
      case "department-employee":
        return departmentEmployeeNavItems;
      default:
        return adminNavItems;
    }
  };

  const getTitle = () => {
    switch (userRole) {
      case "mandal-admin":
        return `${mandalName} Mandal`;
      case "department":
        return `${userDepartment} - Head of Department`;
      case "department-employee":
        return `${userDepartment} Portal`;
      default:
        return "CivicReport Admin";
    }
  };

  const getSubtitle = () => {
    switch (userRole) {
      case "mandal-admin":
        return "Government Administration";
      case "department":
        return "Department Management";
      case "department-employee":
        return "My Assigned Issues";
      default:
        return "Municipal Dashboard";
    }
  };

  const getUserInitials = () => {
    switch (userRole) {
      case "mandal-admin":
        return "MA";
      case "department":
        return "MC";
      case "department-employee":
        return "RK";
      default:
        return "JD";
    }
  };

  const getUserName = () => {
    switch (userRole) {
      case "mandal-admin":
        return "Mandal Admin";
      case "department":
        return "Mike Chen";
      case "department-employee":
        return "Ravi Kumar";
      default:
        return "John Doe";
    }
  };

  const getUserRole = () => {
    switch (userRole) {
      case "mandal-admin":
        return "Mandal Administrator";
      case "department":
        return `${userDepartment} Employee`;
      case "department-employee":
        return `${userDepartment} Employee`;
      default:
        return "City Administrator";
    }
  };

  const navItems = getNavItems();
  
  return (
    <div className={cn("bg-sidebar border-r border-sidebar-border w-64 h-full flex flex-col", className)}>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-sidebar-foreground">
            {getTitle()}
          </h1>
          {userRole === "mandal-admin" && (
            <Shield className="w-4 h-4 text-purple-600" />
          )}
        </div>
        <p className="text-sm text-sidebar-accent-foreground opacity-70">
          {getSubtitle()}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => onPageChange(item.page)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  currentPage === item.page
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            userRole === "mandal-admin" 
              ? "bg-purple-600" 
              : "bg-sidebar-primary"
          )}>
            <span className={cn(
              "text-sm",
              userRole === "mandal-admin" 
                ? "text-white" 
                : "text-sidebar-primary-foreground"
            )}>
              {getUserInitials()}
            </span>
          </div>
          <div>
            <p className="text-sm text-sidebar-foreground">
              {getUserName()}
            </p>
            <p className="text-xs text-sidebar-accent-foreground opacity-70">
              {getUserRole()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}