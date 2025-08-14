"use client";

import { ActionIcon, Center, NavLink, Tooltip } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ShellLink({
  label,
  icon,
  section,
  toggle,
  visible = true,
  collapsed = false,
}: {
  label: string;
  section: string;
  icon: React.ReactNode;
  toggle?: () => void;
  visible?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const filteredPathname =
    pathname.split("/").slice(2).join("/") === ""
      ? "/"
      : pathname.split("/").slice(2).join("/");

  const active = filteredPathname === section;

  const props = {
    py: 4,
    px: 6,
    h: 34,
    href: section,
    onClick: toggle,
    component: Link,
  };

  if (!visible) {
    return;
  }

  if (collapsed) {
    return (
      <Center>
        <Tooltip withArrow label={label} position="right" offset={12}>
          <ActionIcon variant="light" {...props}>
            {icon}
          </ActionIcon>
        </Tooltip>
      </Center>
    );
  }

  return (
    <NavLink
      {...props}
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
