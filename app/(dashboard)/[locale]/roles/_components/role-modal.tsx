"use client";

import { useCreateRole, useGetRole, useUpdateRole } from "@/features/roles/api";
import { Role, RoleType } from "@/features/roles/types";
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useGetPermissions } from "@/features/permissions/api";

interface RoleModalProps {
  role?: Role;
  opened: boolean;
  onClose: () => void;
}

export function RoleModal({ role, opened, onClose }: RoleModalProps) {
  const isEditing = !!role;
  const form = useForm<{
    name: string;
    type: RoleType;
    permissions: string[];
  }>({
    initialValues: {
      name: role?.name || "",
      type: role?.type || "admin",
      permissions: [],
    },
  });

  const t = useTranslations();
  const createRole = useCreateRole({
    onSuccess: () => {
      notifications.show({
        title: t("messages.success"),
        message: `${t("role.role")} ${t("messages.createdSuccessfully")}`,
        color: "green",
      });
    },
  });
  const updateRole = useUpdateRole({
    onSuccess: () => {
      notifications.show({
        title: t("messages.success"),
        message: `${t("role.role")} ${t("messages.updatedSuccessfully")}`,
        color: "green",
      });
    },
  });

  const permissions = useGetPermissions({
    page: 1,
    pageSize: 100,
    filter: [
      {
        field: "type",
        value: form.values.type as string,
      },
    ],
  });

  const currentRole = useGetRole(role?.id ?? "", {
    enabled: !!role?.id,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    const data = {
      ...values,
      permissions: values.permissions.map((p) => parseInt(p, 10)),
    };
    if (isEditing && role) {
      await updateRole.mutateAsync({
        id: role.id,
        data: data,
      });
    } else {
      await createRole.mutateAsync(data);
    }
    form.reset();
    onClose();
  });

  useEffect(() => {
    if (role) {
      form.setValues({
        name: role.name,
        type: role.type,
        permissions:
          currentRole?.data?.permissions?.map((p) => String(p.id)) ?? [],
      });
    } else {
      form.reset();
    }
  }, [role]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEditing
          ? `${t("edit")} ${t("role.role")}`
          : `${t("add")} ${t("role.role")}`
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

          <Select
            label={t("type")}
            placeholder={`${t("type")}...`}
            data={[
              { value: "admin", label: "Admin" },
              { value: "organization", label: "Organization" },
            ]}
            required
            {...form.getInputProps("type")}
          />
          <MultiSelect
            multiple={true}
            label={t("permission.permissions")}
            placeholder={`${t("permission.permissions")}...`}
            data={permissions?.data?.data?.data.map((permission) => ({
              value: String(permission.id),
              label: permission.name,
            }))}
            required
            {...form.getInputProps("permissions")}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="gray"
              onClick={onClose}
              disabled={createRole.isPending || updateRole.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={createRole.isPending || updateRole.isPending}
            >
              {isEditing ? t("edit") : t("add")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
