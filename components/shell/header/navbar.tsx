import {
  Button,
  Group,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
} from "@mantine/core";
import {
  IconClipboardText,
  IconHome,
  IconPackage,
  IconPrinter,
  IconTournament,
  IconUsersGroup,
  IconIdBadge,
  IconUsers,
  IconUserShield,
  IconBuilding,
} from "@tabler/icons-react";
import { ShellLink } from "./navbar-link";
import { useTranslations } from "next-intl";

export function Navbar() {
  const t = useTranslations();
  return (
    <Group w="100%" p={8} justify="center" wrap="nowrap">
      <ShellLink
        section="/"
        label={t("sidebar.home")}
        icon={<IconHome size={18} />}
      />
      <Menu>
        <MenuTarget>
          <Button
            leftSection={<IconIdBadge size={18} />}
            variant="subtle"
            color="dark"
          >
            {t("sidebar.ids.ids")}
          </Button>
        </MenuTarget>

        <MenuDropdown>
          <MenuItem>
            <ShellLink
              section="/ids-templates"
              label={t("sidebar.ids.templates")}
              icon={<IconUsersGroup size={18} />}
            />
          </MenuItem>
        </MenuDropdown>
      </Menu>

      <ShellLink
        section="/members"
        label={t("members.plural_title")}
        icon={<IconUsers size={18} />}
      />

      <ShellLink
        section="/forms"
        label={t("sidebar.surveies")}
        icon={<IconClipboardText size={18} />}
      />

      <Menu>
        <MenuTarget>
          <Button
            leftSection={<IconTournament size={18} />}
            variant="subtle"
            color="dark"
          >
            {t("sidebar.management.management")}
          </Button>
        </MenuTarget>

        <MenuDropdown>
          <MenuItem>
            <ShellLink
              section="/users"
              label={t("sidebar.management.users")}
              icon={<IconUsersGroup size={18} />}
            />
          </MenuItem>
          <MenuItem>
            <ShellLink
              section="/organization-users"
              label={t("sidebar.management.organizationUsers")}
              icon={<IconUsersGroup size={18} />}
            />
          </MenuItem>
          <MenuItem>
            <ShellLink
              section="/organizations"
              label={t("sidebar.management.organizations")}
              icon={<IconBuilding size={18} />}
            />
          </MenuItem>
          <MenuItem>
            <ShellLink
              section="/roles"
              label={t("role.roles")}
              icon={<IconUserShield size={18} />}
            />
          </MenuItem>
        </MenuDropdown>
      </Menu>
      <ShellLink
        section="/printer"
        label={t("sidebar.printer")}
        icon={<IconPrinter size={18} />}
      />
      <ShellLink
        section="/delivery"
        label={t("sidebar.delivery")}
        icon={<IconPackage size={18} />}
      />
    </Group>
  );
}
