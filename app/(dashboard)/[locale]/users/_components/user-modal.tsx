"use client";

import { useCreateUser, useUpdateUser } from "@/features/users/api";
import { User } from "@/features/users/types";
import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { IconLock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useGetRoles } from "@/features/roles/api";
import { useEffect } from "react";

interface UserModalProps {
  user?: User;
  opened: boolean;
  onClose: () => void;
}

export function UserModal({ user, opened, onClose }: UserModalProps) {
  const t = useTranslations();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const roles = useGetRoles({
    page: 1,
    pageSize: 100,
  });
  const isEditing = !!user;

  //   const userFormSchema = z.object({
  //     name: z.string().min(1, "Name is required"),
  //     email: z.string().min(1, "Please enter a valid email"),
  //     password:
  //       !isEditing &&
  //       z.string().min(6, "Password must be at least 6 characters long"),
  //     roleId: z.number("Role is required"),
  //   });

  const form = useForm({
    // validate: zodResolver(),
    initialValues: {
      name: user?.name || "",
      password: "",
      email: user?.email || "",
      roleId: user?.roles?.[0]?.id,
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
        roleId: user.roles?.[0]?.id,
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

          <Select
            label={t("type")}
            placeholder={`${t("type")}...`}
            data={roles?.data?.data?.data?.map((role) => {
              return { value: String(role.id), label: role.name };
            })}
            required
            {...form.getInputProps("roleId")}
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

// Helper function to open the user modal
export function openUserModal(user?: User) {
  modals.open({
    modalId: "user-modal",
    title: user ? `Edit ${user.name}` : "Add New User",
    children: (
      <UserModal
        user={user}
        opened={true}
        onClose={() => modals.close("user-modal")}
      />
    ),
    centered: true,
    size: "md",
  });
}
