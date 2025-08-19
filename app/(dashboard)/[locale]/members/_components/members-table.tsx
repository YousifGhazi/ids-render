"use client";

import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { useDataTable } from "@/hooks/use-datatable";
import { useModals } from "@/hooks/use-modals";
import { Button, Center, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MemberModal } from "./member-modal";
import { formatDate } from "@/utils/format";
import { useDeleteMember, useGetMembers } from "@/features/members/api";
import { Member } from "@/features/members/types";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";

export function MembersTable() {
  const t = useTranslations();
  const deleteMember = useDeleteMember();
  const [selectedRow, setSelectedRow] = useState<Member | undefined>();
  const modals = useModals();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });

  const { pagination, sorting, getTableProps } = useDataTable<Member>();
  const query = useGetMembers({
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
          {t("add")} {t("members.singular_title")}
        </Button>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          {
            accessor: "logo",
            title: t("verified"),
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
          { accessor: "phone", title: t("phoneNumber"), sortable: true },
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
                      await deleteMember.mutateAsync(user.id);
                    }, t("user.user"))
                  }
                />
              </Group>
            ),
          },
        ]}
        records={query?.data?.data?.data ?? []}
      />

      <MemberModal member={selectedRow} opened={opened} onClose={close} />
    </>
  );
}
