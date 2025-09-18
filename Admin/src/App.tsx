import { useState } from "react";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { HeaderBar } from "./components/HeaderBar";
import { DepartmentHeaderBar } from "./components/DepartmentHeaderBar";
import { MandalAdminHeaderBar } from "./components/MandalAdminHeaderBar";
import { DashboardPage } from "./components/DashboardPage";
import { IssuesPage } from "./components/IssuesPage";
import { DepartmentDashboard } from "./components/DepartmentDashboard";
import { DepartmentEmployeeDashboard } from "./components/DepartmentEmployeeDashboard";
import { MandalAdminDashboard } from "./components/MandalAdminDashboard";
import { DepartmentManagement } from "./components/DepartmentManagement";
import { UserManagement } from "./components/UserManagement";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { LoginPage } from "./components/LoginPage";
import { FilterPanel } from "./components/FilterPanel";
import { IssueDetailsSidebar } from "./components/IssueDetailsSidebar";
import { NotificationsPanel, Notification } from "./components/NotificationsPanel";
import { Issue } from "./components/IssueTable";
import { SchedulePage } from "./components/SchedulePage";
import { MandalSchedulePage } from "./components/MandalSchedulePage";
import { DepartmentEmployeeTasks } from "./components/DepartmentEmployeeTasks";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "department" | "department-employee" | "mandal-admin">("admin");
  const [userDepartment, setUserDepartment] = useState("Public Works");
  const [userName, setUserName] = useState("John Doe");
  const [mandalName, setMandalName] = useState("Karimnagar");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [extraNotifications, setExtraNotifications] = useState<Notification[]>([]);

  const handleLogin = (role: "admin" | "department" | "department-employee" | "mandal-admin", department?: string, name?: string, mandal?: string) => {
    setUserRole(role);
    if (department) setUserDepartment(department);
    if (name) setUserName(name);
    if (mandal) setMandalName(mandal);
    setIsLoggedIn(true);
    
    // Set appropriate default page based on role
    switch (role) {
      case "mandal-admin":
        setCurrentPage("mandal-dashboard");
        break;
      case "department-employee":
        setCurrentPage("department-employee");
        break;
      case "department":
        setCurrentPage("department");
        break;
      default:
        setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsIssueDetailsOpen(true);
  };

  const handleMarkerClick = (markerId: string) => {
    // In a real app, you'd fetch the full issue data by ID
    console.log(`Clicked marker: ${markerId}`);
    // For now, just show a placeholder issue
    const mockIssue: Issue = {
      id: markerId,
      category: "Sample Issue",
      location: "Map Location",
      status: "open",
      priority: "medium",
      dateReported: "2024-01-15",
      assignedDept: "Public Works",
      description: "Issue clicked from map",
      reporter: "Map User"
    };
    handleIssueClick(mockIssue);
  };

  // Push HOD tasks into notifications when user is department-employee
  const pushHodTaskNotifications = (tasks: { id: string; title: string }[]) => {
    if (userRole !== "department-employee") return;
    const now = new Date().toLocaleTimeString();
    const items: Notification[] = tasks.map((t, idx) => ({
      id: `task-${t.id}-${idx}`,
      type: "update",
      title: "New Task Assigned by HOD",
      message: t.title,
      time: now,
    }));
    setExtraNotifications(items);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            onIssueClick={handleIssueClick}
            onToggleFilters={() => setIsFilterOpen(true)}
            onMarkerClick={handleMarkerClick}
          />
        );
      case "issues":
        return <IssuesPage onIssueClick={handleIssueClick} />;
      case "department":
        return (
          <DepartmentDashboard
            onIssueClick={handleIssueClick}
            userDepartment={userDepartment}
          />
        );
      case "department-employee":
        return (
          <DepartmentEmployeeDashboard
            onIssueClick={handleIssueClick}
            userDepartment={userDepartment}
            userName={userName}
          />
        );
      case "mandal-dashboard":
        return (
          <MandalAdminDashboard
            onNavigate={setCurrentPage}
          />
        );
      case "department-management":
        return (
          <DepartmentManagement
            onNavigate={setCurrentPage}
          />
        );
      case "user-management":
        return <UserManagement />;
      case "mandal-schedule":
        return <MandalSchedulePage mandalName={mandalName} />;
      case "schedule":
        return <SchedulePage 
          userRole={userRole}
          userDepartment={userDepartment}
          mandalName={mandalName}
        />;
      case "system-settings":
        return (
          <PlaceholderPage
            title="System Settings"
            description="Configure system-wide parameters and policies"
          />
        );
      case "employee-tasks":
        return (
          <DepartmentEmployeeTasks userDepartment={userDepartment} userName={userName} />
        );
      case "settings":
        return (
          <PlaceholderPage
            title="Settings"
            description="System configuration and user management"
          />
        );
      default:
        return getDefaultPageForRole();
    }
  };

  const getDefaultPageForRole = () => {
    switch (userRole) {
      case "mandal-admin":
        return (
          <MandalAdminDashboard
            onNavigate={setCurrentPage}
          />
        );
      case "department":
        return (
          <DepartmentDashboard
            onIssueClick={handleIssueClick}
            userDepartment={userDepartment}
          />
        );
      case "department-employee":
        return (
          <DepartmentEmployeeDashboard
            onIssueClick={handleIssueClick}
            userDepartment={userDepartment}
            userName={userName}
          />
        );
      default:
        return (
          <DashboardPage
            onIssueClick={handleIssueClick}
            onToggleFilters={() => setIsFilterOpen(true)}
            onMarkerClick={handleMarkerClick}
          />
        );
    }
  };

  const renderHeaderBar = () => {
    switch (userRole) {
      case "mandal-admin":
        return (
          <MandalAdminHeaderBar
            onNotificationsClick={() => setIsNotificationsOpen(true)}
            notificationCount={3}
            userName={userName}
            mandalName={mandalName}
            onLogout={handleLogout}
          />
        );
      case "department":
        return (
          <DepartmentHeaderBar
            onNotificationsClick={() => setIsNotificationsOpen(true)}
            notificationCount={1}
            userDepartment={userDepartment}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case "department-employee":
        return (
          <DepartmentHeaderBar
            onNotificationsClick={() => setIsNotificationsOpen(true)}
            notificationCount={1}
            userDepartment={userDepartment}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <HeaderBar 
            onNotificationsClick={() => setIsNotificationsOpen(true)}
            notificationCount={2}
            userName={userName}
            onLogout={handleLogout}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-background flex">
      <NavigationSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userRole={userRole}
        userDepartment={userDepartment}
        mandalName={mandalName}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        {renderHeaderBar()}
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Issue Details Sidebar */}
      <IssueDetailsSidebar
        issue={selectedIssue}
        isOpen={isIssueDetailsOpen}
        onClose={() => setIsIssueDetailsOpen(false)}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        extraNotifications={extraNotifications}
      />
    </div>
  );
}