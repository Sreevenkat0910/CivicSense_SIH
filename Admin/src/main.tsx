
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "./styles/map-background.css";

createRoot(document.getElementById("root")!).render(<App />);
  