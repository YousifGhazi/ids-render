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
          {t("messages.confirmItemDeletionMessage", { entity })}
        </Text>
      ),
      labels: { confirm: t("delete"), cancel: t("cancel") },
      confirmProps: { color: "red" },
      onCancel: () => modals.closeAll(),
      onConfirm: onDelete,
    });
  };

  const confirmationModal = (onConfirm: () => void, message: string) => {
    modals.openConfirmModal({
      title: t("messages.confirmation"),
      centered: true,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: t("confirm"), cancel: t("cancel") },
      confirmProps: { color: "yellow" },
      onCancel: () => modals.closeAll(),
      onConfirm,
    });
  };

  return { delete: deleteModal, confirm: confirmationModal };
}
