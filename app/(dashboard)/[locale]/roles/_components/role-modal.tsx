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
  Tree,
  useTree,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useGetPermissions } from "@/features/permissions/api";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";
import { permissionsToNestedTree } from "@/features/permissions/utils";
import { TreeCheckbox } from "@/components/tree-checkbox";

interface RoleModalProps {
  role?: Role;
  opened: boolean;
  onClose: () => void;
}

export function RoleModal({ role, opened, onClose }: RoleModalProps) {
  const t = useTranslations();

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

  const tree = useTree();

  const { notify } = useMutationNotifications();
  const createRole = useCreateRole(notify("create"));
  const updateRole = useUpdateRole(notify("update"));
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

  const permissionsTree = useMemo(
    () => permissionsToNestedTree(permissions.data?.data?.data || [], t) ?? [],
    [permissions.data]
  );

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
      const permissions =
        currentRole?.data?.permissions?.map((p) => String(p.id)) ?? [];
      form.setValues({
        name: role.name,
        type: role.type,
      });
      tree.setCheckedState(permissions);
    } else {
      form.reset();
      tree.setCheckedState([]);
    }
  }, [role, currentRole?.data]);

  useEffect(() => {
    form.setFieldValue("permissions", tree.checkedState);
  }, [tree.checkedState]);

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

          <Tree
            tree={tree}
            data={permissionsTree}
            levelOffset={30}
            expandOnClick={false}
            renderNode={TreeCheckbox}
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
