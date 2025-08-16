export type User = {
  id: number;
  name: string;
  email: string;
  type: UserType;
  created_at: string;
  updated_at: string;
};

export type UserType = "Admin" | "Organization";

export type CreateUsersInput = {
  name: string;
};

export type UpdateUsersInput = {
  name?: string | undefined;
};
