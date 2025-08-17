"use client";

import { User } from "@/features/users/types";
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { IconLock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useGetRoles } from "@/features/roles/api";
import { useEffect } from "react";
import {
  useCreateOrganizationUser,
  useUpdateOrganizationUser,
} from "@/features/organization-users/api";

interface UserModalProps {
  user?: User;
  opened: boolean;
  onClose: () => void;
}

export function UserModal({ user, opened, onClose }: UserModalProps) {
  const t = useTranslations();
  const createUser = useCreateOrganizationUser();
  const updateUser = useUpdateOrganizationUser();

  const roles = useGetRoles({
    page: 1,
    pageSize: 100,
  });
  const isEditing = !!user;

  const form = useForm<{
    name: string;
    email: string;
    password: string;
    type: string;
    roleIds: string[];
  }>({
    initialValues: {
      name: user?.name || "",
      password: "",
      email: user?.email || "",
      type: "admin",
      roleIds: [],
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (isEditing && user) {
      await updateUser.mutateAsync(
        {
          id: user.id.toString(),
          data: values,
        },
        {
          onError: () => {
            notifications.show({
              title: t("messages.error"),
              message: `${t("user.user")} ${t("messages.failedToUpdate")}`,
              color: "red",
            });
          },
        }
      );
      notifications.show({
        title: t("messages.success"),
        message: `${t("user.user")} ${t("messages.updatedSuccessfully")}`,
        color: "green",
      });
    } else {
      await createUser.mutateAsync(values, {
        onError: () => {
          notifications.show({
            title: t("messages.error"),
            message: `${t("user.user")} ${t("messages.failedToCreate")}`,
            color: "red",
          });
        },
      });
      notifications.show({
        title: t("messages.success"),
        message: `${t("user.user")} ${t("messages.createdSuccessfully")}`,
        color: "green",
      });
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
      });
    } else {
      form.reset();
    }
  }, [user]);

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
