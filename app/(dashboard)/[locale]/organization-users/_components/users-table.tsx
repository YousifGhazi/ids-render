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
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
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
  const fakeIraqiPhoneNumbers = [
    "07502324323",
    "07804332222",
    "07901334354",
    "07805332822",
    "07905332821",
  ];
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
          {
            accessor: "verifiedOTP",
            title: t("verifiedOTP"),
            render: (member) => {
              // TODO: Replace with actual verification from backend
              const isVerified = Math.random() < 0.6;
              return (
                <Center>
                  {isVerified ? (
                    <IconCircleCheck color="green" size={30} key={member.id} />
                  ) : (
                    <IconCircleX color="red" size={30} key={member.id} />
                  )}
                </Center>
              );
            },
          },
          { accessor: "name", title: t("name"), sortable: true },
          {
            accessor: "phone",
            title: t("phoneNumber"),
            render: () => {
              return fakeIraqiPhoneNumbers[
                Math.floor(Math.random() * fakeIraqiPhoneNumbers.length)
              ];
            },
          },
          { accessor: "email", title: t("email"), sortable: true },
          {
            accessor: "organization.name",
            title: t("organization.organization"),
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
