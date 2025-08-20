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
  IconCards,
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
            {t("sidebar.ids.title")}
          </Button>
        </MenuTarget>

        <MenuDropdown>
          <MenuItem>
            <ShellLink
              w="100%"
              section="/ids-templates"
              label={t("sidebar.ids.templates")}
              icon={<IconUsersGroup size={18} />}
            />
          </MenuItem>

          <MenuItem>
            <ShellLink
              w="100%"
              section="/ids"
              can="identities-list"
              label={t("ids.plural_title")}
              icon={<IconCards size={18} />}
            />
          </MenuItem>
        </MenuDropdown>
      </Menu>

      <ShellLink
        can="members-list"
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
              w="100%"
              can="users-list"
              section="/users"
              label={t("sidebar.management.users")}
              icon={<IconUsersGroup size={18} />}
            />
          </MenuItem>
          <MenuItem>
            <ShellLink
              w="100%"
              can="organization-users-list"
              section="/organization-users"
              label={t("sidebar.management.organizationUsers")}
              icon={<IconUsersGroup size={18} />}
            />
          </MenuItem>
          <MenuItem>
            <ShellLink
              w="100%"
              can="organizations-list"
              section="/organizations"
              label={t("sidebar.management.organizations")}
              icon={<IconBuilding size={18} />}
            />
          </MenuItem>
          <MenuItem>
            <ShellLink
              w="100%"
              can="roles-list"
              section="/roles"
              label={t("role.roles")}
              icon={<IconUserShield size={18} />}
            />
          </MenuItem>
        </MenuDropdown>
      </Menu>

      {/* TODO: Add permissions for printer and delivery */}
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
