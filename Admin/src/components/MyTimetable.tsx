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
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  FileText,
  MoreHorizontal,
  Filter,
  Search
} from "lucide-react";

// Mock data for timetable entries
const mockTimetableEntries = [
  {
    id: "tt-001",
    title: "Team Meeting",
    type: "meeting",
    date: "2024-01-20",
    startTime: "09:00",
    endTime: "10:00",
    location: "Conference Room A",
    description: "Weekly team sync",
    status: "confirmed",
    priority: "medium"
  },
  {
    id: "tt-002",
    title: "Site Inspection",
    type: "field-work",
    date: "2024-01-20",
    startTime: "14:00",
    endTime: "16:00",
    location: "Main Street Construction",
    description: "Inspect road repair progress",
    status: "confirmed",
    priority: "high"
  },
  {
    id: "tt-003",
    title: "Budget Review",
    type: "meeting",
    date: "2024-01-21",
    startTime: "11:00",
    endTime: "12:30",
    location: "Office",
    description: "Monthly budget review",
    status: "tentative",
    priority: "medium"
  },
  {
    id: "tt-004",
    title: "Equipment Maintenance",
    type: "maintenance",
    date: "2024-01-22",
    startTime: "08:00",
    endTime: "12:00",
    location: "Equipment Yard",
    description: "Monthly equipment check",
    status: "confirmed",
    priority: "low"
  }
];

// Mock job assignments for department employees
const mockJobAssignments = [
  {
    id: "job-001",
    title: "Emergency Pothole Repair",
    department: "Public Works",
    assignedBy: "Head of Department",
    date: "2024-01-23",
    startTime: "07:00",
    endTime: "11:00",
    location: "Highway 101",
    description: "Urgent pothole repair on main highway",
    priority: "high",
    status: "pending", // pending, accepted, rejected
    estimatedHours: 4,
    requiredSkills: ["Road Repair", "Equipment Operation"]
  },
  {
    id: "job-002",
    title: "Street Light Maintenance",
    department: "Public Works",
    assignedBy: "Head of Department",
    date: "2024-01-24",
    startTime: "13:00",
    endTime: "17:00",
    location: "Downtown Area",
    description: "Routine street light maintenance",
    priority: "medium",
    status: "pending",
    estimatedHours: 4,
    requiredSkills: ["Electrical Work", "Safety Protocols"]
  },
  {
    id: "job-003",
    title: "Drainage Inspection",
    department: "Public Works",
    assignedBy: "Head of Department",
    date: "2024-01-25",
    startTime: "09:00",
    endTime: "15:00",
    location: "Residential Zone",
    description: "Inspect and clean drainage systems",
    priority: "medium",
    status: "accepted",
    estimatedHours: 6,
    requiredSkills: ["Drainage Systems", "Safety Equipment"]
  }
];

interface MyTimetableProps {
  userRole: "mandal-admin" | "department" | "department-employee";
  userName?: string;
  userDepartment?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-50 text-green-700";
    case "tentative":
      return "bg-yellow-50 text-yellow-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    case "pending":
      return "bg-blue-50 text-blue-700";
    case "accepted":
      return "bg-green-50 text-green-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700";
    case "medium":
      return "bg-orange-50 text-orange-700";
    case "low":
      return "bg-gray-50 text-gray-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return <User className="w-4 h-4" />;
    case "field-work":
      return <MapPin className="w-4 h-4" />;
    case "maintenance":
      return <FileText className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

export function MyTimetable({ userRole, userName, userDepartment }: MyTimetableProps) {
  const [timetableEntries, setTimetableEntries] = useState(mockTimetableEntries);
  const [jobAssignments, setJobAssignments] = useState(mockJobAssignments);
  const [activeTab, setActiveTab] = useState<"schedule" | "availability" | "jobs">("schedule");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter entries based on search and status
  const filteredEntries = timetableEntries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter job assignments
  const filteredJobs = jobAssignments.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate availability
  const getAvailabilityForDate = (date: string) => {
    const dayEntries = timetableEntries.filter(entry => entry.date === date);
    const totalHours = 8; // Assuming 8-hour work day
    let bookedHours = 0;
    
    dayEntries.forEach(entry => {
      const start = parseInt(entry.startTime.split(':')[0]);
      const end = parseInt(entry.endTime.split(':')[0]);
      bookedHours += (end - start);
    });
    
    return {
      totalHours,
      bookedHours,
      freeHours: totalHours - bookedHours,
      percentage: Math.round((bookedHours / totalHours) * 100)
    };
  };

  const handleJobAction = (jobId: string, action: "accept" | "reject") => {
    setJobAssignments(jobs => 
      jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: action === "accept" ? "accepted" : "rejected" }
          : job
      )
    );
  };

  const renderSchedule = () => (
    <div className="space-y-6">
      {/* Schedule Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>My Schedule</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search schedule entries..."
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
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="tentative">Tentative</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(entry.type)}
                      <span className="capitalize">{entry.type.replace('-', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {entry.startTime} - {entry.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {entry.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getPriorityColor(entry.priority)}>
                      {entry.priority}
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
                          Edit Entry
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Entry
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

  const renderAvailability = () => {
    const availability = getAvailabilityForDate(selectedDate);
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Availability Check</h3>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{availability.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{availability.bookedHours}h</div>
              <div className="text-sm text-muted-foreground">Booked Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{availability.freeHours}h</div>
              <div className="text-sm text-muted-foreground">Free Hours</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Availability</span>
              <span>{availability.percentage}% booked</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${availability.percentage > 80 ? 'bg-red-500' : availability.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${availability.percentage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Schedule for {new Date(selectedDate).toLocaleDateString()}</h3>
          <div className="space-y-3">
            {timetableEntries
              .filter(entry => entry.date === selectedDate)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(entry.type)}
                    <div>
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.startTime} - {entry.endTime} • {entry.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(entry.status)}>
                    {entry.status}
                  </Badge>
                </div>
              ))}
            {timetableEntries.filter(entry => entry.date === selectedDate).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No entries scheduled for this date
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderJobAssignments = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Job Assignments</h3>
          <Badge variant="outline">
            {filteredJobs.filter(job => job.status === "pending").length} Pending
          </Badge>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search job assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.assignedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div>{new Date(job.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.startTime} - {job.endTime}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getPriorityColor(job.priority)}>
                      {job.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleJobAction(job.id, "accept")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleJobAction(job.id, "reject")}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    )}
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
          <h1>My Timetable</h1>
          <p className="text-muted-foreground">
            Manage your schedule, check availability, and handle job assignments
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {userRole === "mandal-admin" ? "Mandal Admin" : 
           userRole === "department" ? "Head of Department" : 
           "Department Employee"}
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "schedule" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("schedule")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule
        </Button>
        <Button
          variant={activeTab === "availability" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("availability")}
        >
          <Clock className="w-4 h-4 mr-2" />
          Availability
        </Button>
        {userRole === "department-employee" && (
          <Button
            variant={activeTab === "jobs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("jobs")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Job Assignments
          </Button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === "schedule" && renderSchedule()}
      {activeTab === "availability" && renderAvailability()}
      {userRole === "department-employee" && activeTab === "jobs" && renderJobAssignments()}
    </div>
  );
}
