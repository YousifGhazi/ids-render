import { Role } from "@/features/roles/types";

export type Member = {
  id: number;
  phone: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMembersInput = {
  phone: string;
  name: string;
};

export type UpdateMembersInput = {
  phone: string;
  name: string;
};
