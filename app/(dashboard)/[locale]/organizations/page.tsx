"use client";

import { Container, Paper } from "@mantine/core";
import { OrganizationsTable } from "./_components/organizations-table";

export default function OrganizationsPage() {
  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <OrganizationsTable />
      </Container>
    </Paper>
  );
}
