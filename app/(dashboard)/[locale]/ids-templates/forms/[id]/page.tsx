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
  Paper,
  Grid,
  Container,
  Loader,
  Center,
  Text,
  Card,
  Divider,
  Badge,
  ActionIcon,
  Tooltip
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconId, IconFileText, IconCalendar, IconPhoto, IconSend } from "@tabler/icons-react";
import { useGetTemplate } from '@/features/templates/api';
import { useParams } from 'next/navigation';
import type { Template } from '@/features/templates/types';

type FieldType = 'text' | 'date' | 'file' | 'textarea';
type FormValue = string | File | Date | null;

interface SmartField {
  id: string;
  label: string;
  type: FieldType;
  placeholder: string;
  side: 'front' | 'back';
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
  date: 'date',
  file: 'file',
  textarea: 'textarea'
};

const FIELD_ICONS = {
  text: IconFileText,
  date: IconCalendar,
  file: IconPhoto,
  textarea: IconFileText
};

export default function IdCardsTemplates() {
  const [formData, setFormData] = useState<Record<string, FormValue>>({});
  const params = useParams();
  const templateId = params.id as string;
  
  const { data: template, isLoading: templateLoading, error } = useGetTemplate(templateId);
  const [isFormLoading, setIsFormLoading] = useState(true);

  const getFieldLabel = useCallback((smartFieldType: string, text?: string): string => {
    return text?.replace(/:/g, '').trim() || smartFieldType;
  }, []);

  const getFieldType = useCallback((smartFieldType: string, dataType?: string): FieldType => {
    if (dataType && FIELD_TYPE_MAP[dataType]) return FIELD_TYPE_MAP[dataType];
    
    const lowerType = smartFieldType.toLowerCase();
    if (lowerType.includes('date')) return 'date';
    if (lowerType.includes('photo') || lowerType.includes('signature')) return 'file';
    if (lowerType.includes('text') && lowerType.includes('back')) return 'textarea';
    
    return 'text';
  }, []);

  const getFieldPlaceholder = useCallback((smartFieldType: string, fieldType: FieldType): string => {
    const placeholders = {
      date: `اختر ${smartFieldType}`,
      file: `رفع ${smartFieldType}`,
      textarea: `أدخل تفاصيل ${smartFieldType}`,
      text: `أدخل ${smartFieldType}`
    };
    return placeholders[fieldType];
  }, []);

  const smartFields = useMemo(() => {
    if (!template?.template) return [];
    
    const templateData = template.template as TemplateStructure;
    const fields: SmartField[] = [];
    const seenFields = new Set<string>();

    const processObjects = (objects: TemplateObject[], side: 'front' | 'back') => {
      objects?.forEach(obj => {
        if (obj.isSmartField && obj.smartFieldType && !seenFields.has(obj.smartFieldType)) {
          seenFields.add(obj.smartFieldType);
          const type = getFieldType(obj.smartFieldType, obj.dataType);
          fields.push({
            id: obj.smartFieldType,
            label: getFieldLabel(obj.smartFieldType, obj.text),
            type,
            placeholder: getFieldPlaceholder(obj.smartFieldType, type),
            side,
            required: true
          });
        }
      });
    };

    processObjects(templateData.frontCanvas?.objects || [], 'front');
    processObjects(templateData.backCanvas?.objects || [], 'back');
    
    return fields;
  }, [template?.template, getFieldType, getFieldLabel, getFieldPlaceholder]);

  useEffect(() => {
    const initialData = smartFields.reduce((acc, field) => {
      acc[field.id] = field.type === 'date' || field.type === 'file' ? null : '';
      return acc;
    }, {} as Record<string, FormValue>);
    
    setFormData(initialData);
    setIsFormLoading(false);
  }, [smartFields]);

  const handleInputChange = useCallback((fieldId: string, value: FormValue) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form Data:', formData);
    // TODO: Implement form submission logic
  }, [formData]);

  const renderField = useCallback((field: SmartField) => {
    const value = formData[field.id];
    const Icon = FIELD_ICONS[field.type];
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      leftSection: <Icon size={16} />
    };

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            key={field.id}
            {...commonProps}
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.id, e.currentTarget.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={field.id}
            {...commonProps}
            value={value as string || ''}
            onChange={(e) => handleInputChange(field.id, e.currentTarget.value)}
            minRows={3}
            autosize
          />
        );
      case 'date':
        return (
          <DateInput
            key={field.id}
            {...commonProps}
            value={value as Date || null}
            onChange={(date) => handleInputChange(field.id, date)}
          />
        );
      case 'file':
        return (
          <FileInput
            key={field.id}
            {...commonProps}
            value={value as File || null}
            onChange={(file) => handleInputChange(field.id, file)}
            accept="image/*"
          />
        );
      default:
        return null;
    }
  }, [formData, handleInputChange]);

  if (templateLoading || isFormLoading) {
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
              <IconFileText size={48} stroke={1} color="var(--mantine-color-red-5)" />
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

  const frontFields = smartFields.filter(field => field.side === 'front');
  const backFields = smartFields.filter(field => field.side === 'back');
  const hasFields = smartFields.length > 0;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconId size={32} stroke={1.5} />
            <Title order={1} size="h2">انشاء الهوية</Title>
          </Group>
          <Badge variant="light" size="lg">
            {smartFields.length} حقل
          </Badge>
        </Group>

        {!hasFields ? (
          <Card withBorder radius="md" p="xl">
            <Center>
              <Stack align="center" gap="md">
                <IconFileText size={48} stroke={1} color="var(--mantine-color-gray-5)" />
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
              {frontFields.length > 0 && (
                <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Title order={3} size="h4">الوجه الأمامي</Title>
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
                    <Title order={3} size="h4">الوجه الخلفي</Title>
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
                    size="lg"
                    leftSection={<IconSend size={18} />}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                  >
                    إنشاء بطاقة الهوية
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
