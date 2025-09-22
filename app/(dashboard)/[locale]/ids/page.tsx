"use client";

import { Container, Paper } from "@mantine/core";
import { IdsTable } from "./_components/ids-table";

export default function Home() {
  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <IdsTable />
      </Container>
    </Paper>
  );
}
