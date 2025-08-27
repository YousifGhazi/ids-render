import { Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useTranslations } from "next-intl";

export function useModals() {
  const t = useTranslations();
  const deleteModal = (onDelete: () => void, entity: string = t("item")) => {
    modals.openConfirmModal({
      title: t("messages.confirmDeletion"),
      centered: true,
      children: (
        <Text size="sm">
          {t("messages.confirmDeletionMessage", { entity })}
        </Text>
      ),
      labels: { confirm: t("delete"), cancel: t("cancel") },
      confirmProps: { color: "red" },
      onCancel: () => modals.closeAll(),
      onConfirm: onDelete,
    });
  };

  return { delete: deleteModal };
}
