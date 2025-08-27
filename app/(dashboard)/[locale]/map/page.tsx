"use client";

import { Container, Paper } from "@mantine/core";
import dynamic from "next/dynamic";

// Dynamically import the MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./_components/MapComponent"), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export default function MapPage() {
  return (
    <Paper>
      <Container
        size="xl"
        style={{ height: "calc(100vh - 125px)", padding: "10px" }}
      >
        <MapComponent />
      </Container>
    </Paper>
  );
}
