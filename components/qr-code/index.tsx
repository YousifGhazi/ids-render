"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Box } from "@mantine/core";

interface QRCodeComponentProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeComponent({
  value,
  size = 100,
  className,
}: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      const formattedValue = `ID:${value}`;

      QRCode.toCanvas(canvasRef.current, formattedValue, {
        width: size,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).catch((error) => {
        console.error("Error generating QR code:", error);
      });
    }
  }, [value, size]);

  if (!value) {
    return null;
  }

  return (
    <Box className={className}>
      <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
    </Box>
  );
}
