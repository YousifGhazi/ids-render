"use client";

import { PayButton } from "@/components/buttons/pay-button";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Badge, Group } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/format";
// Temporarily using IDs API and types until payments feature is created
import { useGetIds } from "@/features/ids/api";
import { IDCard, PaymentStatus } from "@/features/ids/types";
import { PaymentModal } from "./payment-modal";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ViewButton } from "@/components/buttons/view-button";
import { Permission } from "@/components/permission";
import { PaymentStatusLabel } from "@/features/ids/ui-helpers";

export function PaymentsTable() {
  const t = useTranslations();
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

  const status: PaymentStatus[] = [
    "pending",
    "completed-superQi",
    "cash",
    "branch",
    "failed",
  ];

  const currentStatus = status[Math.floor(Math.random() * status.length)];

  return (
    <>
      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "id", title: t("id") },
          { accessor: "member.name", title: t("members.name"), sortable: true },
          {
            accessor: "member.phone",
            title: t("members.phone"),
            sortable: true,
          },
          {
            accessor: "price",
            title: t("price"),
            render: () => "15,000 IQD",
          },
          {
            accessor: "status",
            title: t("status"),
            render: (record) => {
              // Store the status on the record for use in actions
              (record as any).currentStatus = currentStatus;
              return (
                <Badge
                  variant="light"
                  color={
                    currentStatus === "pending"
                      ? "yellow"
                      : currentStatus === "failed"
                      ? "red"
                      : "green"
                  }
                  size="lg"
                  radius="sm"
                >
                  {PaymentStatusLabel(currentStatus, t)}
                </Badge>
              );
            },
          },

          {
            accessor: "createdAt",
            title: t("createdAt"),
            sortable: true,
            render: (record) => formatDate(record.createdAt),
          },
          {
            accessor: "updatedAt",
            title: t("updatedAt"),
            sortable: true,
            render: (record) => formatDate(record.updatedAt),
          },
          {
            accessor: "actions",
            title: "",
            render: (payment) => {
              const canPay =
                currentStatus === "failed" || currentStatus === "pending";

              return (
                <Group gap={4} wrap="nowrap" justify="center">
                  {/* TODO: enable permissions when ready */}
                  {/* <Permission can="show-payment"> */}
                  <ViewButton
                    onClick={() => {
                      setSelectedRow(payment);
                      open();
                    }}
                  />
                  {/* <Permission can="pay-payment"> */}
                  {canPay && (
                    <PayButton
                      onClick={() =>
                        modals.confirm(async () => {
                          // TODO: Replace with actual payment logic
                        }, t("payments.confirmPaymentMessage", { amount: "15,000 IQD" }))
                      }
                    />
                  )}
                  {/* </Permission> */}
                </Group>
              );
            },
          },
        ]}
        records={query?.data?.data?.data ?? []}
      />

      <PaymentModal payment={selectedRow} opened={opened} onClose={close} />
    </>
  );
}
