"use client";

import { ActionIcon, type ActionIconProps, Tooltip } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function ApproveButton({
  onClick,
  variant = "subtle",
}: {
  onClick?: () => void;
  variant?: ActionIconProps["variant"];
}) {
  const t = useTranslations();
  return (
    <Tooltip label={t("approve")} withArrow>
      <ActionIcon color="green" variant={variant} onClick={onClick}>
        <IconCheck size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
