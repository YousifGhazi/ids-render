"use client";

import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export interface TemplateConfig {
  title: string;
  description: string;
  price: number;
}

interface TemplateConfigModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (config: TemplateConfig) => void;
  initialConfig?: Partial<TemplateConfig>;
  isEditMode?: boolean;
}

export function TemplateConfigModal({
  opened,
  onClose,
  onSave,
  initialConfig,
  isEditMode = false,
}: TemplateConfigModalProps) {
  const t = useTranslations();

  const form = useForm<TemplateConfig>({
    initialValues: {
      title: initialConfig?.title || "",
      description: initialConfig?.description || "",
      price: initialConfig?.price || 0,
    },
    validate: {
      title: (value) =>
        value.trim().length < 3 ? "Title must be at least 3 characters" : null,
      description: (value) =>
        value.trim().length < 10
          ? "Description must be at least 10 characters"
          : null,
      price: (value) => (value < 0 ? "Price must be a positive number" : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSave(values);
    onClose();
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (opened && initialConfig) {
      form.setValues({
        title: initialConfig.title || "",
        description: initialConfig.description || "",
        price: initialConfig.price || 0,
      });
    }
  }, [opened, initialConfig]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        isEditMode ? "Edit Template Information" : "Template Configuration"
      }
      centered
      size="md"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Template Title"
            placeholder="Enter template title..."
            required
            {...form.getInputProps("title")}
          />

          <Textarea
            label="Description"
            placeholder="Enter template description..."
            required
            rows={4}
            {...form.getInputProps("description")}
          />

          <NumberInput
            label="Price"
            placeholder="Enter template price..."
            required
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="$"
            {...form.getInputProps("price")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="filled" color="gray" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Update Information" : "Save Configuration"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
