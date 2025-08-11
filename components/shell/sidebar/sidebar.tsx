"use client";

import { Stack } from "@mantine/core";
import {
  IconHome,
  IconUsersGroup,
  IconPrinter,
  IconPackage,
  IconTournament,
  IconClipboardText,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ShellAccordion } from "./shell-accordion";
import { ShellLink } from "./shell-link";

export function Sidebar({ fullSize }: { fullSize: boolean }) {
  const t = useTranslations();

  return (
    <Stack p="xs" h="100%" gap={8}>
      <ShellLink
        section="/"
        collapsed={!fullSize}
        label={t("sidebar.home")}
        icon={<IconHome size={18} />}
      />

      <ShellAccordion
        icon={<IconUsersGroup size={18} />}
        title={t("sidebar.ids")}
        fullSize={fullSize}
        value="ids"
      >
        {/* shell link */}
        <ShellLink
          section="/"
          collapsed={!fullSize}
          label={t("sidebar.home")}
          icon={<IconHome size={18} />}
        />
      </ShellAccordion>

      <ShellAccordion
        icon={<IconClipboardText size={18} />}
        title={t("sidebar.surveies")}
        fullSize={fullSize}
        value="surveies"
      >
        <ShellLink
          section="/"
          collapsed={!fullSize}
          label={t("sidebar.home")}
          icon={<IconHome size={18} />}
        />

        {/* shell link */}
      </ShellAccordion>
      <ShellAccordion
        icon={<IconTournament size={18} />}
        title={t("sidebar.management")}
        fullSize={fullSize}
        value="management"
      >
        <ShellLink
          section="/"
          collapsed={!fullSize}
          label={t("sidebar.home")}
          icon={<IconHome size={18} />}
        />

        {/* shell link */}
      </ShellAccordion>
      <ShellAccordion
        icon={<IconPrinter size={18} />}
        title={t("sidebar.printer")}
        fullSize={fullSize}
        value="printer"
      >
        <ShellLink
          section="/"
          collapsed={!fullSize}
          label={t("sidebar.home")}
          icon={<IconHome size={18} />}
        />

        {/* shell link */}
      </ShellAccordion>
      <ShellAccordion
        icon={<IconPackage size={18} />}
        title={t("sidebar.delivery")}
        fullSize={fullSize}
        value="delivery"
      >
        <ShellLink
          section="/"
          collapsed={!fullSize}
          label={t("sidebar.home")}
          icon={<IconHome size={18} />}
        />

        {/* shell link */}
      </ShellAccordion>
    </Stack>
  );
}
