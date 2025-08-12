"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { useGetCustomers } from "@/features/customers/api";
import { Customer } from "@/features/customers/types";
import { useDataTable } from "@/hooks/use-datatable";
import { Container, Group, Paper } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Home() {
  const t = useTranslations();

  // set modal type and pass it selectedRow for view/add/edit
  const [selectedRow, setSelectedRow] = useState<Customer | undefined>();
  const [modalType, setModalType] = useState<
    "edit" | "delete" | "view" | undefined
  >();

  const { pagination, sorting, getTableProps } = useDataTable<Customer>();

  const query = useGetCustomers({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <DataTable
          {...getTableProps({ query })}
          columns={[
            { accessor: "name", title: t("name"), sortable: true },
            { accessor: "phoneNumber", title: t("phoneNumber") },
            { accessor: "gender", title: t("gender") },
            { accessor: "organization", title: t("organization") },
            { accessor: "department", title: t("department") },
            { accessor: "dateOfBirth", title: t("dateOfBirth") },
            {
              accessor: "actions",
              title: "",
              render: (customer) => (
                <Group gap={4} wrap="nowrap" justify="center">
                  <EditButton
                    onClick={() => {
                      setSelectedRow(customer);
                      setModalType("edit");
                    }}
                  />
                  <DeleteButton onClick={() => setSelectedRow(customer)} />
                </Group>
              ),
            },
          ]}
          records={query?.data?.data}
        />
      </Container>
    </Paper>
  );
}
