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
    action: "created" | "updated" | "deleted"
  ) => {
    const actionKey =
      action === "created"
        ? "createdSuccessfully"
        : action === "updated"
        ? "updatedSuccessfully"
        : "deletedSuccessfully";

    notifications.show({
      title: t("messages.success"),
      message: `${t(`messages.${actionKey}`)}`,
      color: "green",
    });

    onSuccess?.();
  };

  const showErrorNotification = (action: "create" | "update" | "delete") => {
    const actionKey =
      action === "create"
        ? "failedToCreate"
        : action === "update"
        ? "failedToUpdate"
        : "failedToDelete";

    notifications.show({
      title: t("messages.error"),
      message: `${t(`messages.${actionKey}`)}`,
      color: "red",
    });

    onError?.();
  };

  const notify = (action: "create" | "update" | "delete") => ({
    onSuccess: () => {
      const successAction =
        action === "create"
          ? "created"
          : action === "update"
          ? "updated"
          : "deleted";
      showSuccessNotification(
        successAction as "created" | "updated" | "deleted"
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
