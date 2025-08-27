"use client";

import { Container, Paper } from "@mantine/core";
import { DeliveryTable } from "./_components/delivery-table";

export default function MembersPage() {
  return (
    <Paper bg="#f8f9fa" mih={"100%"} p="xl">
      <Container size="xl">
        <DeliveryTable />
      </Container>
    </Paper>
  );
}
