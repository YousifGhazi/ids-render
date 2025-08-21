"use client";

import { Box, Card, Text, Badge, Group, Stack, Avatar, Divider } from "@mantine/core";
import { IconBuilding, IconMapPin, IconUsers, IconWorldWww } from "@tabler/icons-react";
import type { OrganizationMapData, BranchData } from "../types";

interface OrganizationInfoPanelProps {
  selectedOrganization: OrganizationMapData | null;
  hoveredOrganization: OrganizationMapData | null;
}

const getTypeColor = (type: OrganizationMapData['type']) => {
  switch (type) {
    case 'company':
      return 'blue';
    case 'ministry':
      return 'red';
    case 'institution':
      return 'green';
    default:
      return 'gray';
  }
};

const getTypeLabel = (type: OrganizationMapData['type']) => {
  switch (type) {
    case 'company':
      return 'Company';
    case 'ministry':
      return 'Ministry';
    case 'institution':
      return 'Institution';
    default:
      return 'Other';
  }
};

export default function OrganizationInfoPanel({ selectedOrganization, hoveredOrganization }: OrganizationInfoPanelProps) {
  // Show hovered organization if no organization is selected, otherwise show selected
  const organization = selectedOrganization || hoveredOrganization;
  const isSelected = !!selectedOrganization;
  const isHovered = !!hoveredOrganization && !selectedOrganization;
  
  if (!organization) {
    return (
      <Card
        shadow="lg"
        padding="md"
        radius="md"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 300,
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Text size="sm" c="dimmed" ta="center">
          Select an organization to view details
        </Text>
      </Card>
    );
  }

  return (
    <Card
      shadow="lg"
      padding="md"
      radius="md"
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 320,
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack gap="md">
        {/* Status Indicator */}
        {(isSelected || isHovered) && (
          <Box>
            <Badge 
              color={isSelected ? "blue" : "gray"} 
              variant="light" 
              size="xs"
            >
              {isSelected ? "Selected" : "Hovered"}
            </Badge>
          </Box>
        )}
        
        {/* Header */}
        <Group>
          <Avatar
            src={organization.logo}
            alt={organization.name}
            size="lg"
            radius="md"
          >
            <IconBuilding size={24} />
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="lg" lineClamp={2}>
              {organization.name}
            </Text>
            <Badge color={getTypeColor(organization.type)} variant="light" size="sm">
              {getTypeLabel(organization.type)}
            </Badge>
          </Box>
        </Group>

        {/* Description */}
        {organization.description && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {organization.description}
          </Text>
        )}

        <Divider />

        {/* Details */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconMapPin size={16} color="gray" />
            <Text size="sm" lineClamp={2}>
              {organization.headquarters.address}
            </Text>
          </Group>

          <Group gap="xs">
            <IconUsers size={16} color="gray" />
            <Text size="sm">
              {organization.employees.toLocaleString()} employees
            </Text>
          </Group>

          {organization.website && (
            <Group gap="xs">
              <IconWorldWww size={16} color="gray" />
              <Text
                size="sm"
                component="a"
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--mantine-color-blue-6)" }}
              >
                {organization.website}
              </Text>
            </Group>
          )}

          {organization.revenue && (
            <Group gap="xs">
              <Text size="sm" fw={500}>
                Revenue: {organization.revenue}
              </Text>
            </Group>
          )}
        </Stack>

        {/* Branches */}
        {organization.branches.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text fw={600} size="sm" mb="xs">
                Branches ({organization.branches.length})
              </Text>
              <Stack gap="xs">
                {organization.branches.map((branch: BranchData) => (
                  <Card key={branch.id} padding="xs" radius="sm" bg="gray.0">
                    <Text fw={500} size="sm">
                      {branch.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {branch.address}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {branch.employees} employees
                    </Text>
                  </Card>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
