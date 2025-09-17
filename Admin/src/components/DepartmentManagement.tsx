import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Users,
  FileText,
  Building2,
  TrendingUp,
  UserPlus,
  Settings
} from "lucide-react";

// Mock department data
const mockDepartments = [
  {
    id: "dept-001",
    name: "Public Works",
    description: "Road maintenance, infrastructure, and public facilities",
    staffCount: 24,
    openIssues: 89,
    totalIssues: 245,
    efficiency: 92,
    head: "Rajesh Kumar",
    contactEmail: "rajesh.kumar@mandal.gov.in",
    status: "active"
  },
  {
    id: "dept-002", 
    name: "Utilities",
    description: "Electricity, water supply, and utilities management",
    staffCount: 18,
    openIssues: 45,
    totalIssues: 143,
    efficiency: 87,
    head: "Priya Sharma",
    contactEmail: "priya.sharma@mandal.gov.in",
    status: "active"
  },
  {
    id: "dept-003",
    name: "Parks & Recreation",
    description: "Parks maintenance, recreational facilities, and events",
    staffCount: 12,
    openIssues: 23,
    totalIssues: 90,
    efficiency: 94,
    head: "Amit Patel",
    contactEmail: "amit.patel@mandal.gov.in",
    status: "active"
  },
  {
    id: "dept-004",
    name: "Traffic Department",
    description: "Traffic management, signals, and road safety",
    staffCount: 15,
    openIssues: 34,
    totalIssues: 112,
    efficiency: 89,
    head: "Sunita Singh",
    contactEmail: "sunita.singh@mandal.gov.in",
    status: "active"
  },
  {
    id: "dept-005",
    name: "Water Department",
    description: "Water supply, drainage, and sewage management",
    staffCount: 21,
    openIssues: 67,
    totalIssues: 201,
    efficiency: 85,
    head: "Vikram Rao",
    contactEmail: "vikram.rao@mandal.gov.in",
    status: "active"
  },
  {
    id: "dept-006",
    name: "Code Enforcement",
    description: "Building codes, permits, and compliance monitoring",
    staffCount: 9,
    openIssues: 12,
    totalIssues: 57,
    efficiency: 96,
    head: "Meera Gupta",
    contactEmail: "meera.gupta@mandal.gov.in",
    status: "active"
  }
];

interface DepartmentManagementProps {
  onNavigate: (page: string) => void;
}

export function DepartmentManagement({ onNavigate }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState(mockDepartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-50 text-green-700";
    if (efficiency >= 85) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Department Management</h1>
          <p className="text-muted-foreground">
            Manage departments, staff assignments, and organizational structure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Create a new department in the mandal administration system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block mb-2">Department Name</label>
                  <Input placeholder="e.g., Sanitation Department" />
                </div>
                <div>
                  <label className="block mb-2">Description</label>
                  <Input placeholder="Brief description of department functions" />
                </div>
                <div>
                  <label className="block mb-2">Department Head</label>
                  <Input placeholder="Name of department head" />
                </div>
                <div>
                  <label className="block mb-2">Contact Email</label>
                  <Input placeholder="head@mandal.gov.in" type="email" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Create Department</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Departments</p>
              <p className="text-2xl mb-1">{departments.length}</p>
              <p className="text-sm text-green-600">All active</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Staff</p>
              <p className="text-2xl mb-1">
                {departments.reduce((sum, dept) => sum + dept.staffCount, 0)}
              </p>
              <p className="text-sm text-blue-600">Across all departments</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Open Issues</p>
              <p className="text-2xl mb-1">
                {departments.reduce((sum, dept) => sum + dept.openIssues, 0)}
              </p>
              <p className="text-sm text-orange-600">Require attention</p>
            </div>
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Avg Efficiency</p>
              <p className="text-2xl mb-1">
                {Math.round(departments.reduce((sum, dept) => sum + dept.efficiency, 0) / departments.length)}%
              </p>
              <p className="text-sm text-green-600">System-wide</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search departments by name, description, or head..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            Export List
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredDepartments.length} of {departments.length} departments
        </div>

        {/* Departments Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead>Staff Count</TableHead>
                <TableHead>Open Issues</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{dept.head}</p>
                      <p className="text-sm text-muted-foreground">{dept.contactEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{dept.staffCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{dept.openIssues}</span>
                      <span className="text-sm text-muted-foreground">
                        / {dept.totalIssues}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getEfficiencyColor(dept.efficiency)}
                    >
                      {dept.efficiency}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-50 text-green-700 capitalize"
                    >
                      {dept.status}
                    </Badge>
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
                          Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate("user-management")}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Manage Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Department Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No departments found matching your search.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}