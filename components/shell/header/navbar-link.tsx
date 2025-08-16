"use client";

import { NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ShellLink({
  label,
  icon,
  section,
  toggle,
  visible = true,
}: {
  label: string;
  section: string;
  icon: React.ReactNode;
  toggle?: () => void;
  visible?: boolean;
}) {
  const pathname = usePathname();
  const filteredPathname =
    pathname.split("/").slice(2).join("/") === ""
      ? "/"
      : pathname.split("/").slice(2).join("/");

  const active = filteredPathname === section;

  if (!visible) {
    return;
  }

  return (
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
    />
  );
}
