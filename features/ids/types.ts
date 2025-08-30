import { Member } from "../members/types";
import { Template } from "../templates/types";

export type IDCard = {
  id: number;
  name: string;
  phone: string;
  uniqueKey: string;
  status: (typeof status)[number]["name"];
  request: Record<string, unknown>;
  template_id: number;
  createdAt: string;
  updatedAt: string;
  template: Template;
  member?: Member;
};

export const status = [
  {
    id: 0,
    name: "PENDING",
  },
  {
    id: 1,
    name: "APPROVED",
  },
  {
    id: 2,
    name: "REJECTED",
  },
  {
    id: 3,
    name: "WAITING_TO_PRINT",
  },
  {
    id: 4,
    name: "PRINTING",
  },
  {
    id: 5,
    name: "PRINTED",
  },
  {
    id: 6,
    name: "DELIVERY_IN_PROGRESS",
  },
  {
    id: 7,
    name: "DELIVERED",
  },
  {
    id: 8,
    name: "RETURNED",
  },
] as const;

export type ChangeStatusInput = {
  status: (typeof status)[number]["id"];
};

export type CreateIDCardInput = {
  name: string;
  phone: string;
  identity: string;
  template_id: number;
  organizationId: number;
  issueDate: Date | null;
  expirationDate: Date | null;
};

export type UpdateIDCardInput = {
  name: string;
  phone: string;
  identity: Record<string, unknown>;
  template_id: number;
};
