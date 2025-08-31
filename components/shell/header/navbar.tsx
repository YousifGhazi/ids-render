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
  IconCreditCard,
} from "@tabler/icons-react";
import { ShellLink } from "./navbar-link";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store";
import { Permission } from "@/components/permission";

export function Navbar() {
  const t = useTranslations();
  const { user } = useAuthStore();
  return (
    <Group w="100%" p={8} justify="center" wrap="nowrap">
      {user?.type === "admin" && (
        <ShellLink
          section="/"
          label={t("sidebar.home")}
          icon={<IconHome size={18} />}
        />
      )}
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
          <Permission can="templates-list">
            <MenuItem>
              <ShellLink
                w="100%"
                section="/ids-templates"
                label={t("sidebar.ids.templates")}
                icon={<IconUsersGroup size={18} />}
              />
            </MenuItem>
          </Permission>
          <Permission can="identities-list">
            <MenuItem>
              <ShellLink
                w="100%"
                section="/ids"
                label={t("ids.plural_title")}
                icon={<IconCards size={18} />}
              />
            </MenuItem>
          </Permission>
        </MenuDropdown>
      </Menu>

      <ShellLink
        can="members-list"
        section="/members"
        label={t("members.plural_title")}
        icon={<IconUsers size={18} />}
      />

      <ShellLink
        can="payments-list"
        section="/payments"
        label={t("sidebar.payments")}
        icon={<IconCreditCard size={18} />}
      />

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

      <ShellLink
        can="create-form"
        section="/forms/builder"
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
          <Permission can="users-list">
            <MenuItem>
              <ShellLink
                w="100%"
                section="/users"
                label={t("sidebar.management.users")}
                icon={<IconUsersGroup size={18} />}
              />
            </MenuItem>
          </Permission>
          <Permission can="organization-users-list">
            <MenuItem>
              <ShellLink
                w="100%"
                section="/organization-users"
                label={t("sidebar.management.organizationUsers")}
                icon={<IconUsersGroup size={18} />}
              />
            </MenuItem>
          </Permission>

          <Permission can="organizations-list">
            <MenuItem>
              <ShellLink
                w="100%"
                section="/organizations"
                label={t("sidebar.management.organizations")}
                icon={<IconBuilding size={18} />}
              />
            </MenuItem>
          </Permission>
          <Permission can="roles-list">
            <MenuItem>
              <ShellLink
                w="100%"
                section="/roles"
                label={t("role.roles")}
                icon={<IconUserShield size={18} />}
              />
            </MenuItem>
          </Permission>
        </MenuDropdown>
      </Menu>
    </Group>
  );
}
