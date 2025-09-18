import React from "react";
import { Card } from "./ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import { Issue } from "./IssueTable";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CityMapViewProps {
  onMarkerClick: (markerId: string) => void;
  issues: Issue[];
}

const defaultCenter: [number, number] = [17.385, 78.4867];

function SetViewOnMount({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
    map.scrollWheelZoom.enable();
    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.touchZoom.enable();
    map.boxZoom.enable();
  }, [center, zoom, map]);
  return null;
}

// Create custom colored markers for different issue statuses
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const getMarkerIcon = (status: string) => {
  switch (status) {
    case "open":
      return createCustomIcon("#ef4444"); // red-500
    case "in-progress":
      return createCustomIcon("#3b82f6"); // blue-500
    case "resolved":
      return createCustomIcon("#22c55e"); // green-500
    default:
      return createCustomIcon("#6b7280"); // gray-500
  }
};

// Mock coordinates for issues (in a real app, these would come from the issue data)
const getIssueCoordinates = (issueId: string): [number, number] => {
  const coordinates: { [key: string]: [number, number] } = {
    "ISS-2024-001": [17.385, 78.4867],
    "ISS-2024-002": [17.40, 78.49],
    "ISS-2024-003": [17.39, 78.47],
    "ISS-2024-004": [17.38, 78.48],
    "ISS-2024-005": [17.41, 78.485],
  };
  return coordinates[issueId] || [17.385, 78.4867];
};

export function CityMapView({ onMarkerClick, issues }: CityMapViewProps) {
  return (
    <Card className="p-6 h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3>City Issue Map</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        <MapContainer 
          style={{ 
            height: "100%", 
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0
          }}
        >
          <SetViewOnMount center={defaultCenter} zoom={12} />
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {issues.map(issue => {
            const coordinates = getIssueCoordinates(issue.id);
            return (
              <Marker 
                key={issue.id} 
                position={coordinates}
                icon={getMarkerIcon(issue.status)}
                eventHandlers={{
                  click: () => onMarkerClick(issue.id)
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold text-sm">{issue.category}</h4>
                    <p className="text-xs text-gray-600 mb-1">{issue.location}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        issue.status === 'open' ? 'bg-red-100 text-red-800' :
                        issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.status.replace("-", " ")}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Reported: {new Date(issue.dateReported).toLocaleDateString()}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
}