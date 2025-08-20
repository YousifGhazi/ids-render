"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { useDeleteRole, useGetRoles } from "@/features/roles/api";
import { Role } from "@/features/roles/types";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { RoleModal } from "./role-modal";
import { formatDate } from "@/utils/format";
import { Permission } from "@/components/permission";

export function RolesTable() {
  const t = useTranslations();
  const deleteRole = useDeleteRole();
  const [selectedRow, setSelectedRow] = useState<Role | undefined>();
  const modals = useModals();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } = useDataTable<Role>();
  const query = useGetRoles({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Permission can="create-role">
          <Button onClick={open}>
            {t("add")} {t("role.role")}
          </Button>
        </Permission>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "name", title: t("name"), sortable: true },
          { accessor: "type", title: t("type"), sortable: true },
          {
            accessor: "createdAt",
            title: t("createdAt"),
            sortable: true,
            render: (role) => formatDate(role.createdAt),
          },
          {
            accessor: "updatedAt",
            title: t("updatedAt"),
            sortable: true,
            render: (role) => formatDate(role.updatedAt),
          },
          {
            accessor: "actions",
            title: "",
            render: (role) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <Permission can="update-role">
                  <EditButton
                    onClick={() => {
                      setSelectedRow(role);
                      open();
                    }}
                  />
                </Permission>
                <Permission can="delete-role">
                  <DeleteButton
                    onClick={() =>
                      modals.delete(async () => {
                        await deleteRole.mutateAsync(role.id);
                      }, t("role.role"))
                    }
                  />
                </Permission>
              </Group>
            ),
          },
        ]}
        records={query?.data?.data?.data ?? []}
      />

      <RoleModal role={selectedRow} opened={opened} onClose={close} />
    </>
  );
}
