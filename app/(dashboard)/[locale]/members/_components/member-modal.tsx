"use client";

import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Member } from "@/features/members/types";
import { useCreateMember, useUpdateMember } from "@/features/members/api";
import { useGetOrganizations } from "@/features/organizations/api";
import { useAuthStore } from "@/features/auth/store";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";
import { DateInput } from "@mantine/dates";

interface MemberModalProps {
  member?: Member;
  opened: boolean;
  onClose: () => void;
}

export function MemberModal({ member, opened, onClose }: MemberModalProps) {
  const t = useTranslations();
  const { notify } = useMutationNotifications();

  const createMember = useCreateMember(notify("create"));
  const updateMember = useUpdateMember(notify("update"));
  const { user } = useAuthStore();
  const organizations = useGetOrganizations({
    page: 1,
    pageSize: 100,
  });
  const isEditing = !!member;

  const form = useForm<{
    name: string;
    phone: string;
    organizationIds: string[];
  }>({
    initialValues: {
      name: member?.name ?? "",
      phone: member?.phone ?? "",
      organizationIds: [],
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (isEditing) {
      await updateMember.mutateAsync({
        id: member.id.toString(),
        data: values,
      });
    } else {
      await createMember.mutateAsync(values);
    }
    form.reset();
    onClose();
  });

  useEffect(() => {
    if (member) {
      form.setValues({
        name: member.name,
        phone: member.phone,
        organizationIds: member?.organizations?.map((org) => String(org.id)),
      });
    } else {
      form.reset();
    }
  }, [member]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEditing
          ? `${t("edit")} ${t("members.singular_title")}`
          : `${t("add")} ${t("members.singular_title")}`
      }
      centered
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t("name")}
            placeholder={`${t("name")}...`}
            required
            {...form.getInputProps("name")}
          />

          {!isEditing && (
            <TextInput
              label={t("phoneNumber")}
              placeholder={`${t("phoneNumber")}...`}
              required
              {...form.getInputProps("phone")}
            />
          )}

          {user?.type === "admin" && (
            <MultiSelect
              required
              data={organizations?.data?.data?.data?.map((org) => ({
                value: String(org.id),
                label: org.name,
              }))}
              label={t("organization.organizations")}
              placeholder={`${t("organization.organizations")}...`}
              {...form.getInputProps("organizationIds")}
            />
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="gray"
              onClick={onClose}
              disabled={createMember.isPending || updateMember.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={createMember.isPending || updateMember.isPending}
            >
              {isEditing ? t("edit") : t("add")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
