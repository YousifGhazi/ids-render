"use client";

import {
  Button,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
} from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LangSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (nextLocale: "en" | "ar") => {
    if (nextLocale === locale) return;
    router.replace({ pathname }, { locale: nextLocale });
  };

  return (
    <Menu>
      <MenuTarget>
        <Button miw={72} size="compact-sm" radius="100vw" variant="light">
          <IconLanguage size={18} />
        </Button>
      </MenuTarget>

      <MenuDropdown>
        <MenuItem
          leftSection="En"
          onClick={() => switchLocale("en")}
          disabled={locale === "en"}
        >
          English
        </MenuItem>
        <MenuItem
          leftSection="Ar"
          onClick={() => switchLocale("ar")}
          disabled={locale === "ar"}
        >
          العربية
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
}
