export type Role = {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRoleInput = {
  name: string;
  type: string;
};

export type UpdateRoleInput = {
  name?: string;
  type?: string;
};
