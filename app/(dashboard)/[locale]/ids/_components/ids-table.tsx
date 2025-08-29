"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Group } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/format";
import { useDeleteId, useGetIds } from "@/features/ids/api";
import { IDCard } from "@/features/ids/types";
import { IdCardModal } from "./id-modal";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ViewButton } from "@/components/buttons/view-button";
import { Permission } from "@/components/permission";
import { QRCodeComponent } from "@/components/qr-code";

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
      <DataTable
        {...getTableProps({ query })}
        columns={[
          {
            accessor: "uniqueKey",
            title: t("qr_code"),
            width: 80,
            render: (card) => (
              <QRCodeComponent value={card.uniqueKey} size={60} />
            ),
          },
          { accessor: "id", title: t("id") },
          { accessor: "member.name", title: t("members.name"), sortable: true },
          {
            accessor: "member.phone",
            title: t("members.phone"),
            sortable: true,
          },
          {
            accessor: "template.title",
            title: t("templates.singular_title"),
            sortable: true,
          },
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
                <Permission can="show-identity">
                  <ViewButton
                    onClick={() => {
                      setSelectedRow(card);
                      open();
                    }}
                  />
                </Permission>
                <Permission can="delete-identity">
                  <DeleteButton
                    onClick={() =>
                      modals.delete(async () => {
                        await deleteUser.mutateAsync(card.id);
                      }, t("ids.singular_title"))
                    }
                  />
                </Permission>
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
