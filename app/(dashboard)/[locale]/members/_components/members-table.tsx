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
import { Permission } from "@/components/permission";
import { BooleanState } from "@/components/icons/boolean-state";
import { MembersUpload } from "./members-upload";
import { IconDownload, IconFileUpload } from "@tabler/icons-react";

export function MembersTable() {
  const t = useTranslations();
  const deleteMember = useDeleteMember();
  const [selectedRow, setSelectedRow] = useState<Member | undefined>();
  const modals = useModals();

  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setSelectedRow(undefined),
  });
  const [openedUpload, { open: openUpload, close: closeUpload }] =
    useDisclosure(false);

  const { pagination, sorting, getTableProps } = useDataTable<Member>();
  const query = useGetMembers({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sorting,
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group>
          <Button
            rightSection={<IconFileUpload size={14} />}
            variant="default"
            onClick={openUpload}
          >
            {t("actions.upload", { item: t("members.plural_title") })}
          </Button>
          <Button
            rightSection={<IconDownload size={14} />}
            variant="default"
            onClick={downloadTemplate}
          >
            {t("actions.downloadTemplate", { item: t("members.plural_title") })}
          </Button>
        </Group>
        <Permission can="create-member">
          <Button
            onClick={() => {
              setSelectedRow(undefined);
              open();
            }}
          >
            {t("add")} {t("members.singular_title")}
          </Button>
        </Permission>
      </Group>

      <DataTable
        {...getTableProps({ query })}
        columns={[
          // {
          //   accessor: "verifiedOTP",
          //   title: t("verifiedOTP"),
          //   render: () => {
          //     // TODO: Replace with actual verification from backend
          //     const isVerified = Math.random() < 0.6;
          //     return (
          //       <Center>
          //         <BooleanState state={isVerified} />
          //       </Center>
          //     );
          //   },
          // },
          // {
          //   accessor: "verifiedSuperQi",
          //   title: t("verifiedSuperQi"),
          //   render: () => {
          //     // TODO: Replace with actual verification from backend
          //     const isVerified = Math.random() < 0.6;
          //     return (
          //       <Center>
          //         <BooleanState
          //           trueProps={{ color: "#f9cd10" }}
          //           state={isVerified}
          //         />
          //       </Center>
          //     );
          //   },
          // },
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
                <Permission can="update-member">
                  <EditButton
                    onClick={() => {
                      setSelectedRow(user);
                      open();
                    }}
                  />
                </Permission>
                <Permission can="delete-member">
                  <DeleteButton
                    onClick={() =>
                      modals.delete(async () => {
                        await deleteMember.mutateAsync(user.id);
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

      <MemberModal member={selectedRow} opened={opened} onClose={close} />
      <MembersUpload opened={openedUpload} onClose={closeUpload} />
    </>
  );
}

const downloadTemplate = () => {
  // Create CSV headers
  const headers = ["Phone Number", "Member Name"];
  const csvContent = headers.join(",") + "\n";

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "members_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
