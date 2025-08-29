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
import { IDCard } from "@/features/ids/types";
import { PaymentModal } from "./payment-modal";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ViewButton } from "@/components/buttons/view-button";
import { Permission } from "@/components/permission";

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
          },
          {
            accessor: "price",
            title: t("price"),
            render: () => "15,000 IQD",
          },

          {
            accessor: "createdAt",
            title: t("createdAt"),

            render: (record) => formatDate(record.createdAt),
          },
          {
            accessor: "updatedAt",
            title: t("updatedAt"),

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

                  <PayButton
                    onClick={() =>
                      modals.confirm(async () => {
                        // TODO: Replace with actual payment logic
                      }, t("payments.confirmPaymentMessage", { amount: "15,000 IQD" }))
                    }
                  />
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
