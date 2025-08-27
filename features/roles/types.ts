import { Permission } from "@/features/permissions/types";

export type Role = {
  id: number;
  name: string;
  type: RoleType;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
};

export type RoleType = "admin" | "organization";

export type CreateRoleInput = {
  name: string;
  type: RoleType;
  permissions: number[];
};

export type UpdateRoleInput = {
  name?: string;
  type?: RoleType;
  permissions?: number[];
};
