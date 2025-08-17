import { RoleType } from "@/features/roles/types";

export type Permission = {
  id: number;
  name: string;
  type: RoleType;
  created_at: string;
  updated_at: string;
};
