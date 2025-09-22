"use client";

import { useTranslations } from "next-intl";
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Button,
  Group,
  Badge,
  Stack,
  Box,
  Skeleton,
  ActionIcon,
  Tooltip,
  Divider,
} from "@mantine/core";
import { IconPlus, IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { useRouter } from "@/i18n/navigation";
import { useGetTemplates, useDeleteTemplate } from "@/features/templates/api";
import type { Template } from "@/features/templates/types";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { PolotnoImageRenderer } from "@/components/polotno-editor";
import { Permission } from "@/components/permission";

// Skeleton loader component for template cards
const TemplateSkeleton = () => (
  <Card padding="lg" radius="md" withBorder style={{ height: "100%" }}>
    <Card.Section>
      <Skeleton height={200} />
    </Card.Section>
    <Stack gap="sm" mt="md">
      <Group justify="space-between" align="flex-start">
        <Skeleton height={20} width="70%" />
        <Skeleton height={18} width={60} radius="xl" />
      </Group>
      <Skeleton height={16} width="90%" />
      <Group gap="xs" mt="auto">
        <Skeleton height={28} style={{ flex: 1 }} />
        <Skeleton height={28} style={{ flex: 1 }} />
      </Group>
    </Stack>
  </Card>
);

export default function IdCardsTemplates() {
  const t = useTranslations();
  const router = useRouter();
  const {
    data: templatesResponse,
    isLoading,
    error,
    refetch,
  } = useGetTemplates({ page: 1, pageSize: 20 });
  const templates = templatesResponse?.data?.data || [];
  const deleteTemplate = useDeleteTemplate();

  const handleCreateNew = () => {
    router.push("/polotno-id-builder");
  };

  const handleUseTemplate = (templateId: number) => {
    router.push(`/ids-templates/forms/${templateId}`);
  };

  const handleDeleteTemplate = (template: Template) => {
    modals.openConfirmModal({
      title: t("common.confirmDelete"),
      children: (
        <Text size="sm">
          {t("templates.deleteConfirmation", { title: template.title })}
        </Text>
      ),
      labels: { confirm: t("common.delete"), cancel: t("common.cancel") },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteTemplate.mutate(template.id, {
          onSuccess: () => {
            notifications.show({
              title: t("common.success"),
              message: t("templates.deleteSuccess"),
              color: "green",
            });
            refetch();
          },
          onError: (error) => {
            notifications.show({
              title: t("common.error"),
              message: t("templates.deleteError"),
              color: "red",
            });
            console.error("Error deleting template:", error);
          },
        });
      },
    });
  };

  return (
    <Container size="xl" py="xl">
      {/* Header Section */}
      <Box mb="xl">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={1} size="h2" fw={700} c="#212529" mb="xs">
              {t("idsDesigner.templates.title")}
            </Title>
            <Text size="lg" c="#6c757d">
              {t("idsDesigner.templates.subtitle")}
            </Text>
          </div>
          <Permission can="create-template">
            <Button
              leftSection={<IconPlus size={20} />}
              onClick={handleCreateNew}
              radius="md"
            >
              {t("idsDesigner.templates.createNew")}
            </Button>
          </Permission>
        </Group>
      </Box>

      {/* Templates Grid */}
      <Grid>
        {isLoading ? (
          // Show skeleton loaders while loading
          Array.from({ length: 8 }).map((_, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <TemplateSkeleton />
            </Grid.Col>
          ))
        ) : error ? (
          <Grid.Col span={12}>
            <Text c="red" ta="center" py="xl">
              {t("common.error.loadingFailed")}
            </Text>
          </Grid.Col>
        ) : templates && templates.length > 0 ? (
          templates.map((template: Template) => {
            if (!template?.template?.pages) {
              return null;
            }

            const previewTemplate = {
              ...template,
              template: {
                ...template.template,
                pages: Array.isArray(template.template.pages)
                  ? [template.template.pages[0]]
                  : [],
              },
            };

            return (
              <Grid.Col
                key={template.id}
                span={{ base: 12, sm: 6, md: 4, lg: 3 }}
              >
                <Card
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    height: "100%",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Card.Section>
                    <Box pos="relative">
                      {template.is_enabled === 1 && (
                        <Badge
                          color="green"
                          variant="filled"
                          size="sm"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          {t("common.active")}
                        </Badge>
                      )}
                      <Tooltip label={t("common.delete")}>
                        <ActionIcon
                          color="red"
                          variant="filled"
                          size="sm"
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template);
                          }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Box>
                  </Card.Section>

                  <Stack gap="sm" mt="md">
                    {template?.template && !template?.template.frontCanvas && (
                      <PolotnoImageRenderer
                        key={template.id}
                        template={
                          previewTemplate?.template as Record<string, any>
                        }
                      />
                    )}

                    <Stack gap={10}>
                      <Text size="sm" fw={700}>
                        {t("price")}: {template.price}
                      </Text>
                      <Text size="sm" fw={700}>
                        {t("ids.submissionCount")}:
                        {String(template.identitiesCount)}
                      </Text>
                      <Text size="sm" fw={700}>
                        {t("description")}: {template.description}
                      </Text>
                    </Stack>

                    <Group gap="xs" mt="auto">
                      <Permission can="update-template">
                        <Button
                          variant="light"
                          size="xs"
                          leftSection={<IconEye size={14} />}
                          style={{ flex: 1 }}
                          onClick={() => {
                            router.push(`/polotno-id-builder/${template.id}`);
                          }}
                        >
                          {t("idsDesigner.templates.preview")}
                        </Button>
                      </Permission>
                      <Permission can="create-identity">
                        <Button
                          variant="filled"
                          size="xs"
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleUseTemplate(template.id)}
                          style={{ flex: 1 }}
                        >
                          {t("idsDesigner.templates.useTemplate")}
                        </Button>
                      </Permission>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })
        ) : (
          <Grid.Col span={12}>
            <Text ta="center" py="xl" c="dimmed">
              {t("idsDesigner.templates.noTemplates")}
            </Text>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}
