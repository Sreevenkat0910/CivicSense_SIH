import { Issue } from "./IssueTable";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  UserCheck
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface IssueDetailsSidebarProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
}

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

const statusTimeline = [
  { status: "Reported", date: "Jan 15, 2024 10:30 AM", user: "Jane Smith", active: true },
  { status: "Assigned", date: "Jan 15, 2024 2:15 PM", user: "System", active: true },
  { status: "In Progress", date: "Jan 16, 2024 9:00 AM", user: "Mike Johnson", active: false },
  { status: "Resolved", date: "Pending", user: "Pending", active: false },
];

export function IssueDetailsSidebar({ issue, isOpen, onClose }: IssueDetailsSidebarProps) {
  if (!issue || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-background w-96 h-full shadow-xl overflow-y-auto">
        <Card className="h-full rounded-none border-0">
          <div className="p-6 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <h3>Issue Details</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Issue Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="mb-1">{issue.id}</h4>
                  <p className="text-muted-foreground">{issue.category}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace("-", " ")}
                  </Badge>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority} priority
                  </Badge>
                </div>
              </div>
            </div>

            {/* Location & Date */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{issue.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Reported on {new Date(issue.dateReported).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span>Assigned to {issue.assignedDept}</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="mb-3">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {issue.description}
              </p>
            </div>

            {/* Photo Placeholder */}
            <div>
              <h4 className="mb-3">Photos</h4>
              <div className="grid grid-cols-2 gap-2">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=150&fit=crop"
                  alt="Issue photo"
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=150&fit=crop"
                  alt="Issue photo"
                  className="w-full h-24 object-cover rounded-lg border"
                />
              </div>
            </div>

            <Separator />

            {/* Reporter Info */}
            <div>
              <h4 className="mb-3">Reporter Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{issue.reporter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">jane.smith@email.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">(555) 123-4567</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Timeline */}
            <div>
              <h4 className="mb-3">Status Timeline</h4>
              <div className="space-y-3">
                {statusTimeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.active ? "bg-blue-500" : "bg-gray-300"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={item.active ? "" : "text-muted-foreground"}>
                          {item.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {item.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Actions */}
            <div>
              <h4 className="mb-3">Update Status</h4>
              <div className="space-y-3">
                <Select defaultValue={issue.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select defaultValue={issue.assignedDept}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public Works">Public Works</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Parks & Rec">Parks & Recreation</SelectItem>
                    <SelectItem value="Traffic Dept">Traffic Department</SelectItem>
                    <SelectItem value="Water Dept">Water Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <h4 className="mb-3">Admin Notes</h4>
              <Textarea 
                placeholder="Add internal notes or comments..."
                className="min-h-20"
              />
            </div>
          </div>
          
          <div className="p-6 border-t sticky bottom-0 bg-background space-y-2">
            <Button className="w-full">
              Update Issue
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Reporter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}