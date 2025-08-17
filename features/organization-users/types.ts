import { Role } from "@/features/roles/types";

export type User = {
  id: number;
  name: string;
  email: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
};

export type CreateUsersInput = {
  name: string;
  email: string;
  password: string;
  roleId?: number[];
};

export type UpdateUsersInput = {
  name?: string;
  email?: string;
  roleId?: number[];
};
