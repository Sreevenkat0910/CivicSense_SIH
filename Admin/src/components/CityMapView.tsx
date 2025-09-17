import React from "react";
import { Card } from "./ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CityMapViewProps {
  onMarkerClick: (markerId: string) => void;
}

const defaultCenter: [number, number] = [17.385, 78.4867];

const issueMarkers = [
  { id: "1", position: [17.385, 78.4867], title: "Pothole - High" },
  { id: "2", position: [17.40, 78.49], title: "Street Light - Medium" },
  { id: "3", position: [17.39, 78.47], title: "Graffiti - Low" },
] as const;

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function CityMapView({ onMarkerClick }: CityMapViewProps) {
  return (
    <Card className="p-6 h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3>City Issue Map</h3>
      </div>
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {issueMarkers.map(m => (
            <Marker key={m.id} position={m.position as unknown as L.LatLngExpression} icon={defaultIcon} eventHandlers={{ click: () => onMarkerClick(m.id) }}>
              <Popup>{m.title}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
}