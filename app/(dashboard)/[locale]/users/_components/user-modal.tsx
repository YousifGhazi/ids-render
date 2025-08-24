"use client";

import { useCreateUser, useUpdateUser } from "@/features/users/api";
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
import { useGetRoles } from "@/features/roles/api";
import { useEffect } from "react";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";

interface UserModalProps {
  user?: User;
  opened: boolean;
  onClose: () => void;
}

export function UserModal({ user, opened, onClose }: UserModalProps) {
  const t = useTranslations();
  const { notify } = useMutationNotifications();
  const createUser = useCreateUser(notify("create"));
  const updateUser = useUpdateUser(notify("update"));

  const roles = useGetRoles({
    page: 1,
    pageSize: 100,
    filter: [
      {
        field: "type",
        value: "admin",
      },
    ],
  });
  const isEditing = !!user;

  const form = useForm<{
    name: string;
    phone: string;
    type: string;
    roleIds: string[];
  }>({
    initialValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      type: "admin",
      roleIds: [],
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (isEditing && user) {
      await updateUser.mutateAsync({
        id: user.id.toString(),
        data: values,
      });
    } else {
      await createUser.mutateAsync(values);
    }
    form.reset();
    onClose();
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        phone: user.phone,
        roleIds: user.roles?.map((role) => String(role.id)) || [],
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

          {/* <TextInput
            label={t("email")}
            placeholder={`${t("email")}...`}
            type="email"
            required
            {...form.getInputProps("email")}
          /> */}

          {/* {!isEditing && (
            <PasswordInput
              key={form.key("password")}
              {...form.getInputProps("password")}
              label={t("password")}
              placeholder={`${t("password")}...`}
              leftSection={<IconLock size={16} />}
              required={!isEditing}
            />
          )} */}

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
