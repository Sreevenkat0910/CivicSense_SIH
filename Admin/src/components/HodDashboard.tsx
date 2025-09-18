import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Search,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
  MessageSquare,
  UserCheck,
  Edit,
  Plus,
  Users,
  Building2,
  FileText,
  Settings
} from "lucide-react";
import { CityMapView } from "./CityMapView";
import { Issue } from "./IssueTable";

// Mock data for department-specific issues
const mockDepartmentIssues: (Issue & { assignedEmployee?: string })[] = [
  {
    id: "ISS-2024-001",
    category: "Pothole",
    location: "Main St & 5th Ave",
    status: "open",
    priority: "high",
    dateReported: "2024-01-15",
    assignedDept: "Public Works",
    description: "Large pothole causing traffic hazard",
    reporter: "Jane Smith",
    assignedEmployee: "Mike Chen"
  },
  {
    id: "ISS-2024-006",
    category: "Sidewalk",
    location: "Pine Ave",
    status: "in-progress",
    priority: "medium",
    dateReported: "2024-01-10",
    assignedDept: "Public Works",
    description: "Cracked sidewalk creating trip hazard",
    reporter: "Tom Wilson",
    assignedEmployee: "Sarah Johnson"
  },
  {
    id: "ISS-2024-009",
    category: "Road Maintenance",
    location: "Oak Street",
    status: "open",
    priority: "low",
    dateReported: "2024-01-08",
    assignedDept: "Public Works",
    description: "Road surface needs resurfacing",
    reporter: "Emily Davis",
    assignedEmployee: "Unassigned"
  },
  {
    id: "ISS-2024-010",
    category: "Storm Drain",
    location: "Maple Ave & 3rd St",
    status: "resolved",
    priority: "medium",
    dateReported: "2024-01-05",
    assignedDept: "Public Works",
    description: "Storm drain clogged with debris",
    reporter: "Robert Lee",
    assignedEmployee: "Alex Rodriguez"
  }
];

// Mock department employees
const departmentEmployees = [
  { id: "emp-001", name: "Mike Chen", role: "Senior Engineer", status: "active", tasks: 3 },
  { id: "emp-002", name: "Sarah Johnson", role: "Field Supervisor", status: "active", tasks: 2 },
  { id: "emp-003", name: "Alex Rodriguez", role: "Maintenance Worker", status: "active", tasks: 1 },
  { id: "emp-004", name: "Lisa Thompson", role: "Equipment Operator", status: "active", tasks: 4 },
  { id: "emp-005", name: "David Park", role: "Safety Inspector", status: "active", tasks: 2 }
];

// Mock tasks
const mockTasks = [
  { id: "task-001", title: "Inspect Main Street pothole", assignee: "Mike Chen", priority: "high", status: "in-progress", dueDate: "2024-01-20" },
  { id: "task-002", title: "Repair sidewalk on Pine Ave", assignee: "Sarah Johnson", priority: "medium", status: "pending", dueDate: "2024-01-22" },
  { id: "task-003", title: "Clear storm drain debris", assignee: "Alex Rodriguez", priority: "medium", status: "completed", dueDate: "2024-01-18" },
  { id: "task-004", title: "Road resurfacing assessment", assignee: "Lisa Thompson", priority: "low", status: "pending", dueDate: "2024-01-25" }
];

interface HodDashboardProps {
  departmentName?: string;
  onNavigate?: (page: string) => void;
  initialTab?: "overview" | "issues" | "employees" | "tasks";
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "resolved":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-orange-100 text-orange-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function HodDashboard({ departmentName = "Public Works", onNavigate, initialTab = "overview" }: HodDashboardProps) {
  const [issues, setIssues] = useState(mockDepartmentIssues);
  const [employees, setEmployees] = useState(departmentEmployees);
  const [tasks, setTasks] = useState(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "employees" | "tasks">(initialTab);

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Filter issues based on search and status
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate department metrics
  const totalIssues = issues.length;
  const openIssues = issues.filter(issue => issue.status === "open").length;
  const inProgressIssues = issues.filter(issue => issue.status === "in-progress").length;
  const resolvedIssues = issues.filter(issue => issue.status === "resolved").length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;

  const handleStatusUpdate = (issueId: string, newStatus: string) => {
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: newStatus as "open" | "in-progress" | "resolved" }
        : issue
    ));
  };

  const handleAssignEmployee = (issueId: string, employee: string) => {
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, assignedEmployee: employee }
        : issue
    ));
  };

  const handleMapMarkerClick = (markerId: string) => {
    console.log("Department map marker clicked:", markerId);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Open Issues</p>
              <p className="text-2xl mb-1">{openIssues}</p>
              <p className="text-sm text-red-600">Requires attention</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Active Employees</p>
              <p className="text-2xl mb-1">{activeEmployees}</p>
              <p className="text-sm text-blue-600">Out of {totalEmployees}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tasks Completed</p>
              <p className="text-2xl mb-1">{completedTasks}</p>
              <p className="text-sm text-green-600">Out of {totalTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
              <p className="text-sm text-muted-foreground mb-2">Resolution Rate</p>
              <p className="text-2xl mb-1">{resolutionRate}%</p>
              <p className="text-sm text-green-600">This month</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Department Issues Map */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>{departmentName} Issues Map</h3>
          <Badge variant="outline">
            {filteredIssues.length} Issues
          </Badge>
        </div>
        <div className="relative h-[400px]">
          <CityMapView onMarkerClick={handleMapMarkerClick} issues={filteredIssues} />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => setActiveTab("employees")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Manage Employees</span>
              </div>
              <span className="text-xs text-muted-foreground">Add, edit, or remove employees</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => setActiveTab("tasks")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Assign Tasks</span>
              </div>
              <span className="text-xs text-muted-foreground">Create and assign tasks</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => setActiveTab("issues")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>View All Issues</span>
              </div>
              <span className="text-xs text-muted-foreground">Department issues</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="justify-start h-auto py-4"
            onClick={() => onNavigate?.("department-settings")}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Department Settings</span>
              </div>
              <span className="text-xs text-muted-foreground">Configure department</span>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search issues by ID, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredIssues.length} of {totalIssues} department issues
        </div>
      </div>
      </Card>

      {/* Issues Table */}
        <Card className="p-6">
        <div className="space-y-4">
          <h3>Department Issues</h3>
          
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Issue ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date Reported</TableHead>
                  <TableHead>Assigned Employee</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow 
                    key={issue.id} 
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{issue.id}</TableCell>
                    <TableCell>{issue.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {issue.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={issue.status}
                        onValueChange={(value) => handleStatusUpdate(issue.id, value)}
                      >
                        <SelectTrigger 
                          className={`w-32 border-0 ${getStatusColor(issue.status)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getPriorityColor(issue.priority)}
                      >
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(issue.dateReported).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={issue.assignedEmployee || "unassigned"}
                        onValueChange={(value) => handleAssignEmployee(issue.id, value)}
                      >
                        <SelectTrigger 
                          className="w-36 border-0 bg-transparent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {employees.map(employee => (
                            <SelectItem key={employee.id} value={employee.name}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Reassign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        </Card>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
        <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Department Employees</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active Tasks</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.tasks}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          View Tasks
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Assign Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </Card>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
        <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Department Tasks</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Title</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={
                        task.status === "completed" 
                          ? "bg-green-50 text-green-700"
                          : task.status === "in-progress"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-700"
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Reassign
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </Card>
      </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1>Head of Department - {departmentName}</h1>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Head of Department
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage issues, employees, and performance for {departmentName}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "issues" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("issues")}
        >
          Issues
        </Button>
        <Button
          variant={activeTab === "employees" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("employees")}
        >
          Employees
        </Button>
        <Button
          variant={activeTab === "tasks" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("tasks")}
        >
          Tasks
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "issues" && renderIssues()}
      {activeTab === "employees" && renderEmployees()}
      {activeTab === "tasks" && renderTasks()}
    </div>
  );
}



