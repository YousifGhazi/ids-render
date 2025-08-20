"use client";

import { NavLink, NavLinkProps } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Permission } from "@/components/permission";

interface ShellLinkProps extends NavLinkProps {
  section: string;
  icon: React.ReactNode;
  toggle?: () => void;
  visible?: boolean;
  can?: string;
}

export function ShellLink({
  label,
  icon,
  section,
  toggle,
  visible = true,
  can,
  ...props
}: ShellLinkProps) {
  const pathname = usePathname();
  const filteredPathname = pathname.slice(3) === "" ? "/" : pathname.slice(3);
  const active = filteredPathname === section;

  if (!visible) {
    return;
  }

  return (
    <>
      {can ? (
        <Permission can={can}>
          <NavLink
            label={label}
            active={active}
            leftSection={icon}
            variant="light"
            w="fit-content"
            py={4}
            px={20}
            h={34}
            href={section}
            onClick={toggle}
            component={Link}
            style={{ borderRadius: 5 }}
            {...props}
          />
        </Permission>
      ) : (
        <NavLink
          label={label}
          active={active}
          leftSection={icon}
          variant="light"
          w="fit-content"
          py={4}
          px={20}
          h={34}
          href={section}
          onClick={toggle}
          component={Link}
          style={{ borderRadius: 5 }}
          {...props}
        />
      )}
    </>
  );
}
