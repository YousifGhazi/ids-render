"use client";

import IDCardDesigner from "@/components/ids-designer";
import { useCreateTemplate } from "@/features/templates/api";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";

export default function FormBuilder() {
  const t = useTranslations();
  const createTemplate = useCreateTemplate();

  const onSaveHandler = (data: Record<string, unknown>) => {
    // Get template data from the designer component
    // This will be handled by the designer component internally
    const templateData = {
      title:
        data.title || `ID Card Template - ${new Date().toLocaleDateString()}`,
      price: data.price || "0",
      description: data.description || "",
      template: data.template, // This should be populated with actual canvas data
      is_enabled: "1",
    };

    createTemplate.mutate(templateData, {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Template saved successfully",
          color: "green",
        });
      },
      onError: (error) => {
        notifications.show({
          title: "Error",
          message: "Failed to save template",
          color: "red",
        });
        console.error("Error saving template:", error);
      },
    });
  };

  return <IDCardDesigner onSave={onSaveHandler} />;
}
