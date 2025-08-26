"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TextInput,
  Textarea,
  FileInput,
  Button,
  Stack,
  Group,
  Title,
  Grid,
  Container,
  Loader,
  Center,
  Text,
  Card,
  Divider,
  Badge,
  Tooltip,
  Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconId,
  IconFileText,
  IconCalendar,
  IconPhoto,
  IconDeviceFloppy,
  IconBuilding,
} from "@tabler/icons-react";
import { useGetTemplate } from "@/features/templates/api";
import { useCreateId } from "@/features/ids/api";
import { useGetOrganizations } from "@/features/organizations/api";
import { useParams, useRouter } from "next/navigation";
import type { CreateIDCardInput } from "@/features/ids/types";

type FieldType = "text" | "date" | "file" | "textarea";
type FormValue = string | File | Date | null;
type FormData = {
  phone: string;
  name: string;
  template_id: string;
  organizationId: string;
  identity: Record<string, FormValue>;
};

interface SmartField {
  id: string;
  label: string;
  type: FieldType;
  placeholder: string;
  side: "front" | "back";
  required: boolean;
}

interface TemplateObject {
  isSmartField?: boolean;
  smartFieldType?: string;
  text?: string;
  dataType?: string;
  [key: string]: unknown;
}

interface CanvasData {
  objects?: TemplateObject[];
}

interface TemplateStructure {
  frontCanvas?: CanvasData;
  backCanvas?: CanvasData;
}

const FIELD_TYPE_MAP: Record<string, FieldType> = {
  date: "date",
  file: "file",
  textarea: "textarea",
};

const FIELD_ICONS = {
  text: IconFileText,
  date: IconCalendar,
  file: IconPhoto,
  textarea: IconFileText,
};

export default function IdCardsTemplates() {
  const params = useParams();
  const templateId = params.id as string;
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    name: "",
    template_id: templateId,
    organizationId: "",
    identity: {},
  });

  const {
    data: template,
    isLoading: templateLoading,
    error,
  } = useGetTemplate(templateId);
  const { data: organizationsResponse, isLoading: organizationsLoading } =
    useGetOrganizations({ page: 1, pageSize: 100 });
  const [isFormLoading, setIsFormLoading] = useState(true);
  const router = useRouter();
  const createIdMutation = useCreateId();

  const getFieldLabel = useCallback(
    (smartFieldType: string, text?: string): string => {
      return text?.replace(/:/g, "").trim() || smartFieldType;
    },
    []
  );

  const getFieldType = useCallback(
    (smartFieldType: string, dataType?: string): FieldType => {
      if (dataType && FIELD_TYPE_MAP[dataType]) return FIELD_TYPE_MAP[dataType];

      const lowerType = smartFieldType.toLowerCase();
      if (lowerType.includes("date")) return "date";
      if (lowerType.includes("photo") || lowerType.includes("signature"))
        return "file";
      if (lowerType.includes("text") && lowerType.includes("back"))
        return "textarea";

      return "text";
    },
    []
  );

  const getFieldPlaceholder = useCallback(
    (smartFieldType: string, fieldType: FieldType): string => {
      const placeholders = {
        date: `اختر ${smartFieldType}`,
        file: `رفع ${smartFieldType}`,
        textarea: `أدخل تفاصيل ${smartFieldType}`,
        text: `أدخل ${smartFieldType}`,
      };
      return placeholders[fieldType];
    },
    []
  );

  // Prepare organizations for select
  const organizationsSelectData = useMemo(() => {
    if (!organizationsResponse?.data?.data) return [];
    return organizationsResponse.data.data.map((org) => ({
      value: org.id.toString(),
      label: org.name,
    }));
  }, [organizationsResponse]);

  const smartFields = useMemo(() => {
    if (!template?.template) return [];

    const templateData = template.template as TemplateStructure;
    const fields: SmartField[] = [];
    const seenFields = new Set<string>();

    const processObjects = (
      objects: TemplateObject[],
      side: "front" | "back"
    ) => {
      objects?.forEach((obj) => {
        if (
          obj.isSmartField &&
          obj.smartFieldType &&
          !seenFields.has(obj.smartFieldType) &&
          obj.smartFieldType.toLowerCase() !== "name"
        ) {
          seenFields.add(obj.smartFieldType);
          const type = getFieldType(obj.smartFieldType, obj.dataType);
          fields.push({
            id: obj.smartFieldType,
            label: getFieldLabel(obj.smartFieldType, obj.text),
            type,
            placeholder: getFieldPlaceholder(obj.smartFieldType, type),
            side,
            required: true,
          });
        }
      });
    };

    processObjects(templateData.frontCanvas?.objects || [], "front");
    processObjects(templateData.backCanvas?.objects || [], "back");

    return fields;
  }, [template?.template, getFieldType, getFieldLabel, getFieldPlaceholder]);

  useEffect(() => {
    const identityData = smartFields.reduce((acc, field) => {
      acc[field.id] =
        field.type === "date" || field.type === "file" ? null : "";
      return acc;
    }, {} as Record<string, FormValue>);

    // Store dynamic fields in identity object
    setFormData((prev) => ({
      ...prev,
      identity: identityData,
    }));
    setIsFormLoading(false);
  }, [smartFields]);

  const handleInputChange = useCallback((fieldId: string, value: FormValue) => {
    if (
      fieldId === "phone" ||
      fieldId === "name" ||
      fieldId === "organizationId"
    ) {
      // Store phone, name, and organizationId at root level
      setFormData((prev) => ({ ...prev, [fieldId]: value as string }));
    } else {
      // Store dynamic fields in identity object
      setFormData((prev) => ({
        ...prev,
        identity: {
          ...prev.identity,
          [fieldId]: value,
        },
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      // Validate required fields
      if (
        !formData.phone.trim() ||
        !formData.name.trim() ||
        !formData.organizationId.trim()
      ) {
        return;
      }

      const submitData: CreateIDCardInput = {
        name: formData.name,
        phone: formData.phone,
        template_id: Number(templateId),
        organizationId: Number(formData.organizationId),
        identity: "by system",
        ...formData.identity,
      };

      try {
        await createIdMutation.mutateAsync(submitData);
        // Redirect to success page or IDs list
        router.push("/ids");
      } catch (error) {
        console.error("Error creating ID card:", error);
      }
    },
    [formData, createIdMutation, router, templateId]
  );

  const renderField = useCallback(
    (field: SmartField) => {
      const value = formData.identity[field.id];
      const Icon = FIELD_ICONS[field.type];
      const commonProps = {
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        leftSection: <Icon size={16} />,
      };

      switch (field.type) {
        case "text":
          return (
            <TextInput
              key={field.id}
              {...commonProps}
              value={(value as string) || ""}
              onChange={(e) =>
                handleInputChange(field.id, e.currentTarget.value)
              }
            />
          );
        case "textarea":
          return (
            <Textarea
              key={field.id}
              {...commonProps}
              value={(value as string) || ""}
              onChange={(e) =>
                handleInputChange(field.id, e.currentTarget.value)
              }
              minRows={3}
              autosize
            />
          );
        case "date":
          return (
            <DateInput
              key={field.id}
              {...commonProps}
              value={(value as Date) || null}
              onChange={(date) => handleInputChange(field.id, date)}
            />
          );
        case "file":
          return (
            <FileInput
              key={field.id}
              {...commonProps}
              value={(value as File) || null}
              onChange={(file) => handleInputChange(field.id, file)}
              accept="image/*"
            />
          );
        default:
          return null;
      }
    },
    [formData, handleInputChange]
  );

  if (templateLoading || organizationsLoading || isFormLoading) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">جاري تحميل حقول القالب...</Text>
        </Stack>
      </Center>
    );
  }

  if (error || !template) {
    return (
      <Container size="md" py="xl">
        <Card withBorder radius="md" p="xl">
          <Center>
            <Stack align="center" gap="md">
              <IconFileText
                size={48}
                stroke={1}
                color="var(--mantine-color-red-5)"
              />
              <Text size="lg" fw={500} c="red">
                خطأ في تحميل القالب
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                لم يتم العثور على القالب المطلوب أو حدث خطأ أثناء التحميل.
              </Text>
            </Stack>
          </Center>
        </Card>
      </Container>
    );
  }

  const frontFields = smartFields.filter((field) => field.side === "front");
  const backFields = smartFields.filter((field) => field.side === "back");
  const hasFields = smartFields.length > 0;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconId size={32} stroke={1.5} />
            <Title order={1} size="h2">
              انشاء الهوية
            </Title>
          </Group>
          <Badge variant="light" size="lg">
            {smartFields.length} حقل
          </Badge>
        </Group>

        {!hasFields ? (
          <Card withBorder radius="md" p="xl">
            <Center>
              <Stack align="center" gap="md">
                <IconFileText
                  size={48}
                  stroke={1}
                  color="var(--mantine-color-gray-5)"
                />
                <Text size="lg" fw={500} c="dimmed">
                  لم يتم العثور على حقول ذكية
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  يرجى إضافة حقول ذكية باستخدام مصمم الهوية لإنشاء النموذج.
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={3} size="h4">
                    معلومات المنتسب
                  </Title>
                  <Badge variant="outline">{frontFields.length} حقل</Badge>
                </Group>
                <Divider mb="md" />
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="رقم الهاتف"
                      placeholder="أدخل رقم الهاتف"
                      value={(formData.phone as string) || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.currentTarget.value)
                      }
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="اسم المنتسب"
                      placeholder="أدخل اسم المنتسب"
                      value={(formData.name as string) || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.currentTarget.value)
                      }
                      disabled={
                        !formData.phone ||
                        (formData.phone as string).trim() === ""
                      }
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="المؤسسة"
                      placeholder="اختر المؤسسة"
                      value={formData.organizationId || ""}
                      onChange={(value) =>
                        handleInputChange("organizationId", value || "")
                      }
                      data={organizationsSelectData}
                      leftSection={<IconBuilding size={16} />}
                      required
                      searchable
                      clearable
                    />
                  </Grid.Col>
                </Grid>
              </Card>
              {frontFields.length > 0 && (
                <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Title order={3} size="h4">
                      الوجه الأمامي
                    </Title>
                    <Badge variant="outline">{frontFields.length} حقل</Badge>
                  </Group>
                  <Divider mb="md" />
                  <Grid>
                    {frontFields.map((field) => (
                      <Grid.Col key={field.id} span={{ base: 12, sm: 6 }}>
                        {renderField(field)}
                      </Grid.Col>
                    ))}
                  </Grid>
                </Card>
              )}

              {backFields.length > 0 && (
                <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Title order={3} size="h4">
                      الوجه الخلفي
                    </Title>
                    <Badge variant="outline">{backFields.length} حقل</Badge>
                  </Group>
                  <Divider mb="md" />
                  <Grid>
                    {backFields.map((field) => (
                      <Grid.Col key={field.id} span={{ base: 12, sm: 6 }}>
                        {renderField(field)}
                      </Grid.Col>
                    ))}
                  </Grid>
                </Card>
              )}

              <Group justify="flex-end" pt="md">
                <Tooltip label="إنشاء بطاقة الهوية بالمعلومات المقدمة">
                  <Button
                    type="submit"
                    leftSection={<IconDeviceFloppy size={18} />}
                    loading={createIdMutation.isPending}
                    disabled={
                      !formData.phone.trim() ||
                      !formData.name.trim() ||
                      !formData.organizationId.trim()
                    }
                  >
                    {createIdMutation.isPending
                      ? "جاري الإنشاء..."
                      : "إنشاء بطاقة الهوية"}
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </form>
        )}
      </Stack>
    </Container>
  );
}
