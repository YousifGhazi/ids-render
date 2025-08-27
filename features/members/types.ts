import { Organization } from "@/features/organizations/types";

export type Member = {
  id: number;
  phone: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  organizations: Organization[];
};

export type CreateMembersInput = {
  phone: string;
  name: string;
  organizationId?: number;
};

export type UpdateMembersInput = {
  phone: string;
  name: string;
  organizationId?: number;
};
