"use client";

import {
  ActionIcon,
  Avatar,
  Button,
  Divider,
  Group,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconLanguage,
  IconLogout,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Navbar } from "./navbar";
import { useAuthStore } from "@/features/auth/store";

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  const { user } = useAuthStore();

  const switchLocale = (nextLocale: "en" | "ar") => {
    if (nextLocale === locale) return;
    router.replace({ pathname }, { locale: nextLocale });
  };

  return (
    <Group h="100%" align="start" gap={0} style={{ alignContent: "start" }}>
      <Group w="100%" px="xl" py="xs">
        <Group justify="space-between" style={{ flexGrow: 1 }}>
          <Avatar src="/assets/app-logo.jpg" alt="app logo" />

          <Group>
            <Group gap="sm">
              <Menu>
                <MenuTarget>
                  <Button
                    miw={72}
                    size="compact-sm"
                    radius="100vw"
                    variant="light"
                  >
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
            </Group>
            <Menu>
              <MenuTarget>
                <Group>
                  <Avatar src="/assets/profile.png" alt="it's me" />
                  <Stack gap={0}>
                    <Text fw={700}>{user?.name}</Text>
                    <Text size="xs" c="dimmed">
                      {user?.type}
                    </Text>
                  </Stack>
                </Group>
              </MenuTarget>

              <MenuDropdown miw={160}>
                <MenuItem color="red" leftSection={<IconLogout size={18} />}>
                  {t("logout")}
                </MenuItem>
              </MenuDropdown>
            </Menu>
          </Group>
        </Group>
      </Group>
      <Divider w="100%" />
      <Navbar />
    </Group>
  );
}
