import { Role } from "@/features/roles/types";
import { Organization } from "@/features/organizations/types";

export type OrganizationUser = {
  id: number;
  name: string;
  email: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
  organization?: Organization;
};

export type CreateOrganizationUsersInput = {
  name: string;
  email: string;
  password: string;
  organizationId: number;
  roleIds?: number[];
};

export type UpdateOrganizationUsersInput = {
  name?: string;
  email?: string;
  organizationId: number;
  roleIds?: number[];
};
