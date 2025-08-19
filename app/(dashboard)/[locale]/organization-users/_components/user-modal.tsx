"use client";

import { OrganizationUser } from "@/features/organization-users/types";
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { IconLock } from "@tabler/icons-react";
import { useGetRoles } from "@/features/roles/api";
import { useEffect } from "react";
import {
  useCreateOrganizationUser,
  useUpdateOrganizationUser,
} from "@/features/organization-users/api";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";
import { useGetOrganizations } from "@/features/organizations/api";

interface UserModalProps {
  user?: OrganizationUser;
  opened: boolean;
  onClose: () => void;
}

export function UserModal({ user, opened, onClose }: UserModalProps) {
  const t = useTranslations();
  const { notify } = useMutationNotifications();
  const createUser = useCreateOrganizationUser(notify("create"));
  const updateUser = useUpdateOrganizationUser(notify("update"));
  const organizations = useGetOrganizations({
    page: 1,
    pageSize: 100,
  });

  const roles = useGetRoles({
    page: 1,
    pageSize: 100,
    filter: [
      {
        field: "type",
        value: "organization",
      },
    ],
  });
  const isEditing = !!user;

  const form = useForm<{
    name: string;
    email: string;
    password: string;
    type: string;
    roleIds: string[];
    organizationId: string;
  }>({
    initialValues: {
      name: user?.name || "",
      password: "",
      email: user?.email || "",
      type: "organization_user",
      roleIds: [],
      organizationId: "",
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    const data = {
      ...values,
      organizationId: Number(values.organizationId),
      roleIds: values.roleIds.map(Number),
    };
    if (isEditing && user) {
      await updateUser.mutateAsync({
        id: user.id.toString(),
        data,
      });
    } else {
      await createUser.mutateAsync(data);
    }
    form.reset();
    onClose();
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        email: user.email,
        roleIds: user.roles?.map((role) => String(role.id)) || [],
        organizationId: String(user.organization?.id || ""),
      });
    } else {
      form.reset();
    }
  }, [user, roles?.data]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEditing
          ? `${t("edit")} ${t("user.user")}`
          : `${t("add")} ${t("user.user")}`
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
          <TextInput
            label={t("email")}
            placeholder={`${t("email")}...`}
            type="email"
            required
            {...form.getInputProps("email")}
          />
          {!isEditing && (
            <PasswordInput
              key={form.key("password")}
              {...form.getInputProps("password")}
              label={t("password")}
              placeholder={`${t("password")}...`}
              leftSection={<IconLock size={16} />}
              required={!isEditing}
            />
          )}

          <Select
            required
            data={organizations?.data?.data?.data?.map((org) => ({
              value: String(org.id),
              label: org.name,
            }))}
            label={t("organization.organization")}
            placeholder={`${t("organization.organization")}...`}
            {...form.getInputProps("organizationId")}
          />
          <MultiSelect
            label={t("role.roles")}
            placeholder={`${t("role.roles")}...`}
            data={roles?.data?.data?.data?.map((role) => {
              return { value: String(role.id), label: role.name };
            })}
            required
            {...form.getInputProps("roleIds")}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="gray"
              onClick={onClose}
              disabled={createUser.isPending || updateUser.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={createUser.isPending || updateUser.isPending}
            >
              {isEditing ? t("edit") : t("add")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
