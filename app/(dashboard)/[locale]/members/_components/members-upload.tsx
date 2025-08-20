"use client";

import { Button, FileInput, Group, Modal, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";

interface MemberModalProps {
  opened: boolean;
  onClose: () => void;
}

export function MembersUpload({ opened, onClose }: MemberModalProps) {
  const t = useTranslations();

  const form = useForm<{
    file: File;
  }>();

  const handleSubmit = form.onSubmit(async (values) => {
    form.reset();
    onClose();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("file.uploadFile")}
      centered
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <FileInput
            accept=".csv, .xlsx"
            label={t("file.selectFile")}
            placeholder={t("file.selectFile")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="filled" color="gray" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("add")}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
