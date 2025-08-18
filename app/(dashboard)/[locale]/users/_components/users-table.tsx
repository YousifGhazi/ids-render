"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { useDeleteUser, useGetUsers } from "@/features/users/api";
import { User } from "@/features/users/types";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UserModal } from "./user-modal";
import { formatDate } from "@/utils/format";

export function UsersTable() {
  const t = useTranslations();
  const deleteUser = useDeleteUser();
  const [selectedRow, setSelectedRow] = useState<User | undefined>();
  const modals = useModals();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } = useDataTable<User>();
  const query = useGetUsers({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button
          onClick={() => {
            setSelectedRow(undefined);
            open();
          }}
        >
          {t("add")} {t("user.user")}
        </Button>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "name", title: t("name"), sortable: true },
          { accessor: "email", title: t("email"), sortable: true },
          {
            accessor: "roles",
            title: t("role.roles"),
            render: (user) => user?.roles?.map((role) => role.name).join(", "),
            sortable: true,
          },
          {
            accessor: "createdAt",
            title: t("createdAt"),
            sortable: true,
            render: (user) => formatDate(user.createdAt),
          },
          {
            accessor: "updatedAt",
            title: t("updatedAt"),
            sortable: true,
            render: (user) => formatDate(user.updatedAt),
          },
          {
            accessor: "actions",
            title: "",
            render: (user) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <EditButton
                  onClick={() => {
                    setSelectedRow(user);
                    open();
                  }}
                />
                <DeleteButton
                  onClick={() =>
                    modals.delete(async () => {
                      await deleteUser.mutateAsync(user.id);
                    }, t("user.user"))
                  }
                />
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
