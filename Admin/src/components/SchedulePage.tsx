import React, { useState } from "react";
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
  Calendar as CalendarIcon, 
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
import { 
  getScheduleDataForRole, 
  canManageSchedule, 
  getAvailableDepartments,
  type ScheduleItem 
} from "../data/scheduleData";

interface SchedulePageProps {
  userRole: "admin" | "department" | "mandal-admin";
  userDepartment?: string;
  mandalName?: string;
}

export function SchedulePage({ userRole, userDepartment, mandalName }: SchedulePageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => 
    getScheduleDataForRole(userRole, userDepartment, mandalName)
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const getFilteredItems = () => {
    const today = new Date();
    switch (activeTab) {
      case "yesterday":
        return scheduleItems.filter(item => isYesterday(item.date));
      case "today":
        return scheduleItems.filter(item => isToday(item.date));
      case "tomorrow":
        return scheduleItems.filter(item => isTomorrow(item.date));
      default:
        return scheduleItems.filter(item => 
          item.date >= startOfDay(selectedDate) && item.date <= endOfDay(selectedDate)
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in-progress": return <Clock className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddSchedule = (newItem: Omit<ScheduleItem, "id">) => {
    const item: ScheduleItem = {
      ...newItem,
      id: Date.now().toString()
    };
    setScheduleItems(prev => [...prev, item]);
    setIsAddDialogOpen(false);
  };

  const handleEditSchedule = (updatedItem: ScheduleItem) => {
    setScheduleItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredItems = getFilteredItems();

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
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {item.status}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.startTime} - {item.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {item.assignedTo}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canManageSchedule(userRole, item, userDepartment, mandalName) && (
                          <>
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
                          </>
                        )}
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
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    date: initialData?.date || new Date(),
    priority: initialData?.priority || "medium",
    status: initialData?.status || "pending",
    assignedTo: initialData?.assignedTo || "",
    location: initialData?.location || "",
    department: initialData?.department || (userRole === "department" ? userDepartment : "")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || ""
    } as ScheduleItem);
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
      const itemStart = item.startTime;
      const itemEnd = item.endTime;
      
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
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {item.assignedTo}
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
