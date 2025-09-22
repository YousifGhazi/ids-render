"use client";

import { Button, FileInput, Group, Modal, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useUploadMembers } from "@/features/members/api";
import { useGetOrganizations } from "@/features/organizations/api";
import { useAuthStore } from "@/features/auth/store";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";

interface MemberModalProps {
  opened: boolean;
  onClose: () => void;
}

export function MembersUpload({ opened, onClose }: MemberModalProps) {
  const t = useTranslations();
  const { notify } = useMutationNotifications();
  const { user } = useAuthStore();

  const uploadMembers = useUploadMembers(notify("update"));
  const organizations = useGetOrganizations({
    page: 1,
    pageSize: 100,
  });

  const form = useForm<{
    file: File | null;
    organizationId?: string;
  }>({
    initialValues: {
      file: null,
      organizationId: undefined,
    },
    validate: {
      file: (value) => (!value ? t("validation.required") : null),
      organizationId: (value) =>
        user?.type === "admin" && !value ? t("validation.required") : null,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!values.file) return;

    await uploadMembers.mutateAsync({
      file: values.file,
      organization_id: values.organizationId
        ? parseInt(values.organizationId)
        : undefined,
    });

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
            accept=".xlsx"
            label={t("file.selectFile")}
            placeholder={t("file.selectFile")}
            required
            {...form.getInputProps("file")}
          />

          {user?.type === "admin" && (
            <Select
              required
              data={organizations?.data?.data?.data?.map((org) => ({
                value: String(org.id),
                label: org.name,
              }))}
              label={t("organization.organizations")}
              placeholder={`${t("organization.organizations")}...`}
              {...form.getInputProps("organizationId")}
            />
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="gray"
              onClick={onClose}
              disabled={uploadMembers.isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" loading={uploadMembers.isPending}>
              {t("add")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
