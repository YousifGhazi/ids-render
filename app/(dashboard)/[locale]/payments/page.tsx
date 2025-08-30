"use client";

import { Container, Paper } from "@mantine/core";
import { PaymentsTable } from "./_components/payments-table";

export default function PaymentsPage() {
  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <PaymentsTable />
      </Container>
    </Paper>
  );
}
