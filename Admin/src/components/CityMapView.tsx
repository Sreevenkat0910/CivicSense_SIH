import React from "react";
import { Card } from "./ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

interface CityMapViewProps {
  onMarkerClick: (markerId: string) => void;
}

const defaultCenter: [number, number] = [17.385, 78.4867];

function SetViewOnMount({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const issueMarkers = [
  { id: "1", position: [17.385, 78.4867] as [number, number], title: "Pothole - High" },
  { id: "2", position: [17.40, 78.49] as [number, number], title: "Street Light - Medium" },
  { id: "3", position: [17.39, 78.47] as [number, number], title: "Graffiti - Low" },
];

export function CityMapView({ onMarkerClick }: CityMapViewProps) {
  return (
    <Card className="p-6 h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3>City Issue Map</h3>
      </div>
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        <MapContainer 
          style={{ height: "100%", width: "100%" }}
        >
          <SetViewOnMount center={defaultCenter} zoom={12} />
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {issueMarkers.map(m => (
            <Marker 
              key={m.id} 
              position={m.position}
            >
              <Popup>{m.title}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
}