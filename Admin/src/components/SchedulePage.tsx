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

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  location: string;
  department: string;
}

const mockScheduleItems: ScheduleItem[] = [
  {
    id: "1",
    title: "Road Maintenance - Main Street",
    description: "Pothole repair and resurfacing work",
    startTime: "08:00",
    endTime: "16:00",
    date: new Date(),
    priority: "high",
    status: "pending",
    assignedTo: "Public Works Team",
    location: "Main Street, Downtown",
    department: "Public Works"
  },
  {
    id: "2",
    title: "Street Light Inspection",
    description: "Routine inspection and maintenance of street lights",
    startTime: "09:00",
    endTime: "12:00",
    date: addDays(new Date(), 1),
    priority: "medium",
    status: "pending",
    assignedTo: "Electrical Team",
    location: "Oak Avenue",
    department: "Utilities"
  },
  {
    id: "3",
    title: "Traffic Signal Maintenance",
    description: "Software update and hardware check",
    startTime: "10:00",
    endTime: "14:00",
    date: subDays(new Date(), 1),
    priority: "high",
    status: "completed",
    assignedTo: "Traffic Department",
    location: "Broadway & 5th Street",
    department: "Traffic Department"
  },
  {
    id: "4",
    title: "Park Cleanup",
    description: "General cleanup and landscaping",
    startTime: "07:00",
    endTime: "11:00",
    date: addDays(new Date(), 2),
    priority: "low",
    status: "pending",
    assignedTo: "Parks & Recreation",
    location: "Central Park",
    department: "Parks & Recreation"
  }
];

export function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(mockScheduleItems);
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
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage work schedules and assignment calendars
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
              onSubmit={handleAddSchedule}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar and Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            <div className="mt-4 space-y-2">
              <Button
                variant={activeTab === "yesterday" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setActiveTab("yesterday")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Yesterday
              </Button>
              <Button
                variant={activeTab === "today" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setActiveTab("today")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button
                variant={activeTab === "tomorrow" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setActiveTab("tomorrow")}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Tomorrow
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Items */}
        <Card className="lg:col-span-2">
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Schedule Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ScheduleForm 
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
  initialData?: ScheduleItem;
  onSubmit: (data: ScheduleItem) => void;
  onCancel: () => void;
}

function ScheduleForm({ initialData, onSubmit, onCancel }: ScheduleFormProps) {
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
    department: initialData?.department || ""
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
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Public Works">Public Works</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Traffic Department">Traffic Department</SelectItem>
              <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
              <SelectItem value="Water Department">Water Department</SelectItem>
              <SelectItem value="Code Enforcement">Code Enforcement</SelectItem>
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
