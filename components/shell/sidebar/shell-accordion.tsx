'use client';

import { Accordion, ActionIcon, Center, Menu } from '@mantine/core';
import type { ReactNode } from 'react';

export function ShellAccordion({
  value,
  title,
  icon,
  children,
  fullSize,
  defaultOpen = false,
}: {
  value: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  fullSize: boolean;
  defaultOpen?: boolean;
}) {
  if (fullSize) {
    return (
      <Accordion
        w="100%"
        defaultValue={defaultOpen ? value : null}
        styles={{
          item: { borderBottom: 'none' },
          label: { fontSize: 15, paddingTop: 6, paddingBottom: 6 },
          control: {
            paddingTop: 0,
            paddingInlineStart: 6,
            borderRadius: 'var(--mantine-radius-sm)',
          },
        }}
      >
        <Accordion.Item value={value}>
          <Accordion.Control icon={icon}>{title}</Accordion.Control>
          <Accordion.Panel>{children}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  }

  return (
    <Center>
      <Menu trigger="hover" shadow="md" position="right-start" withArrow>
        <Menu.Target>
          <ActionIcon variant="shell-link">{icon}</ActionIcon>
        </Menu.Target>
        <Menu.Dropdown miw={200}>
          <Menu.Label>{title}</Menu.Label>

          {children}
        </Menu.Dropdown>
      </Menu>
    </Center>
  );
}
