"use client";

import { Container, Paper } from "@mantine/core";
import { UsersTable } from "./_components/users-table";

export default function Home() {
  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <UsersTable />
      </Container>
    </Paper>
  );
}
