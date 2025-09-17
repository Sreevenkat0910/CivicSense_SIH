import { Card } from "./ui/card";
import { MapPin, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface MapMarker {
  id: string;
  x: number;
  y: number;
  status: "open" | "in-progress" | "resolved";
  category: string;
  priority: "low" | "medium" | "high";
}

const mockMarkers: MapMarker[] = [
  { id: "1", x: 25, y: 30, status: "open", category: "Pothole", priority: "high" },
  { id: "2", x: 45, y: 20, status: "in-progress", category: "Street Light", priority: "medium" },
  { id: "3", x: 65, y: 45, status: "resolved", category: "Graffiti", priority: "low" },
  { id: "4", x: 30, y: 60, status: "open", category: "Traffic Signal", priority: "high" },
  { id: "5", x: 70, y: 25, status: "in-progress", category: "Water Main", priority: "high" },
  { id: "6", x: 55, y: 70, status: "open", category: "Sidewalk", priority: "medium" },
  { id: "7", x: 80, y: 50, status: "resolved", category: "Noise Complaint", priority: "low" },
  { id: "8", x: 15, y: 80, status: "open", category: "Pothole", priority: "medium" },
];

const getMarkerColor = (status: string, priority: string) => {
  if (status === "resolved") return "text-green-600";
  if (status === "in-progress") return "text-blue-600";
  if (priority === "high") return "text-red-600";
  if (priority === "medium") return "text-orange-600";
  return "text-gray-600";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return CheckCircle2;
    case "in-progress":
      return Clock;
    default:
      return AlertCircle;
  }
};

interface CityMapViewProps {
  onMarkerClick: (markerId: string) => void;
}

export function CityMapView({ onMarkerClick }: CityMapViewProps) {
  return (
    <Card className="p-6 h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3>City Issue Map</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
        {/* Simple city grid background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Street representations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-300"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-300"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-300"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-300"></div>
        </div>
        
        {/* Issue markers */}
        {mockMarkers.map((marker) => {
          const StatusIcon = getStatusIcon(marker.status);
          return (
            <button
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
              }}
              onClick={() => onMarkerClick(marker.id)}
            >
              <div className="relative">
                <MapPin className={`w-6 h-6 ${getMarkerColor(marker.status, marker.priority)}`} />
                <StatusIcon className="w-3 h-3 absolute top-0.5 left-1/2 transform -translate-x-1/2 text-white" />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}