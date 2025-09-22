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
  const tTemplates = useTranslations("templates");

  const form = useForm<TemplateConfig>({
    initialValues: {
      title: initialConfig?.title || "",
      description: initialConfig?.description || "",
      price: initialConfig?.price || 0,
    },
    validate: {
      title: (value) =>
        value.trim().length < 3
          ? tTemplates("config.validation.titleMinLength")
          : null,
      description: (value) =>
        value.trim().length < 10
          ? tTemplates("config.validation.descriptionMinLength")
          : null,
      price: (value) =>
        value < 0 ? tTemplates("config.validation.pricePositive") : null,
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
        isEditMode ? tTemplates("config.editTitle") : tTemplates("config.title")
      }
      centered
      size="md"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={tTemplates("config.templateTitle")}
            placeholder={tTemplates("config.templateTitlePlaceholder")}
            required
            {...form.getInputProps("title")}
          />

          <Textarea
            label={tTemplates("config.templateDescription")}
            placeholder={tTemplates("config.templateDescriptionPlaceholder")}
            required
            rows={4}
            {...form.getInputProps("description")}
          />

          <NumberInput
            label={tTemplates("config.templatePrice")}
            placeholder={tTemplates("config.templatePricePlaceholder")}
            required
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="$"
            {...form.getInputProps("price")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="filled" color="gray" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {isEditMode
                ? tTemplates("config.updateInformation")
                : tTemplates("config.saveConfiguration")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
