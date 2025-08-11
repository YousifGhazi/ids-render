"use client";

import { NAVBAR_WIDTH_FULL } from "@/utils/constants";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconLanguage,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const switchLocale = (nextLocale: "en" | "ar") => {
    if (nextLocale === locale) return;
    router.replace({ pathname }, { locale: nextLocale });
  };

  return (
    <Group h="100%" justify="space-between">
      <Box h="100%" w={NAVBAR_WIDTH_FULL}></Box>

      <Group justify="space-between" style={{ flexGrow: 1 }}>
        <Menu>
          <MenuTarget>
            <ActionIcon variant="subtle" color="auto" c="dimmed">
              <IconUser />
            </ActionIcon>
          </MenuTarget>

          <MenuDropdown miw={160}>
            <MenuItem color="red" leftSection={<IconLogout size={18} />}>
              {t("logout")}
            </MenuItem>
          </MenuDropdown>
        </Menu>
        <Group gap="sm" mx="xl">
          <ActionIcon
            onClick={toggleColorScheme}
            variant="subtle"
            color="auto"
            c="dimmed"
          >
            <IconSun
              style={{ display: colorScheme === "dark" ? "none" : "block" }}
              stroke={2}
            />
            <IconMoon
              style={{ display: colorScheme === "dark" ? "block" : "none" }}
              stroke={2}
            />
          </ActionIcon>

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
        </Group>
      </Group>
    </Group>
  );
}
