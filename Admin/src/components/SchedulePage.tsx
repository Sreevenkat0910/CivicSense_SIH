import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  CalendarIcon, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from "date-fns";
import ApiService from "../services/api";

// Helper function for available departments
const getAvailableDepartments = (role: string) => {
  if (role === "admin") {
    return ["Water Department", "Electricity Department", "Sanitation Department", "Roads Department", "Health Department"];
  } else if (role === "mandal-admin") {
    return ["Water Department", "Electricity Department", "Sanitation Department", "Roads Department", "Health Department"];
  }
  return [];
};

interface SchedulePageProps {
  userRole: "admin" | "department" | "mandal-admin";
  userDepartment?: string;
  mandalName?: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export function SchedulePage({ userRole, userDepartment, mandalName }: SchedulePageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getSchedules();
        
        if (response.success) {
          setScheduleItems(response.data.schedules || []);
        } else {
          setError(response.error || 'Failed to fetch schedules');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Schedules fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const getFilteredItems = () => {
    const today = new Date();
    switch (activeTab) {
      case "yesterday":
        return scheduleItems.filter(item => {
          const itemDate = new Date(item.start_time);
          return isYesterday(itemDate);
        });
      case "today":
        return scheduleItems.filter(item => {
          const itemDate = new Date(item.start_time);
          return isToday(itemDate);
        });
      case "tomorrow":
        return scheduleItems.filter(item => {
          const itemDate = new Date(item.start_time);
          return isTomorrow(itemDate);
        });
      default:
        return scheduleItems.filter(item => {
          const itemDate = new Date(item.start_time);
          return itemDate >= startOfDay(selectedDate) && itemDate <= endOfDay(selectedDate);
        });
    }
  };

  const getRecurringColor = (isRecurring: boolean) => {
    return isRecurring ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTimeColor = (startTime: string) => {
    const now = new Date();
    const scheduleTime = new Date(startTime);
    const diffHours = (scheduleTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return "bg-gray-100 text-gray-800 border-gray-200"; // Past
    if (diffHours < 2) return "bg-red-100 text-red-800 border-red-200"; // Soon
    if (diffHours < 24) return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Today
    return "bg-green-100 text-green-800 border-green-200"; // Future
  };

  const getTimeIcon = (startTime: string) => {
    const now = new Date();
    const scheduleTime = new Date(startTime);
    const diffHours = (scheduleTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return <Clock className="h-4 w-4" />; // Past
    if (diffHours < 2) return <AlertCircle className="h-4 w-4" />; // Soon
    return <Clock className="h-4 w-4" />; // Future
  };

  const handleAddSchedule = async (scheduleData: any) => {
    try {
      const response = await ApiService.createSchedule(scheduleData);
      if (response.success) {
        // Refresh schedules
        const refreshResponse = await ApiService.getSchedules();
        if (refreshResponse.success) {
          setScheduleItems(refreshResponse.data.schedules || []);
        }
        setIsAddDialogOpen(false);
      } else {
        setError(response.error || 'Failed to create schedule');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Create schedule error:', err);
    }
  };

  const handleEditSchedule = async (scheduleId: string, scheduleData: any) => {
    try {
      const response = await ApiService.updateSchedule(scheduleId, scheduleData);
      if (response.success) {
        // Refresh schedules
        const refreshResponse = await ApiService.getSchedules();
        if (refreshResponse.success) {
          setScheduleItems(refreshResponse.data.schedules || []);
        }
        setIsEditDialogOpen(false);
        setEditingItem(null);
      } else {
        setError(response.error || 'Failed to update schedule');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Update schedule error:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const response = await ApiService.deleteSchedule(scheduleId);
      if (response.success) {
        // Refresh schedules
        const refreshResponse = await ApiService.getSchedules();
        if (refreshResponse.success) {
          setScheduleItems(refreshResponse.data.schedules || []);
        }
      } else {
        setError(response.error || 'Failed to delete schedule');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Delete schedule error:', err);
    }
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedule Management</h1>
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedule Management</h1>
            <p className="text-muted-foreground">Error loading schedules</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="text-center text-red-600">
            Error: {error}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === "admin" && "System Schedule Management"}
            {userRole === "department" && `${userDepartment} Schedule Management`}
            {userRole === "mandal-admin" && `${mandalName} Mandal Schedule Management`}
          </h1>
          <p className="text-muted-foreground">
            {userRole === "admin" && "Manage work schedules and assignments across all departments"}
            {userRole === "department" && `Manage work schedules and assignments for ${userDepartment}`}
            {userRole === "mandal-admin" && `Manage work schedules and assignments across all departments in ${mandalName} Mandal`}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Schedule Item</DialogTitle>
            </DialogHeader>
            <ScheduleForm 
              userRole={userRole}
              userDepartment={userDepartment}
              onSubmit={handleAddSchedule}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selection and Schedule Items */}
      <div className="space-y-6">
        {/* Date Selection Tabs */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Select Date</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Choose Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setActiveTab("custom");
                      }
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activeTab === "yesterday" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("yesterday")}
              >
                <ChevronLeft className="h-4 w-4" />
                Yesterday
              </Button>
              <Button
                variant={activeTab === "today" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("today")}
              >
                <Clock className="h-4 w-4" />
                Today
              </Button>
              <Button
                variant={activeTab === "tomorrow" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("tomorrow")}
              >
                <ChevronRight className="h-4 w-4" />
                Tomorrow
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Items */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "yesterday" && "Yesterday's Schedule"}
              {activeTab === "today" && "Today's Schedule"}
              {activeTab === "tomorrow" && "Tomorrow's Schedule"}
              {activeTab === "custom" && `Schedule for ${format(selectedDate, "MMMM d, yyyy")}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No schedule items for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge className={getRecurringColor(item.is_recurring)}>
                            {item.is_recurring ? 'Recurring' : 'One-time'}
                          </Badge>
                          <Badge className={getTimeColor(item.start_time)}>
                            <div className="flex items-center gap-1">
                              {getTimeIcon(item.start_time)}
                              {format(new Date(item.start_time), 'HH:mm')} - {format(new Date(item.end_time), 'HH:mm')}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(item.start_time), 'MMM dd, yyyy')}
                          </div>
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {item.location}
                            </div>
                          )}
                          {item.recurrence_pattern && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {item.recurrence_pattern}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSchedule(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timetable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Daily Timetable
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hour-wise schedule view for {activeTab === "yesterday" && "Yesterday"}
              {activeTab === "today" && "Today"}
              {activeTab === "tomorrow" && "Tomorrow"}
              {activeTab === "custom" && format(selectedDate, "MMMM d, yyyy")}
            </p>
          </CardHeader>
          <CardContent>
            <TimetableView 
              scheduleItems={filteredItems}
              selectedDate={activeTab === "custom" ? selectedDate : 
                activeTab === "yesterday" ? subDays(new Date(), 1) :
                activeTab === "tomorrow" ? addDays(new Date(), 1) : new Date()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Schedule Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ScheduleForm 
              userRole={userRole}
              userDepartment={userDepartment}
              initialData={editingItem}
              onSubmit={handleEditSchedule}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ScheduleFormProps {
  userRole: "admin" | "department" | "mandal-admin";
  userDepartment?: string;
  initialData?: ScheduleItem;
  onSubmit: (data: ScheduleItem) => void;
  onCancel: () => void;
}

function ScheduleForm({ userRole, userDepartment, initialData, onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startTime: initialData ? new Date(initialData.start_time).toTimeString().slice(0, 5) : "",
    endTime: initialData ? new Date(initialData.end_time).toTimeString().slice(0, 5) : "",
    date: initialData ? new Date(initialData.start_time) : new Date(),
    priority: "medium",
    status: "pending",
    assignedTo: "",
    location: initialData?.location || "",
    department: initialData?.department || (userRole === "department" ? userDepartment : "")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to API format
    const apiData = {
      title: formData.title,
      description: formData.description,
      start_time: `${formData.date.toISOString().split('T')[0]}T${formData.startTime}:00`,
      end_time: `${formData.date.toISOString().split('T')[0]}T${formData.endTime}:00`,
      location: formData.location,
      is_recurring: false
    };
    
    console.log('Submitting schedule:', apiData);
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Schedule item title"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Department</label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            disabled={userRole === "department"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {userRole === "department" ? (
                <SelectItem value={userDepartment || ""}>{userDepartment}</SelectItem>
              ) : (
                getAvailableDepartments(userRole).map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Schedule item description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(formData.date, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  if (date) setFormData(prev => ({ ...prev, date }));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-sm font-medium">Start Time</label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Time</label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Assigned To</label>
          <Input
            value={formData.assignedTo}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            placeholder="Team or person assigned"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Work location"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update" : "Create"} Schedule
        </Button>
      </div>
    </form>
  );
}

interface TimetableViewProps {
  scheduleItems: ScheduleItem[];
  selectedDate: Date;
}

function TimetableView({ scheduleItems, selectedDate }: TimetableViewProps) {
  // Indian working hours: 9 AM to 6 PM (9:00 - 18:00)
  const workingHours = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return {
      hour,
      timeString: `${hour.toString().padStart(2, '0')}:00`,
      displayTime: `${hour}:00 ${hour < 12 ? 'AM' : hour === 12 ? 'PM' : 'PM'}`,
      endTime: `${hour + 1}:00 ${hour + 1 < 12 ? 'AM' : hour + 1 === 12 ? 'PM' : 'PM'}`
    };
  });

  const getSlotStatus = (hour: number) => {
    const hourStart = `${hour.toString().padStart(2, '0')}:00`;
    const hourEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Find schedule items that overlap with this hour
    const overlappingItems = scheduleItems.filter(item => {
      const itemStart = new Date(item.start_time).toTimeString().slice(0, 5);
      const itemEnd = new Date(item.end_time).toTimeString().slice(0, 5);
      
      // Check if there's any overlap
      return (
        (itemStart < hourEnd && itemEnd > hourStart) ||
        (itemStart === hourStart) ||
        (itemEnd === hourEnd)
      );
    });

    if (overlappingItems.length === 0) {
      return { status: 'free', items: [] };
    } else if (overlappingItems.length === 1) {
      return { status: 'filled', items: overlappingItems };
    } else {
      return { status: 'conflict', items: overlappingItems };
    }
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100';
      case 'filled':
        return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100';
      case 'conflict':
        return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';
    }
  };

  const getSlotIcon = (status: string) => {
    switch (status) {
      case 'free':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'filled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'conflict':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
          <span>Free Slot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
          <span>Conflict</span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {workingHours.map(({ hour, timeString, displayTime, endTime }) => {
          const slotStatus = getSlotStatus(hour);
          
          return (
            <div
              key={hour}
              className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${getSlotColor(slotStatus.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSlotIcon(slotStatus.status)}
                  <span className="font-medium text-sm">{displayTime}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    slotStatus.status === 'free' ? 'border-green-300 text-green-700' :
                    slotStatus.status === 'filled' ? 'border-blue-300 text-blue-700' :
                    'border-red-300 text-red-700'
                  }`}
                >
                  {slotStatus.status === 'free' ? 'Free' :
                   slotStatus.status === 'filled' ? 'Busy' : 'Conflict'}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground mb-1">
                {displayTime} - {endTime}
              </div>

              {slotStatus.items.length > 0 && (
                <div className="space-y-1">
                  {slotStatus.items.map((item) => (
                    <div key={item.id} className="text-xs">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-muted-foreground">
                        {new Date(item.start_time).toTimeString().slice(0, 5)} - {new Date(item.end_time).toTimeString().slice(0, 5)}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {item.location || 'No location'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {slotStatus.status === 'free' && (
                <div className="text-xs text-muted-foreground mt-2">
                  Available for scheduling
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Schedule Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {workingHours.filter(h => getSlotStatus(h.hour).status === 'free').length}
            </div>
            <div className="text-muted-foreground">Free Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {workingHours.filter(h => getSlotStatus(h.hour).status === 'filled').length}
            </div>
            <div className="text-muted-foreground">Scheduled Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {workingHours.filter(h => getSlotStatus(h.hour).status === 'conflict').length}
            </div>
            <div className="text-muted-foreground">Conflicts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
