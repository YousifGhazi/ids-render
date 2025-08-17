"use client";

import { Container, Paper } from "@mantine/core";
import { RolesTable } from "./_components/roles-table";

export default function RolesPage() {
  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <RolesTable />
      </Container>
    </Paper>
  );
}
