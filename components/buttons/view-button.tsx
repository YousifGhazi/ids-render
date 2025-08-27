"use client";

import {
  ActionIcon,
  type ButtonVariant,
  Tooltip,
  useComputedColorScheme,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function ViewButton({
  onClick,
  variant = "subtle",
}: {
  onClick?: () => void;
  variant?: ButtonVariant;
}) {
  const t = useTranslations();
  const cs = useComputedColorScheme();

  return (
    <Tooltip label={t("view")} withArrow>
      <ActionIcon
        variant={variant}
        onClick={onClick}
        color={cs === "light" ? "gray.7" : "dark.3"}
      >
        <IconEye />
      </ActionIcon>
    </Tooltip>
  );
}
