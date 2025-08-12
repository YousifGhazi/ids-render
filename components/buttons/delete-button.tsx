"use client";

import { ActionIcon, type ActionIconProps, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function DeleteButton({
  onClick,
  variant = "subtle",
}: {
  onClick?: () => void;
  variant?: ActionIconProps["variant"];
}) {
  const t = useTranslations();
  return (
    <Tooltip label={t("delete")} withArrow>
      <ActionIcon color="red" variant={variant} onClick={onClick}>
        <IconTrash size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
