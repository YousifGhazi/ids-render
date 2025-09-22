"use client";

import { IDCard } from "@/features/ids/types";
import { Modal, Stack, Text, Group } from "@mantine/core";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/format";

interface PaymentModalProps {
  payment?: IDCard; // Temporary: using IDCard type until payments feature is created
  opened: boolean;
  onClose: () => void;
}

export function PaymentModal({ payment, opened, onClose }: PaymentModalProps) {
  const t = useTranslations();

  if (!payment) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      title={t("payments.singular_title")}
    >
      <Stack gap="md" p="md">
        <Group justify="space-between">
          <Text fw={500}>{t("id")}:</Text>
          <Text>{payment.id}</Text>
        </Group>

        <Group justify="space-between">
          <Text fw={500}>{t("members.name")}:</Text>
          <Text>{payment.member?.name || payment.name}</Text>
        </Group>

        <Group justify="space-between">
          <Text fw={500}>{t("members.phone")}:</Text>
          <Text>{payment.member?.phone || payment.phone}</Text>
        </Group>

        <Group justify="space-between">
          <Text fw={500}>{t("price")}:</Text>
          <Text>15,000 IDQ</Text>
        </Group>

        <Group justify="space-between">
          <Text fw={500}>{t("createdAt")}:</Text>
          <Text>{formatDate(payment.createdAt)}</Text>
        </Group>

        <Group justify="space-between">
          <Text fw={500}>{t("updatedAt")}:</Text>
          <Text>{formatDate(payment.updatedAt)}</Text>
        </Group>
      </Stack>
    </Modal>
  );
}
