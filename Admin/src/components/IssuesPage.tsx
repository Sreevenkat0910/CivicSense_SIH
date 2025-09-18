import { useState, useEffect } from "react";
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
  Plus,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Issue } from "./IssueTable";
import { NewReportForm } from "./NewReportForm";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface IssuesPageProps {
  onIssueClick: (issue: Issue) => void;
}

interface Report {
  id: string;
  report_id: string;
  title: string;
  category: string;
  description: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  department: string;
  mandal_area?: string;
  priority: string;
  status: string;
  reporter_email?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution_notes?: string;
  users?: {
    user_id: string;
    full_name: string;
    email: string;
    mobile?: string;
  };
}

export function IssuesPage({ onIssueClick }: IssuesPageProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const itemsPerPage = 20;

  // Load reports from API
  const loadReports = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params: any = {
        page,
        limit: itemsPerPage,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      // Apply filters based on user role
      if (user?.user_types?.type_name === 'department' && user.department) {
        params.department = user.department;
      } else if (user?.user_types?.type_name === 'mandal-admin' && user.mandal_area) {
        params.mandal_area = user.mandal_area;
      }

      const response = await ApiService.getReports(params);
      
      if (response.success) {
        setReports(response.data.reports || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalReports(response.data.pagination?.total || 0);
      } else {
        setError(response.error || 'Failed to load reports');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadReports();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.report_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(report => report.department === departmentFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, priorityFilter, departmentFilter, categoryFilter]);

  // Convert report to Issue format
  const convertToIssue = (report: Report): Issue => ({
    id: report.report_id,
    category: report.category,
    location: report.location_text || `${report.latitude}, ${report.longitude}`,
    status: report.status,
    priority: report.priority,
    dateReported: new Date(report.created_at).toLocaleDateString(),
    assignedDept: report.department,
    description: report.description,
    reporter: report.users?.full_name || report.reporter_email || 'Unknown'
  });

  // Handle status update
  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      const response = await ApiService.updateReportStatus(reportId, {
        status: newStatus,
        assigned_to: user?.full_name || 'System',
        resolution_notes: `Status updated to ${newStatus}`
      });

      if (response.success) {
        // Refresh the reports
        await loadReports(currentPage, true);
      } else {
        setError(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadReports(currentPage, true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadReports(page);
  };

  // Get unique values for filters
  const uniqueDepartments = [...new Set(reports.map(r => r.department))];
  const uniqueCategories = [...new Set(reports.map(r => r.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'triaged': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issue Reports</h1>
          <p className="text-muted-foreground">
            Manage and track civic issue reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <NewReportForm onReportCreated={handleRefresh} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="triaged">Triaged</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {uniqueDepartments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Reports ({filteredReports.length} of {totalReports})
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {report.report_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{report.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.location_text || 'Location not specified'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(report.priority)}>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.department}</TableCell>
                    <TableCell>{report.users?.full_name || report.reporter_email}</TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => onIssueClick(convertToIssue(report))}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'in_progress')}>
                            <Clock className="w-4 h-4 mr-2" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'resolved')}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalReports)} of {totalReports} reports
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}