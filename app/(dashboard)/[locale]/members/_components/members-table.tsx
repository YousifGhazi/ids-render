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
<<<<<<< HEAD
import { BooleanState } from "@/components/icons/boolean-state";
=======
>>>>>>> upstream/main
import { MembersUpload } from "./members-upload";
import { IconDownload, IconFileUpload } from "@tabler/icons-react";
import { api } from "@/api/client";

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
            onClick={async () => {
              try {
                const response = await api.get("/member/excel/download", {
                  responseType: "arraybuffer",
                });

                const blob = new Blob([response.data], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "members_template.xlsx";
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Error downloading template:", error);
              }
            }}
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
          { accessor: "name", title: t("name"), sortable: true },
          { accessor: "phone", title: t("phoneNumber"), sortable: true },
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
                      })
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
<<<<<<< HEAD

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
=======
>>>>>>> upstream/main
