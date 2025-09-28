"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useGetTemplate } from "@/features/templates/api";
import { Loader, Center, Text, Alert } from "@mantine/core";

const Editor = dynamic(() => import("@/components/polotno-editor/editor"), {
  ssr: false,
});

export default function EditorPage() {
  const params = useParams();
  const templateId = Array.isArray(params.id) ? params.id[0] : params.id;
  const parsedTemplateId = templateId ? parseInt(templateId) : null;
  const isValidId =
    parsedTemplateId && !isNaN(parsedTemplateId) && parsedTemplateId > 0;

  // Fetch template data based on ID
  const {
    data: template,
    isLoading,
    error,
    isError,
  } = useGetTemplate(parsedTemplateId || 0, {
    enabled: !!isValidId,
  });

  // If invalid ID, render editor with default template
  if (!isValidId) {
    return <Editor />;
  }

  // Loading state
  if (isLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <Loader size="lg" />
          <Text mt="md" size="lg">
            Loading template...
          </Text>
        </div>
      </Center>
    );
  }

  // Error state - still render editor with default template for better UX
  if (isError) {
    console.error("Template loading error:", error);
    // Render editor without template (will use default)
    return <Editor />;
  }

  // Render editor with template data
  return <Editor template={template} />;
}
