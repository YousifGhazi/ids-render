"use client";

import { HEADER_HEIGHT } from "@/utils/constants";
import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core";
import { Header } from "./header/";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }}>
      <AppShellHeader>
        <Header />
      </AppShellHeader>

      <AppShellMain
        style={{
          height: "calc(100dvh - var(--app-shell-header-height))",
        }}
      >
        {children}
      </AppShellMain>
    </AppShell>
  );
}
