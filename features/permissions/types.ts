import { RoleType } from "@/features/roles/types";

export type Permission = {
  id: number;
  name: string;
  type: RoleType;
  createdAt: string;
  updatedAt: string;
};
