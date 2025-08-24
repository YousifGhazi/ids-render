"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@mantine/core";

// Fix for default markers in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Mapbox access token - Replace with your actual token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Iraq center coordinates
const IRAQ_CENTER: [number, number] = [33.3152, 44.3661];
const DEFAULT_ZOOM = 6;

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(IRAQ_CENTER, DEFAULT_ZOOM);
    mapInstanceRef.current = map;

    // Try Mapbox first, fall back to OpenStreetMap if it fails
    let tileLayer: L.TileLayer;

    if (MAPBOX_ACCESS_TOKEN) {
      tileLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`,
        {
          tileSize: 512,
          zoomOffset: -1,
          attribution:
            '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        }
      );

      // Handle tile load errors and fallback to OSM
      tileLayer.on("tileerror", () => {
        console.warn("Mapbox tiles failed, falling back to OpenStreetMap");
        tileLayer.remove();
        const osmTileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        );
        osmTileLayer.addTo(map);
      });
    } else {
      // Use OpenStreetMap as default
      tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      );
    }

    tileLayer.addTo(map);

    // Set map as loaded
    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Box style={{ position: "relative", height: "100%", width: "100%" }}>
      {!mapLoaded && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        >
          Loading map...
        </Box>
      )}
      <div
        ref={mapRef}
        style={{
          height: "100%",
          width: "100%",
          zIndex: 1,
        }}
      />
    </Box>
  );
}
