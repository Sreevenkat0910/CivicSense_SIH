import { useState } from "react";
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
  Edit
} from "lucide-react";
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

const departmentEmployees = [
  "Mike Chen",
  "Sarah Johnson", 
  "Alex Rodriguez",
  "Lisa Thompson",
  "David Park"
];

interface DepartmentDashboardProps {
  onIssueClick: (issue: Issue) => void;
  userDepartment: string;
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

export function DepartmentDashboard({ onIssueClick, userDepartment }: DepartmentDashboardProps) {
  const [issues, setIssues] = useState(mockDepartmentIssues);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1>Head of Department - {userDepartment}</h1>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Head of Department
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage issues and performance for {userDepartment}
          </p>
        </div>
      </div>

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
              <p className="text-sm text-muted-foreground mb-2">In Progress</p>
              <p className="text-2xl mb-1">{inProgressIssues}</p>
              <p className="text-sm text-blue-600">Currently working</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Resolved</p>
              <p className="text-2xl mb-1">{resolvedIssues}</p>
              <p className="text-sm text-green-600">Completed</p>
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
                    onClick={() => onIssueClick(issue)}
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
                          {departmentEmployees.map(employee => (
                            <SelectItem key={employee} value={employee}>
                              {employee}
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
                          <DropdownMenuItem onClick={() => onIssueClick(issue)}>
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

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No issues found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Bulk Comments
          </Button>
          <Button variant="outline" className="justify-start">
            <UserCheck className="w-4 h-4 mr-2" />
            Bulk Reassign
          </Button>
          <Button variant="outline" className="justify-start">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark Multiple Resolved
          </Button>
        </div>
      </Card>
    </div>
  );
}