import { Group } from "@mantine/core";
import {
  IconClipboardText,
  IconHome,
  IconPackage,
  IconPrinter,
  IconTournament,
  IconUsersGroup,
  IconIdBadge,
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
      <ShellLink
        section="/customers"
        label={t("sidebar.customers")}
        icon={<IconUsersGroup size={18} />}
      />
      <ShellLink
        section="/ids-templates"
        label={t("sidebar.ids")}
        icon={<IconIdBadge size={18} />}
      />
      <ShellLink
        section="/forms"
        label={t("sidebar.surveies")}
        icon={<IconClipboardText size={18} />}
      />
      <ShellLink
        section="/management"
        label={t("sidebar.management")}
        icon={<IconTournament size={18} />}
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
    </Group>
  );
}
