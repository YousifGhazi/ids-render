"use client";

import {
  ActionIcon,
  type ButtonVariant,
  Tooltip,
  useComputedColorScheme,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function EditButton({
  onClick,
  variant = "subtle",
}: {
  onClick?: () => void;
  variant?: ButtonVariant;
}) {
  const t = useTranslations();
  const cs = useComputedColorScheme();

  return (
    <Tooltip label={t("edit")} withArrow>
      <ActionIcon
        variant={variant}
        onClick={onClick}
        color={cs === "light" ? "gray.7" : "dark.3"}
      >
        <IconPencil />
      </ActionIcon>
    </Tooltip>
  );
}
