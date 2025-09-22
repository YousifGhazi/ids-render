"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TextInput,
  NumberInput,
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
  IconPhone,
  IconUser,
  IconNumbers,
} from "@tabler/icons-react";
import { useGetTemplate } from "@/features/templates/api";
import { useCreateId } from "@/features/ids/api";
import { useGetOrganizations } from "@/features/organizations/api";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { CreateIDCardInput } from "@/features/ids/types";
import { useAuthStore } from "@/features/auth/store";

type FormValue = string | number | File | Date | null;

type FormData = Record<string, FormValue> & {
  phone: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  expirationDate: Date | null;
  issueDate: Date | null;
  template_id: string;
  organizationId?: string;
};

interface TemplateVar {
  variable: string;
  variableType: string;
  variableLabel: string;
}

interface Template {
  vars: TemplateVar[];
  [key: string]: unknown;
}

const getInputTypeFromVariableType = (variableType: string) => {
  switch (variableType?.toLowerCase()) {
    case "date":
      return "date";
    case "image":
      return "image";
    case "number":
      return "number";
    case "text":
    default:
      return "text";
  }
};

const renderInputField = (
  variable: TemplateVar,
  value: FormValue,
  onChange: (value: FormValue) => void
) => {
  const inputType = getInputTypeFromVariableType(variable.variableType);
  const commonProps = {
    label: variable.variableLabel,
    required: true,
  };

  switch (inputType) {
    case "text":
      return (
        <TextInput
          {...commonProps}
          leftSection={<IconFileText size={16} />}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      );
    case "number":
      return (
        <NumberInput
          {...commonProps}
          leftSection={<IconNumbers size={16} />}
          value={(value as number) || 0}
          onChange={(val) => onChange(val || 0)}
        />
      );
    case "date":
      return (
        <DateInput
          {...commonProps}
          leftSection={<IconCalendar size={16} />}
          value={(value as Date) || null}
          onChange={(date) => onChange(date)}
        />
      );
    case "image":
      return (
        <FileInput
          {...commonProps}
          leftSection={<IconPhoto size={16} />}
          value={(value as File) || null}
          onChange={(file) => onChange(file)}
          accept="image/*"
        />
      );
    default:
      return null;
  }
};

export default function TemplateFormPage() {
  const params = useParams();
  const templateId = params.id as string;
  const t = useTranslations("members");
  const tIds = useTranslations("ids");
  const tCommon = useTranslations();
  const { user } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    phone: "",
    firstName: "",
    secondName: "",
    thirdName: "",
    fourthName: "",
    expirationDate: null,
    issueDate: null,
    template_id: templateId,
    organizationId: "",
  });

  const {
    data: template,
    isLoading: templateLoading,
    error: templateError,
  } = useGetTemplate(templateId);

  const { data: organizationsResponse, isLoading: organizationsLoading } =
    useGetOrganizations({ page: 1, pageSize: 100 });

  const createIdMutation = useCreateId();

  // Prepare organizations for select
  const organizationsSelectData = useMemo(() => {
    if (!organizationsResponse?.data?.data) return [];
    return organizationsResponse.data.data.map((org) => ({
      value: org.id.toString(),
      label: org.name,
    }));
  }, [organizationsResponse]);

  // Get template variables
  const templateVars = useMemo(() => {
    if (!template?.template) return [];
    const templateData = template.template as Template;
    return templateData.vars || [];
  }, [template]);

  // Initialize dynamic variables when template variables are available
  useEffect(() => {
    if (templateVars.length > 0) {
      const dynamicData = templateVars.reduce((acc, templateVar) => {
        const inputType = getInputTypeFromVariableType(
          templateVar.variableType
        );
        acc[templateVar.variable] =
          inputType === "date" || inputType === "image"
            ? null
            : inputType === "number"
            ? 0
            : "";
        return acc;
      }, {} as Record<string, FormValue>);

      setFormData((prev) => ({
        ...prev,
        ...dynamicData,
      }));
    }
  }, [templateVars]);

  const handleInputChange = (fieldId: string, value: FormValue) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Extract fixed fields and dynamic variables separately
      const {
        firstName,
        secondName,
        thirdName,
        fourthName,
        phone,
        organizationId,
        issueDate,
        expirationDate,
        template_id,
        ...dynamicVariables
      } = formData;

      // Helper function to safely trim strings
      const safeTrim = (value: FormValue): string => {
        return typeof value === "string" ? value.trim() : "";
      };

      const submitData: CreateIDCardInput = {
        identity: "by system",
        name: [
          safeTrim(firstName),
          safeTrim(secondName),
          safeTrim(thirdName),
          safeTrim(fourthName),
        ]
          .filter(Boolean)
          .join(" "),
        phone: safeTrim(phone),
        template_id: Number(templateId),
        organizationId: Number(organizationId),
        issueDate: issueDate,
        expirationDate: expirationDate,
        ...dynamicVariables, // Spread the dynamic variables at the top level
      };

      await createIdMutation.mutateAsync(submitData);
      router.push("/ids");
    } catch (error) {
      console.error("Error creating ID card:", error);
    }
  };

  if (templateLoading || organizationsLoading) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">{tIds("loadingTemplate")}</Text>
        </Stack>
      </Center>
    );
  }

  if (templateError || !template) {
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
                {tIds("templateLoadError")}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {tIds("templateNotFound")}
              </Text>
            </Stack>
          </Center>
        </Card>
      </Container>
    );
  }

  const isAdmin = user?.type === "admin";
  const isFormValid =
    typeof formData?.phone === "string" &&
    formData.phone.trim() &&
    typeof formData?.firstName === "string" &&
    formData.firstName.trim() &&
    formData?.issueDate &&
    formData?.expirationDate &&
    (!isAdmin || formData?.organizationId);

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconId size={32} stroke={1.5} />
            <Title order={1} size="h2">
              {tIds("createId")}
            </Title>
          </Group>
        </Group>

        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            {/* Required Fields Section */}
            <Card withBorder radius="md" p="lg">
              <Title order={3} size="h4" mb="md">
                {tIds("memberInfo")}
              </Title>
              <Divider mb="md" />
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={tCommon("phoneNumber")}
                    placeholder={`${tCommon("common.enter")} ${tCommon(
                      "phoneNumber"
                    )}`}
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.currentTarget.value)
                    }
                    leftSection={<IconPhone size={16} />}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t("firstName")}
                    placeholder={t("firstNamePlaceholder")}
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.currentTarget.value)
                    }
                    leftSection={<IconUser size={16} />}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t("secondName")}
                    placeholder={t("secondNamePlaceholder")}
                    value={formData.secondName}
                    onChange={(e) =>
                      handleInputChange("secondName", e.currentTarget.value)
                    }
                    leftSection={<IconUser size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t("thirdName")}
                    placeholder={t("thirdNamePlaceholder")}
                    value={formData.thirdName}
                    onChange={(e) =>
                      handleInputChange("thirdName", e.currentTarget.value)
                    }
                    leftSection={<IconUser size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t("fourthName")}
                    placeholder={t("fourthNamePlaceholder")}
                    value={formData.fourthName}
                    onChange={(e) =>
                      handleInputChange("fourthName", e.currentTarget.value)
                    }
                    leftSection={<IconUser size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label={tIds("issueDate")}
                    placeholder={`${tCommon("common.select")} ${tIds(
                      "issueDate"
                    )}`}
                    value={formData.issueDate}
                    onChange={(date) => handleInputChange("issueDate", date)}
                    leftSection={<IconCalendar size={16} />}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label={tIds("expirationDate")}
                    placeholder={`${tCommon("common.select")} ${tIds(
                      "expirationDate"
                    )}`}
                    value={formData.expirationDate}
                    onChange={(date) =>
                      handleInputChange("expirationDate", date)
                    }
                    leftSection={<IconCalendar size={16} />}
                    required
                  />
                </Grid.Col>
                {isAdmin && (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label={tIds("organization")}
                      placeholder={tIds("selectOrganization")}
                      value={formData.organizationId || ""}
                      onChange={(value) =>
                        handleInputChange("organizationId", value || "")
                      }
                      data={organizationsSelectData}
                      leftSection={<IconBuilding size={16} />}
                      required={isAdmin}
                      searchable
                      clearable
                    />
                  </Grid.Col>
                )}
              </Grid>
            </Card>

            {/* Dynamic Fields Section */}
            {templateVars.length > 0 && (
              <Card withBorder radius="md" p="lg">
                <Title order={3} size="h4" mb="md">
                  {tIds("templateFields")}
                </Title>
                <Divider mb="md" />
                <Grid>
                  {templateVars.map((templateVar) => (
                    <Grid.Col
                      key={templateVar.variable}
                      span={{ base: 12, sm: 6 }}
                    >
                      {renderInputField(
                        templateVar,
                        formData[templateVar.variable],
                        (value) =>
                          handleInputChange(templateVar.variable, value)
                      )}
                    </Grid.Col>
                  ))}
                </Grid>
              </Card>
            )}

            <Group justify="flex-end" pt="md">
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={18} />}
                loading={createIdMutation.isPending}
                disabled={!isFormValid}
              >
                {createIdMutation.isPending
                  ? tIds("creating")
                  : tIds("createIdCard")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
