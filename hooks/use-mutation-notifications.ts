import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";

interface UseMutationNotificationsOptions {
  onSuccess?: () => void;
  onError?: () => void;
}

export function useMutationNotifications(
  prop?: UseMutationNotificationsOptions
) {
  const t = useTranslations();
  const { onSuccess, onError } = prop || {};
  const showSuccessNotification = (
    action: "created" | "updated" | "deleted" | "approved"
  ) => {
    const actionKey =
      action === "created"
        ? "createdSuccessfully"
        : action === "updated"
        ? "updatedSuccessfully"
        : action === "deleted"
        ? "deletedSuccessfully"
        : "approvedSuccessfully";

    notifications.show({
      title: t("messages.success"),
      message: `${t(`messages.${actionKey}`)}`,
      color: "green",
    });

    onSuccess?.();
  };

  const showErrorNotification = (
    action: "create" | "update" | "delete" | "approve"
  ) => {
    const actionKey =
      action === "create"
        ? "failedToCreate"
        : action === "update"
        ? "failedToUpdate"
        : action === "delete"
        ? "failedToDelete"
        : "failedToApprove";

    notifications.show({
      title: t("messages.error"),
      message: `${t(`messages.${actionKey}`)}`,
      color: "red",
    });

    onError?.();
  };

  const notify = (action: "create" | "update" | "delete" | "approve") => ({
    onSuccess: () => {
      const successAction =
        action === "create"
          ? "created"
          : action === "update"
          ? "updated"
          : action === "delete"
          ? "deleted"
          : "approved";
      showSuccessNotification(
        successAction as "created" | "updated" | "deleted" | "approved"
      );
    },
    onError: () => showErrorNotification(action),
  });

  return {
    showSuccessNotification,
    showErrorNotification,
    notify,
  };
}
