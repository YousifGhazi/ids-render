"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@mantine/core";
import type { OrganizationMapData, MapState, BranchData } from "../types";
import { mockOrganizations } from "./mockData";
import { createOrganizationIcon, createBranchIcon } from "./mapIcons";
import OrganizationInfoPanel from "./OrganizationInfoPanel";

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

// Colors
const COLORS = {
  DEFAULT: "#ff8c00", // Orange
  HOVER: "#22c55e",   // Green
  SELECTED: "#3b82f6" // Blue
};

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const organizationMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const branchMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapState, setMapState] = useState<MapState>({
    selectedOrganization: null,
    hoveredOrganization: null,
  });

  // Update marker colors based on state
  const updateMarkerColors = useCallback((organization: OrganizationMapData, isHovered: boolean, isSelected: boolean) => {
    const color = isSelected ? COLORS.SELECTED : (isHovered ? COLORS.HOVER : COLORS.DEFAULT);
    
    // Update organization marker
    const orgMarker = organizationMarkersRef.current.get(organization.id);
    if (orgMarker) {
      orgMarker.setIcon(createOrganizationIcon(color, isHovered || isSelected));
    }

    // Update branch markers
    organization.branches.forEach(branch => {
      const branchMarker = branchMarkersRef.current.get(branch.id);
      if (branchMarker) {
        branchMarker.setIcon(createBranchIcon(color, isHovered || isSelected));
      }
    });
  }, []);

  // Handle organization hover with timeout
  const handleOrganizationHover = useCallback((organization: OrganizationMapData) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setMapState(prev => {
      // Only update if it's a different organization or no organization is hovered
      if (prev.hoveredOrganization?.id !== organization.id) {
        // Reset previous hovered organization
        if (prev.hoveredOrganization) {
          updateMarkerColors(prev.hoveredOrganization, false, prev.selectedOrganization?.id === prev.hoveredOrganization.id);
        }
        // Set new hovered organization
        updateMarkerColors(organization, true, prev.selectedOrganization?.id === organization.id);
        return { ...prev, hoveredOrganization: organization };
      }
      return prev;
    });
  }, [updateMarkerColors]);

  // Handle organization unhover with delay
  const handleOrganizationUnhover = useCallback((organization: OrganizationMapData) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Add a small delay before actually removing hover to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setMapState(prev => {
        if (prev.hoveredOrganization?.id === organization.id) {
          updateMarkerColors(organization, false, prev.selectedOrganization?.id === organization.id);
          return { ...prev, hoveredOrganization: null };
        }
        return prev;
      });
    }, 100); // 100ms delay
  }, [updateMarkerColors]);

  // Handle organization selection
  const handleOrganizationSelect = useCallback((organization: OrganizationMapData) => {
    setMapState(prev => {
      const isAlreadySelected = prev.selectedOrganization?.id === organization.id;
      const newSelected = isAlreadySelected ? null : organization;
      
      // Update colors for previously selected organization
      if (prev.selectedOrganization && !isAlreadySelected) {
        updateMarkerColors(prev.selectedOrganization, prev.hoveredOrganization?.id === prev.selectedOrganization.id, false);
      }
      
      // Update colors for newly selected organization
      if (newSelected) {
        updateMarkerColors(newSelected, prev.hoveredOrganization?.id === newSelected.id, true);
      }
      
      return { ...prev, selectedOrganization: newSelected };
    });
  }, [updateMarkerColors]);

  // Create organization marker
  const createOrganizationMarker = useCallback((organization: OrganizationMapData) => {
    if (!mapInstanceRef.current) return;

    const marker = L.marker(
      [organization.headquarters.lat, organization.headquarters.lng],
      { icon: createOrganizationIcon(COLORS.DEFAULT) }
    );

    // Add popup
    marker.bindPopup(`
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <strong style="font-size: 14px;">${organization.name}</strong><br/>
        <span style="color: #666; font-size: 12px;">${organization.description}</span><br/>
        <span style="color: #999; font-size: 11px;">${organization.employees.toLocaleString()} employees</span>
      </div>
    `);

    // Add event listeners
    marker.on('mouseover', () => {
      handleOrganizationHover(organization);
    });

    marker.on('mouseout', () => {
      handleOrganizationUnhover(organization);
    });

    marker.on('click', () => {
      handleOrganizationSelect(organization);
    });

    marker.addTo(mapInstanceRef.current);
    organizationMarkersRef.current.set(organization.id, marker);
  }, [handleOrganizationHover, handleOrganizationUnhover, handleOrganizationSelect]);

  // Create branch marker
  const createBranchMarker = useCallback((branch: BranchData, organization: OrganizationMapData) => {
    if (!mapInstanceRef.current) return;

    const marker = L.marker(
      [branch.lat, branch.lng],
      { icon: createBranchIcon(COLORS.DEFAULT) }
    );

    // Add popup
    marker.bindPopup(`
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <strong style="font-size: 12px;">${branch.name}</strong><br/>
        <span style="color: #666; font-size: 11px;">Branch of ${organization.name}</span><br/>
        <span style="color: #999; font-size: 10px;">${branch.employees.toLocaleString()} employees</span>
      </div>
    `);

    // Add event listeners for organization hover
    marker.on('mouseover', () => {
      handleOrganizationHover(organization);
    });

    marker.on('mouseout', () => {
      handleOrganizationUnhover(organization);
    });

    marker.on('click', () => {
      handleOrganizationSelect(organization);
    });

    marker.addTo(mapInstanceRef.current);
    branchMarkersRef.current.set(branch.id, marker);
  }, [handleOrganizationHover, handleOrganizationUnhover, handleOrganizationSelect]);

  // Initialize markers
  const initializeMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    organizationMarkersRef.current.forEach(marker => marker.remove());
    branchMarkersRef.current.forEach(marker => marker.remove());
    organizationMarkersRef.current.clear();
    branchMarkersRef.current.clear();

    // Create organization and branch markers
    mockOrganizations.forEach(organization => {
      createOrganizationMarker(organization);
      
      // Create branch markers
      organization.branches.forEach(branch => {
        createBranchMarker(branch, organization);
      });
    });
  }, [createOrganizationMarker, createBranchMarker]);

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

    // Initialize markers after a short delay to ensure map is ready
    setTimeout(() => {
      initializeMarkers();
      setMapLoaded(true);
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        // Clean up timeouts
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        
        // Clean up markers
        organizationMarkersRef.current.forEach(marker => marker.remove());
        branchMarkersRef.current.forEach(marker => marker.remove());
        organizationMarkersRef.current.clear();
        branchMarkersRef.current.clear();
        
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMarkers]);

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
      <OrganizationInfoPanel 
        selectedOrganization={mapState.selectedOrganization}
        hoveredOrganization={mapState.hoveredOrganization}
      />
    </Box>
  );
}
