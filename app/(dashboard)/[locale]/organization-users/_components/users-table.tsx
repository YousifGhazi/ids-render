"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { OrganizationUser } from "@/features/organization-users/types";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Button, Center, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UserModal } from "./user-modal";
import { formatDate } from "@/utils/format";
import {
  useDeleteOrganizationUser,
  useGetOrganizationUsers,
} from "@/features/organization-users/api";
import { Permission } from "@/components/permission";

export function UsersTable() {
  const t = useTranslations();
  const [selectedRow, setSelectedRow] = useState<
    OrganizationUser | undefined
  >();
  const modals = useModals();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } =
    useDataTable<OrganizationUser>();

  const deleteUser = useDeleteOrganizationUser();
  const query = useGetOrganizationUsers({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Permission can="create-organization-user">
          <Button
            onClick={() => {
              setSelectedRow(undefined);
              open();
            }}
          >
            {t("add")} {t("user.user")}
          </Button>
        </Permission>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "name", title: t("name"), sortable: true },
          {
            accessor: "phone",
            title: t("phoneNumber"),
          },
          {
            accessor: "organization.name",
            title: t("organization.organization"),
          },
          {
            accessor: "createdAt",
            title: t("createdAt"),

            render: (user) => formatDate(user.createdAt),
          },
          {
            accessor: "updatedAt",
            title: t("updatedAt"),

            render: (user) => formatDate(user.updatedAt),
          },
          {
            accessor: "actions",
            title: "",
            render: (user) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <Permission can="update-organization-user">
                  <EditButton
                    onClick={() => {
                      setSelectedRow(user);
                      open();
                    }}
                  />
                </Permission>
                <Permission can="delete-organization-user">
                  <DeleteButton
                    onClick={() =>
                      modals.delete(async () => {
                        await deleteUser.mutateAsync(user.id);
                      }, t("user.user"))
                    }
                  />
                </Permission>
              </Group>
            ),
          },
        ]}
        records={query?.data?.data?.data ?? []}
      />

      <UserModal user={selectedRow} opened={opened} onClose={close} />
    </>
  );
}
