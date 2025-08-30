"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { ApproveButton } from "@/components/buttons/approve-button";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { useMutationNotifications } from "@/hooks/use-mutation-notifications";
import { Badge, Group, MultiSelect } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/format";
import { useDeleteId, useGetIds, useChangeStatus } from "@/features/ids/api";
import { IDCard, status } from "@/features/ids/types";
import { IdCardModal } from "./id-modal";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ViewButton } from "@/components/buttons/view-button";
import { Permission } from "@/components/permission";
import { QRCodeComponent } from "@/components/qr-code";
import { IDCardStatusLabel } from "@/features/ids/ui-helpers";
import { IconSearch } from "@tabler/icons-react";

export function IdsTable() {
  const t = useTranslations();
  const deleteUser = useDeleteId();
  const changeStatus = useChangeStatus();
  const modals = useModals();
  const mutationNotifications = useMutationNotifications();
  const [selectedRow, setSelectedRow] = useState<IDCard | undefined>();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } = useDataTable<IDCard>();
  const [filter, setFilter] = useState<
    { field: string; value: string | string[] }[]
  >([]);
  const query = useGetIds({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
    filter: filter,
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
          },
          {
            accessor: "template.title",
            title: t("templates.singular_title"),
          },
          {
            accessor: "status",
            title: t("status"),
            render: (card) => (
              <Badge variant="light" color="cyan" size="lg" radius="sm">
                {IDCardStatusLabel(card.status, t)}
              </Badge>
            ),
            filter: (
              <MultiSelect
                label={t("status")}
                data={status
                  .filter((status) =>
                    ["PENDING", "APPROVED", "REJECTED"].includes(status.name)
                  )
                  .map((status) => ({
                    value: String(status.id),
                    label: IDCardStatusLabel(status.name, t),
                  }))}
                value={
                  (filter.find((f) => f.field === "statuses")
                    ?.value as string[]) || []
                }
                onChange={(value) => {
                  setFilter((current) => {
                    const otherFilters = current.filter(
                      (f) => f.field !== "statuses"
                    );
                    if (value.length === 0) {
                      return otherFilters;
                    }
                    return [...otherFilters, { field: "statuses", value }];
                  });
                }}
                leftSection={<IconSearch size={16} />}
                comboboxProps={{ withinPortal: false }}
                clearable
                searchable
              />
            ),
            filtering: !!filter.find((f) => f.field === "statuses")?.value,
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
                {card.status === "PENDING" && (
                  // <Permission can="approve-identity">
                  <ApproveButton
                    onClick={() =>
                      modals.confirm(async () => {
                        await changeStatus.mutateAsync(
                          {
                            id: card.id.toString(),
                            data: {
                              status: status.find((s) => s.name === "APPROVED")!
                                .id,
                            },
                          },
                          mutationNotifications.notify("approve")
                        );
                      }, t("messages.confirmApprovalMessage"))
                    }
                  />
                  // </Permission>
                )}
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
