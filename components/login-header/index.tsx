"use client";

import { Avatar, Group, Box, Text } from "@mantine/core";
import { LangSwitch } from "@/components/lang-switch";

export function LoginHeader() {
  return (
    <Group
      w="100%"
      h={60}
      px="xl"
      py="xs"
      bg="white"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: "1px solid #e9ecef",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
      justify="space-between"
    >
      {/* Left corner - Creative ID card generation logo */}
      <Group gap="sm" align="center">
        <Box
          style={{
            position: "relative",
            width: "40px",
            height: "32px",
            background: "linear-gradient(135deg, #228be6 0%, #1c7ed6 100%)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(34, 139, 230, 0.2)",
          }}
        >
          {/* Main card outline */}
          <Box
            style={{
              width: "28px",
              height: "20px",
              border: "2px solid white",
              borderRadius: "3px",
              position: "relative",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Profile circle */}
            <Box
              style={{
                width: "6px",
                height: "6px",
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "2px",
                left: "3px",
              }}
            />
            {/* Text lines */}
            <Box
              style={{
                width: "10px",
                height: "1px",
                background: "white",
                position: "absolute",
                top: "3px",
                right: "2px",
              }}
            />
            <Box
              style={{
                width: "8px",
                height: "1px",
                background: "white",
                position: "absolute",
                top: "6px",
                right: "2px",
              }}
            />
            <Box
              style={{
                width: "12px",
                height: "1px",
                background: "white",
                position: "absolute",
                bottom: "2px",
                left: "2px",
              }}
            />
          </Box>
        </Box>
        <Text
          size="lg"
          fw={700}
          c="blue.7"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          IDentity
        </Text>
      </Group>

      {/* Center - can be used for additional content if needed */}
      <div />

      {/* Right corner - Language switch and app logo */}
      <Group gap="md">
        <LangSwitch />
        <Avatar src="/assets/app-logo.jpg" alt="app logo" size="md" />
      </Group>
    </Group>
  );
}
