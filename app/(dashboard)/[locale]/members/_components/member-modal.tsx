"use client";

import { usecreateMember, useupdateMember } from "@/features/users/api";
import {
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import { useGetRoles } from "@/features/roles/api";
import { useEffect } from "react";
import { Member } from "@/features/members/types";
import { useCreateMember, useUpdateMember } from "@/features/members/api";

interface MemberModalProps {
  member?: Member;
  opened: boolean;
  onClose: () => void;
}

export function MemberModal({ member, opened, onClose }: MemberModalProps) {
  const t = useTranslations();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEditing = !!member;

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
      name: member?.name ?? "",
      phone: member?.phone ?? "",
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (isEditing && member) {
      await updateMember.mutateAsync(
        {
          id: member.id.toString(),
          data: values,
        },
        {
          onError: () => {
            notifications.show({
              title: t("messages.error"),
              message: `${t("members.singular_title")} ${t("messages.failedToUpdate")}`,
              color: "red",
            });
          },
        }
      );
      notifications.show({
        title: t("messages.success"),
        message: `${t("members.singular_title")} ${t("messages.updatedSuccessfully")}`,
        color: "green",
      });
    } else {
      await createMember.mutateAsync(values, {
        onError: () => {
          notifications.show({
            title: t("messages.error"),
            message: `${t("members.singular_title")} ${t("messages.failedToCreate")}`,
            color: "red",
          });
        },
      });
      notifications.show({
        title: t("messages.success"),
        message: `${t("members.singular_title")} ${t("messages.createdSuccessfully")}`,
        color: "green",
      });
    }
    form.reset();
    onClose();
  });

  useEffect(() => {
    if (member) {
      form.setValues({
        name: member.name,
        phone: member.phone,
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

          <TextInput
            label={t("members.phone")}
            placeholder={`${t("members.phone")}...`}
            required
            {...form.getInputProps("phone")}
          />

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

// Helper function to open the user modal
export function openUserModal(member?: Member) {
  modals.open({
    modalId: "member-modal",
    title: member ? `Edit ${member.name}` : "Add New Member",
    children: (
      <MemberModal
        member={member}
        opened={true}
        onClose={() => modals.close("member-modal")}
      />
    ),
    centered: true,
    size: "md",
  });
}
