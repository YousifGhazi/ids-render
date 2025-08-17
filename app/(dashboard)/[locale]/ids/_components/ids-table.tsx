"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Button, Group } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/format";
import { useDeleteId, useGetIds } from "@/features/ids/api";
import { IDCard } from "@/features/ids/types";
import {  IdCardModal } from "./id-modal";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";

export function IdsTable() {
  const t = useTranslations();
  const deleteUser = useDeleteId();
  const modals = useModals();
  const [selectedRow, setSelectedRow] = useState<IDCard | undefined>();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } = useDataTable<IDCard>();
  const query = useGetIds({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button
          onClick={() => {
            console.log("users");
          }}
        >
          {t("add")} {t("user.user")}
        </Button>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "id", title: t("id") },
          { accessor: "member.name", title: t("members.name"), sortable: true },
          { accessor: "member.phone", title: t("members.phone"), sortable: true },
          { accessor: "type", title: t("type"), sortable: true },
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
            render: (card) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <EditButton
                  onClick={() => {
                    setSelectedRow(card);
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

      <IdCardModal idCard={selectedRow} opened={opened} onClose={close} />
    </>
  );
}
