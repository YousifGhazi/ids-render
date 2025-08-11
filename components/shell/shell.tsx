"use client";

import {
  HEADER_HEIGHT,
  NAVBAR_WIDTH_COLLAPSED,
  NAVBAR_WIDTH_FULL,
} from "@/utils/constants";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function Shell({
  children,
  initialFullSize,
}: {
  children: React.ReactNode;
  initialFullSize: boolean;
}) {
  const pathname = usePathname();
  const [fullSize] = useState(initialFullSize);

  const uuidRegex = /^\/employees\/[0-9a-fA-F-]{36}$/;
  const isEmployeePage = uuidRegex.test(pathname);

  return (
    <AppShell
      padding="md"
      header={{ height: HEADER_HEIGHT }}
      aside={isEmployeePage ? { width: 300, breakpoint: "sm" } : undefined}
      navbar={{
        breakpoint: "sm",
        width: fullSize ? NAVBAR_WIDTH_FULL : NAVBAR_WIDTH_COLLAPSED,
      }}
    >
      <AppShellHeader>
        <Header />
      </AppShellHeader>

      <AppShellNavbar>
        <Sidebar fullSize={fullSize} />
      </AppShellNavbar>

      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
