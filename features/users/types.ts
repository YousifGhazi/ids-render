import { Role } from "@/features/roles/types";

export type User = {
  id: number;
  name: string;
  phone: string;
  type: UserType;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
};

type UserType = "admin" | "organization_user";

export type CreateUsersInput = {
  name: string;
  phone: string;
  roleId?: number[];
};

export type UpdateUsersInput = {
  name?: string;
  roleId?: number[];
};
