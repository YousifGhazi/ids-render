import { Role } from "@/features/roles/types";
import { Organization } from "@/features/organizations/types";

export type User = {
  id: number;
  name: string;
  email: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
  organization?: Organization;
};

export type CreateUsersInput = {
  name: string;
  email: string;
  password: string;
  organizationId: number;
  roleIds?: number[];
};

export type UpdateUsersInput = {
  name?: string;
  email?: string;
  organizationId: number;
  roleIds?: number[];
};
