"use client";

import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/features/organizations/api";
import { Organization } from "@/features/organizations/types";
import {
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";

interface OrganizationModalProps {
  organization?: Organization;
  opened: boolean;
  onClose: () => void;
}

export function OrganizationModal({
  organization,
  opened,
  onClose,
}: OrganizationModalProps) {
  const isEditing = !!organization;
  const form = useForm<{
    name: string;
    description: string;
    website?: string;
    logo?: string;
  }>({
    initialValues: {
      name: organization?.name || "",
      description: organization?.description || "",
      website: organization?.website || "",
      logo: organization?.logo || "",
    },
  });

  const t = useTranslations();
  const { notify } = useMutationNotifications();

  const createOrganization = useCreateOrganization(notify("create"));
  const updateOrganization = useUpdateOrganization(notify("update"));

  const handleSubmit = form.onSubmit(async (values) => {
    const data = {
      ...values,
      website: values.website || undefined,
      logo: values.logo || undefined,
    };

    if (isEditing && organization) {
      await updateOrganization.mutateAsync({
        id: organization.id,
        data: data,
      });
    } else {
      await createOrganization.mutateAsync(data);
    }
    form.reset();
    onClose();
  });

  useEffect(() => {
    if (organization) {
      form.setValues({
        name: organization.name,
        description: organization.description,
        website: organization.website || "",
        logo: organization.logo || "",
      });
    } else {
      form.reset();
    }
  }, [organization]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEditing
          ? `${t("edit")} ${t("organization.organization")}`
          : `${t("add")} ${t("organization.organization")}`
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

          <Textarea
            label={t("organization.description")}
            placeholder={`${t("organization.description")}...`}
            required
            minRows={3}
            {...form.getInputProps("description")}
          />

          <TextInput
            label={t("organization.website")}
            placeholder={`${t("organization.website")}...`}
            {...form.getInputProps("website")}
          />

          <TextInput
            label={t("organization.logo")}
            placeholder={`${t("organization.logo")}...`}
            {...form.getInputProps("logo")}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="gray"
              onClick={onClose}
              disabled={
                createOrganization.isPending || updateOrganization.isPending
              }
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              loading={
                createOrganization.isPending || updateOrganization.isPending
              }
            >
              {isEditing ? t("edit") : t("add")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
