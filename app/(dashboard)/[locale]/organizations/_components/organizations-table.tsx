"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import {
  useDeleteOrganization,
  useGetOrganizations,
} from "@/features/organizations/api";
import { Organization } from "@/features/organizations/types";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { OrganizationModal } from "./organization-modal";
import { formatDate } from "@/utils/format";

export function OrganizationsTable() {
  const t = useTranslations();
  const deleteOrganization = useDeleteOrganization();
  const [selectedRow, setSelectedRow] = useState<Organization | undefined>();
  const modals = useModals();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } = useDataTable<Organization>();
  const query = useGetOrganizations({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button onClick={open}>
          {t("add")} {t("organization.organization")}
        </Button>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          { accessor: "name", title: t("name"), sortable: true },
          {
            accessor: "description",
            title: t("organization.description"),
            sortable: true,
          },
          {
            accessor: "website",
            title: t("organization.website"),
            sortable: true,
          },
          {
            accessor: "created_at",
            title: t("createdAt"),
            sortable: true,
            render: (organization) => formatDate(organization.created_at),
          },
          {
            accessor: "updated_at",
            title: t("updatedAt"),
            sortable: true,
            render: (organization) => formatDate(organization.updated_at),
          },
          {
            accessor: "actions",
            title: "",
            render: (organization) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <EditButton
                  onClick={() => {
                    setSelectedRow(organization);
                    open();
                  }}
                />
                <DeleteButton
                  onClick={() =>
                    modals.delete(async () => {
                      await deleteOrganization.mutateAsync(organization.id);
                    }, t("organization.organization"))
                  }
                />
              </Group>
            ),
          },
        ]}
        records={query?.data?.data?.data ?? []}
      />

      <OrganizationModal
        organization={selectedRow}
        opened={opened}
        onClose={close}
      />
    </>
  );
}
