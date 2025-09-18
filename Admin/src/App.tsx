import { useState } from "react";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { HeaderBar } from "./components/HeaderBar";
import { DepartmentHeaderBar } from "./components/DepartmentHeaderBar";
import { MandalAdminHeaderBar } from "./components/MandalAdminHeaderBar";
import { DashboardPage } from "./components/DashboardPage";
import { IssuesPage } from "./components/IssuesPage";
import { DepartmentDashboard } from "./components/DepartmentDashboard";
import { MandalAdminDashboard } from "./components/MandalAdminDashboard";
import { DepartmentManagement } from "./components/DepartmentManagement";
import { UserManagement } from "./components/UserManagement";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { LoginPage } from "./components/LoginPage";
import { FilterPanel } from "./components/FilterPanel";
import { IssueDetailsSidebar } from "./components/IssueDetailsSidebar";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { Issue } from "./components/IssueTable";
import { SchedulePage } from "./components/SchedulePage";
import { MandalSchedulePage } from "./components/MandalSchedulePage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "department" | "mandal-admin">("admin");
  const [userDepartment, setUserDepartment] = useState("Public Works");
  const [userName, setUserName] = useState("John Doe");
  const [mandalName, setMandalName] = useState("Karimnagar");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogin = (role: "admin" | "department" | "mandal-admin", department?: string, name?: string, mandal?: string) => {
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
        return <MandalSchedulePage />;
      case "schedule":
        return <SchedulePage />;
      case "system-settings":
        return (
          <PlaceholderPage
            title="System Settings"
            description="Configure system-wide parameters and policies"
          />
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
      />
    </div>
  );
}