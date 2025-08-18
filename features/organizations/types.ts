export type Organization = {
  id: number;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationsInput = {
  name: string;
  description: string;
  logo?: string;
  website?: string;
};

export type UpdateOrganizationsInput = {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
};
