"use client";

import { IDCard } from "@/features/ids/types";
import { 
  Modal, 
  Stack, 
  Text, 
  Divider, 
  Button, 
  Group, 
  Badge, 
  Paper, 
  Title, 
  Avatar,
  Box,
  Anchor,
  ScrollArea,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { IconDownload, IconExternalLink, IconCalendar, IconUser, IconPhone, IconId } from "@tabler/icons-react";
import { formatDate } from "@/utils/format";
import PolotnoExportButton, { downloadFiles } from "@/components/polotno-editor/export-button";

interface IdCardModalProps {
  idCard?: IDCard;
  opened: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    PENDING: "yellow",
    PAID: "blue", 
    APPROVED: "green",
    REJECTED: "red",
    WAITING_TO_PRINT: "orange",
    PRINTING: "grape",
    PRINTED: "cyan",
    DELIVERY_IN_PROGRESS: "indigo",
    DELIVERED: "teal",
    RETURNED: "gray"
  };
  return statusColors[status] || "gray";
};

const getFieldType = (value: any): string => {
  if (typeof value === "string") {
    // Check if it's a date
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return "date";
    }
    // Check if it's a URL/file
    if (value.startsWith("http") || value.startsWith("https")) {
      const extension = value.split('.').pop()?.toLowerCase();
      if (extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        return "image";
      }
      return "file";
    }
    // Check if it's a number
    if (!isNaN(Number(value))) {
      return "number";
    }
  }
  return "text";
};

const renderFieldValue = (key: string, value: any) => {
  const fieldType = getFieldType(value);
  
  switch (fieldType) {
    case "date":
      try {
        const date = new Date(value);
        return (
          <Group gap="xs">
            <IconCalendar size={16} />
            <Text>{formatDate(date)}</Text>
          </Group>
        );
      } catch {
        return <Text>{value}</Text>;
      }
    case "image":
      return (
        <Group gap="xs">
          <Avatar src={value} size="sm" alt={key} />
          <Anchor href={value} target="_blank" size="sm">
            View Image
            <IconExternalLink size={12} style={{ marginLeft: 4 }} />
          </Anchor>
        </Group>
      );
    case "file":
      return (
        <Anchor href={value} target="_blank" size="sm">
          <Group gap="xs">
            <IconDownload size={16} />
            Download File
          </Group>
        </Anchor>
      );
    case "number":
      return <Text fw={500}>{value}</Text>;
    default:
      return <Text>{value}</Text>;
  }
};

export function IdCardModal({ idCard, opened, onClose }: IdCardModalProps) {
  const t = useTranslations();

  if (!idCard) {
    return null;
  }

  const getVariableLabel = (key: string) => {
    const vars = (idCard.template?.template as any)?.vars;
    if (vars && Array.isArray(vars)) {
      const variable = vars.find((v: any) => v.variable === key);
      console.log('variable', variable);
      
      if (variable && variable.variableLabel) {
        return variable.variableLabel;
      }
    }
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      title="Member Information"
    >
      <ScrollArea h={600} type="scroll">
        <Stack gap="lg" p="md">
        {/* Header Section */}
        <Paper withBorder p="md" radius="md">
          <Group  mb="md">
            <Group>
              <Avatar size="lg" />
              <Box>
                <Title order={3}>{idCard.member?.name || "N/A"}</Title>
                <Text size="sm" c="dimmed">
                  ID: {idCard.uniqueKey}
                </Text>
              </Box>
            </Group>
            <Badge 
              color={getStatusColor(idCard.status)} 
              variant="light" 
              size="lg"
            >
              {idCard.status}
            </Badge>
          </Group>
        </Paper>

        {/* Member Details */}
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">Member Details</Title>
          <Stack gap="sm">
            <Group >
              <Text fw={500}>Name:</Text>
              <Text>{idCard.member?.name || "N/A"}</Text>
            </Group>
            <Group >
              <Text fw={500}>Phone:</Text>
              <Group gap="xs">
                <IconPhone size={16} />
                <Text>{idCard.member?.phone || "N/A"}</Text>
              </Group>
            </Group>
            <Group >
              <Text fw={500}>Join Date:</Text>
              {(idCard as any).member?.joinDate ? (
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text>{formatDate((idCard as any).member.joinDate)}</Text>
                </Group>
              ) : (
                <Text>N/A</Text>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* ID Card Information */}
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">ID Card Information</Title>
          <Stack gap="sm">
            <Group >
              <Text fw={500}>Issue Date:</Text>
              {(idCard as any).issueDate ? (
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text>{formatDate((idCard as any).issueDate)}</Text>
                </Group>
              ) : (
                <Text>N/A</Text>
              )}
            </Group>
            <Group >
              <Text fw={500}>Expiration Date:</Text>
              {(idCard as any).expirationDate ? (
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text>{formatDate((idCard as any).expirationDate)}</Text>
                </Group>
              ) : (
                <Text>N/A</Text>
              )}
            </Group>
            <Group >
              <Text fw={500}>Template:</Text>
              <Text>{idCard.template?.title || "N/A"}</Text>
            </Group>
          </Stack>
        </Paper>

        {/* Organization Information */}
        {(idCard as any).organization && (
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Organization</Title>
            <Group>
              <Avatar src={(idCard as any).organization.logo} size="md" alt={(idCard as any).organization.name} />
              <Box>
                <Text fw={500}>{(idCard as any).organization.name}</Text>
                <Text size="sm" c="dimmed">{(idCard as any).organization.description}</Text>
                {(idCard as any).organization.website && (
                  <Anchor href={(idCard as any).organization.website} target="_blank" size="sm">
                    Visit Website
                    <IconExternalLink size={12} style={{ marginLeft: 4 }} />
                  </Anchor>
                )}
              </Box>
            </Group>
          </Paper>
        )}

        {/* Additional Information */}
        {idCard.request && Object.keys(idCard.request).length > 0 && (
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Additional Information</Title>
            <Stack gap="sm">
              {Object.entries(idCard.request).map(([key, value]) => (
                <Group key={key}  align="flex-start">
                  <Text fw={500} tt="capitalize">
                    {getVariableLabel(key)}:
                  </Text>
                  <Box style={{ textAlign: "right", maxWidth: "60%" }}>
                    {renderFieldValue(key, value)}
                  </Box>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            {idCard.template?.template && (
              <Group gap="sm">
                <PolotnoExportButton
                  template={idCard.template.template}
                  format="svg"
                  data={idCard.request ? Object.fromEntries(
                    Object.entries(idCard.request).map(([key, value]) => [key, String(value)])
                  ) : undefined}
                  filename={`id-card-${idCard.uniqueKey}`}
                  onClick={downloadFiles}
                  leftSection={<IconDownload size={16} />}
                  variant="filled"
                  color="blue"
                >
                  Download SVG
                </PolotnoExportButton>

                <PolotnoExportButton
                  template={idCard.template.template}
                  format="png"
                  data={idCard.request ? Object.fromEntries(
                    Object.entries(idCard.request).map(([key, value]) => [key, String(value)])
                  ) : undefined}
                  filename={`id-card-${idCard.uniqueKey}`}
                  onClick={downloadFiles}
                  leftSection={<IconDownload size={16} />}
                  variant="outline"
                  color="blue"
                >
                  Download PNG
                </PolotnoExportButton>
              </Group>
            )}
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
