"use client";

import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Badge, Button, Center, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatDate } from "@/utils/format";
import { useDeleteMember, useGetMembers } from "@/features/members/api";
import { Member } from "@/features/members/types";

export function PrinterTable() {
  // TODO: Implement this page when backend is ready
  const t = useTranslations();

  const { pagination, sorting, getTableProps } = useDataTable<Member>();
  const query = useGetMembers({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "name", title: t("name"), sortable: true },
          { accessor: "phone", title: t("phoneNumber"), sortable: true },
          {
            accessor: "idNumber",
            title: t("ids.idNumber"),
            render: () => {
              // return a random number with 12 digit lenght each 4 digits seprated by dash
              return Math.floor(Math.random() * 1000000000000)
                .toString()
                .replace(/(\d{4})(?=\d)/g, "$1-");
            },
          },
          {
            accessor: "status",
            title: t("printer.printStatus"),
            sortable: true,
            render: () => {
              const statuses = {
                "بانتظار الطباعة": "red",
                "قيد المعالجة": "yellow",
                "تمت الطباعة": "green",
                "جاهزة للاستلام": "blue",
              };
              // pick random status with it's color
              const status = Object.keys(statuses)[
                Math.floor(Math.random() * Object.keys(statuses).length)
              ] as keyof typeof statuses;

              return (
                <Badge color={statuses[status]} variant="light">
                  {status}
                </Badge>
              );
            },
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
        ]}
        records={query?.data?.data?.data ?? []}
      />
    </>
  );
}
