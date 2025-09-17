import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Search,
  Filter, 
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  MapPin,
  Calendar,
  ArrowUpDown,
  Plus
} from "lucide-react";
import { Issue } from "./IssueTable";

// Extended mock data for the Issues page
const mockIssuesData: Issue[] = [
  {
    id: "ISS-2024-001",
    category: "Pothole",
    location: "Main St & 5th Ave",
    status: "open",
    priority: "high",
    dateReported: "2024-01-15",
    assignedDept: "Public Works",
    description: "Large pothole causing traffic hazard",
    reporter: "Jane Smith"
  },
  {
    id: "ISS-2024-002",
    category: "Street Light",
    location: "Oak Park Blvd",
    status: "in-progress",
    priority: "medium",
    dateReported: "2024-01-14",
    assignedDept: "Utilities",
    description: "Street light not working",
    reporter: "Mike Johnson"
  },
  {
    id: "ISS-2024-003",
    category: "Graffiti",
    location: "Downtown Library",
    status: "resolved",
    priority: "low",
    dateReported: "2024-01-13",
    assignedDept: "Parks & Rec",
    description: "Graffiti on building wall",
    reporter: "Sarah Davis"
  },
  {
    id: "ISS-2024-004",
    category: "Traffic Signal",
    location: "1st St & Broadway",
    status: "open",
    priority: "high",
    dateReported: "2024-01-12",
    assignedDept: "Traffic Dept",
    description: "Traffic light not cycling properly",
    reporter: "Robert Wilson"
  },
  {
    id: "ISS-2024-005",
    category: "Water Main",
    location: "Elm Street",
    status: "in-progress",
    priority: "high",
    dateReported: "2024-01-11",
    assignedDept: "Water Dept",
    description: "Water main leak flooding street",
    reporter: "Lisa Brown"
  },
  {
    id: "ISS-2024-006",
    category: "Sidewalk",
    location: "Pine Ave",
    status: "open",
    priority: "medium",
    dateReported: "2024-01-10",
    assignedDept: "Public Works",
    description: "Cracked sidewalk creating trip hazard",
    reporter: "Tom Wilson"
  },
  {
    id: "ISS-2024-007",
    category: "Noise Complaint",
    location: "Residential District",
    status: "resolved",
    priority: "low",
    dateReported: "2024-01-09",
    assignedDept: "Code Enforcement",
    description: "Construction noise after hours",
    reporter: "Maria Garcia"
  },
  {
    id: "ISS-2024-008",
    category: "Parking",
    location: "City Center",
    status: "open",
    priority: "low",
    dateReported: "2024-01-08",
    assignedDept: "Parking Authority",
    description: "Broken parking meter",
    reporter: "David Lee"
  }
];

interface IssuesPageProps {
  onIssueClick: (issue: Issue) => void;
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

export function IssuesPage({ onIssueClick }: IssuesPageProps) {
  const [issues, setIssues] = useState(mockIssuesData);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dateReported");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and search logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
    const matchesDepartment = departmentFilter === "all" || issue.assignedDept === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    const aVal = a[sortBy as keyof Issue];
    const bVal = b[sortBy as keyof Issue];
    
    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(sortedIssues.map(issue => issue.id));
    } else {
      setSelectedIssues([]);
    }
  };

  const handleSelectIssue = (issueId: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues([...selectedIssues, issueId]);
    } else {
      setSelectedIssues(selectedIssues.filter(id => id !== issueId));
    }
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    setIssues(issues.map(issue => 
      selectedIssues.includes(issue.id) 
        ? { ...issue, status: newStatus as "open" | "in-progress" | "resolved" }
        : issue
    ));
    setSelectedIssues([]);
  };

  const departments = [...new Set(issues.map(issue => issue.assignedDept))];
  const isAllSelected = selectedIssues.length === sortedIssues.length && sortedIssues.length > 0;
  const isSomeSelected = selectedIssues.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Issues Management</h1>
          <p className="text-muted-foreground">
            Manage and track all reported civic issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search issues by ID, category, location, description, or reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateReported-desc">Newest First</SelectItem>
                <SelectItem value="dateReported-asc">Oldest First</SelectItem>
                <SelectItem value="priority-desc">High Priority First</SelectItem>
                <SelectItem value="status-asc">Status A-Z</SelectItem>
                <SelectItem value="location-asc">Location A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {sortedIssues.length} of {issues.length} issues
            </span>
            {isSomeSelected && (
              <div className="flex items-center gap-3">
                <span>{selectedIssues.length} selected</span>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("in-progress")}
                  >
                    Mark In Progress
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("resolved")}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Issues Table */}
      <Card className="p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    indeterminate={isSomeSelected && !isAllSelected}
                  />
                </TableHead>
                <TableHead className="w-32">Issue ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date Reported</TableHead>
                <TableHead>Assigned Department</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedIssues.map((issue) => (
                <TableRow 
                  key={issue.id} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIssues.includes(issue.id)}
                      onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium"
                    onClick={() => onIssueClick(issue)}
                  >
                    {issue.id}
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    {issue.category}
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {issue.location}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(issue.status)}
                    >
                      {issue.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    <Badge 
                      variant="secondary" 
                      className={getPriorityColor(issue.priority)}
                    >
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(issue.dateReported).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      {issue.assignedDept}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onIssueClick(issue)}>
                    {issue.reporter}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onIssueClick(issue)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Issue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedIssues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issues found matching your filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
              setDepartmentFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}