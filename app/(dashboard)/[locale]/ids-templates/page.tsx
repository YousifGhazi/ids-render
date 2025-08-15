"use client";

import { useTranslations } from 'next-intl';
import { Container, Title, Text, Grid, Card, Image, Button, Group, Badge, Stack, Box } from '@mantine/core';
import { IconPlus, IconEye, IconEdit, IconDownload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

const templates = [
  {
    id: 1,
    name: 'Corporate ID Card',
    description: 'Professional corporate identity card template',
    category: 'Corporate',
    isPopular: true
  },
];

export default function IdCardsTemplates() {
  const t = useTranslations();
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/id-builder');
  };

  const handleUseTemplate = (templateId: number) => {
    router.push(`/ids/designer?template=${templateId}`);
  };

  return (
    <Container size="xl" py="xl">
      {/* Header Section */}
      <Box mb="xl">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={1} size="h2" fw={700} c="#212529" mb="xs">
              {t('idsDesigner.templates.title')}
            </Title>
            <Text size="lg" c="#6c757d">
              {t('idsDesigner.templates.subtitle')}
            </Text>
          </div>
          <Button
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={handleCreateNew}
            gradient={{ from: 'blue', to: 'cyan' }}
            variant="gradient"
            radius="md"
          >
            {t('idsDesigner.templates.createNew')}
          </Button>
        </Group>
      </Box>

      {/* Templates Grid */}
      <Grid>
        {templates.map((template) => (
          <Grid.Col key={template.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                height: '100%',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Card.Section>
                <Box pos="relative">
                  <Image
                    src={template.image}
                    height={200}
                    alt={template.name}
                    fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI4IiBmaWxsPSIjRTlFQ0VGIiBzdHJva2U9IiNERUUyRTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iMTUiIGZpbGw9IiNBREI1QkQiLz4KPHN2ZyB4PSIxMzAiIHk9IjcwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgiIGZpbGw9IiNBREI1QkQiIHJ4PSI0Ii8+CiAgPHJlY3QgeT0iMTUiIHdpZHRoPSI4MCIgaGVpZ2h0PSI2IiBmaWxsPSIjQ0VENERBIiByeD0iMyIvPgogIDxyZWN0IHk9IjI0IiB3aWR0aD0iNjAiIGhlaWdodD0iNiIgZmlsbD0iI0NFRDREQSIgcng9IjMiLz4KPC9zdmc+Cjx0ZXh0IHg9IjE1MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkM3NTdEIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPklEIENhcmQgVGVtcGxhdGU8L3RleHQ+Cjwvc3ZnPgo="
                  />
                  {template.isPopular && (
                    <Badge
                      color="red"
                      variant="filled"
                      size="sm"
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10
                      }}
                    >
                      {t('idsDesigner.templates.popular')}
                    </Badge>
                  )}
                </Box>
              </Card.Section>

              <Stack gap="sm" mt="md">
                <div>
                  <Group justify="space-between" align="flex-start">
                    <Title order={4} size="h5" fw={600} c="#212529">
                      {template.name}
                    </Title>
                    <Badge color="blue" variant="light" size="xs">
                      {template.category}
                    </Badge>
                  </Group>
                  <Text size="sm" c="#6c757d" mt={4}>
                    {template.description}
                  </Text>
                </div>

                <Group gap="xs" mt="auto">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconEye size={14} />}
                    style={{ flex: 1 }}
                  >
                    {t('idsDesigner.templates.preview')}
                  </Button>
                  <Button
                    variant="filled"
                    size="xs"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => handleUseTemplate(template.id)}
                    style={{ flex: 1 }}
                  >
                    {t('idsDesigner.templates.useTemplate')}
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
