import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { 
  MapPin, 
  Calendar, 
  User,
  ChevronRight,
  Filter
} from "lucide-react";

interface Issue {
  id: string;
  category: string;
  location: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  dateReported: string;
  assignedDept: string;
  description: string;
  reporter: string;
}

const mockIssues: Issue[] = [
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
];

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

interface IssueTableProps {
  onIssueClick: (issue: Issue) => void;
  onToggleFilters: () => void;
  issues?: Issue[];
}

export function IssueTable({ onIssueClick, onToggleFilters, issues = mockIssues }: IssueTableProps) {
  const [sortBy, setSortBy] = useState<string>("dateReported");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedIssues = [...issues].sort((a, b) => {
    const aVal = a[sortBy as keyof Issue];
    const bVal = b[sortBy as keyof Issue];
    
    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3>Issue Reports</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Issue ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Date Reported</TableHead>
              <TableHead>Assigned Department</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIssues.map((issue) => (
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
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(issue.status)}
                  >
                    {issue.status.replace("-", " ")}
                  </Badge>
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
                <TableCell>{issue.assignedDept}</TableCell>
                <TableCell>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export type { Issue };