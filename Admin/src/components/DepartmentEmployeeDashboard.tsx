import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Calendar, MapPin, CheckCircle2, Clock, AlertTriangle, Search } from "lucide-react";
import { Issue } from "./IssueTable";
import { CityMapView } from "./CityMapView";
import { Textarea } from "./ui/textarea";

interface DepartmentEmployeeDashboardProps {
  onIssueClick: (issue: Issue) => void;
  userDepartment: string;
  userName: string;
}

const mockIssues: (Issue & { assignedEmployee?: string })[] = [
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
    assignedEmployee: "Ravi Kumar"
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
    assignedEmployee: "Ravi Kumar"
  }
];

// Broader department issues so the map can display department-only issues
const allDepartmentIssues: Issue[] = [
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
  },
  {
    id: "ISS-2024-021",
    category: "Street Light",
    location: "Hill Road",
    status: "open",
    priority: "low",
    dateReported: "2024-01-18",
    assignedDept: "Water Department",
    description: "Light flickering intermittently",
    reporter: "Mary Stone",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function DepartmentEmployeeDashboard({ onIssueClick, userDepartment, userName }: DepartmentEmployeeDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [issues, setIssues] = useState<(Issue & { assignedEmployee?: string; notes?: string })[]>(mockIssues);

  const myIssues = useMemo(() => issues.filter(i => (i.assignedDept === userDepartment) && (i.assignedEmployee?.toLowerCase() === userName.toLowerCase())), [issues, userDepartment, userName]);

  const filteredIssues = myIssues.filter(issue => {
    const matchesSearch = issue.id.toLowerCase().includes(searchTerm.toLowerCase()) || issue.category.toLowerCase().includes(searchTerm.toLowerCase()) || issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = myIssues.length;
  const open = myIssues.filter(i => i.status === "open").length;
  const inProgress = myIssues.filter(i => i.status === "in-progress").length;
  const resolved = myIssues.filter(i => i.status === "resolved").length;

  const departmentOnlyIssues = useMemo(() => allDepartmentIssues.filter(i => i.assignedDept === userDepartment), [userDepartment]);

  const handleStatusUpdate = (issueId: string, newStatus: "open" | "in-progress" | "resolved") => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
  };

  const handleNotesChange = (issueId: string, notes: string) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, notes } : i));
  };

  const handleMarkerClick = (markerId: string) => {
    const found = myIssues.find(i => i.id === markerId);
    if (found) onIssueClick(found);
  };

  // HOD assigned tasks for this employee
  const [tasks, setTasks] = useState<{ id: string; title: string; status: "pending" | "in-progress" | "done"; notes?: string }[]>([
    { id: "T-101", title: "Survey pothole on Main St", status: "pending" },
    { id: "T-102", title: "Meet contractor about sidewalk fix", status: "in-progress" },
  ]);

  const updateTaskStatus = (taskId: string, status: "pending" | "in-progress" | "done") => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };
  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, notes } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1>{userDepartment} - My Work</h1>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">Department Employee</Badge>
          </div>
          <p className="text-muted-foreground">Issues assigned to {userName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Open</p>
              <p className="text-2xl mb-1">{open}</p>
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
              <p className="text-2xl mb-1">{inProgress}</p>
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
              <p className="text-2xl mb-1">{resolved}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Assigned</p>
              <p className="text-2xl mb-1">{total}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Split view: Map left, My Issues right */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CityMapView onMarkerClick={handleMarkerClick} issues={departmentOnlyIssues} />

        <Card className="p-6">
          <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search my issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Issue ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[220px]">My Notes / Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map(issue => (
                  <TableRow key={issue.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onIssueClick(issue)}>
                    <TableCell className="font-medium">{issue.id}</TableCell>
                    <TableCell>{issue.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {issue.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={issue.status} onValueChange={(v) => handleStatusUpdate(issue.id, v as "open" | "in-progress" | "resolved")}>
                        <SelectTrigger className={`w-36 border-0 ${getStatusColor(issue.status)}`} onClick={(e) => e.stopPropagation()}>
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
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">{issue.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(issue.dateReported).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Textarea value={issue.notes || ""} onChange={(e) => handleNotesChange(issue.id, e.target.value)} placeholder="Progress notes..." className="min-h-10" onClick={(e) => e.stopPropagation()} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </div>
        </Card>
      </div>

      {/* Tasks from HOD */}
      <Card className="p-6">
        <h3 className="mb-4">Tasks from HOD</h3>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Task ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-48">Status</TableHead>
                <TableHead className="w-[260px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Select value={task.status} onValueChange={(v) => updateTaskStatus(task.id, v as any)}>
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Textarea value={task.notes || ""} onChange={(e) => updateTaskNotes(task.id, e.target.value)} placeholder="Add notes or completion details..." />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Department-only map moved to split view above */}
    </div>
  );
}


