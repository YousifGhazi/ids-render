"use client";

import { ActionIcon, type ActionIconProps, Tooltip } from "@mantine/core";
import { IconCreditCard } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function PayButton({
  onClick,
  variant = "subtle",
}: {
  onClick?: () => void;
  variant?: ActionIconProps["variant"];
}) {
  const t = useTranslations();
  return (
    <Tooltip label={t("pay")} withArrow>
      <ActionIcon color="green" variant={variant} onClick={onClick}>
        <IconCreditCard size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
