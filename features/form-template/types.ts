export type FormTemplate = {
  id: number;
  name: string;
  description: string;
  form: string;
  slug: string;
  organizationId?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateFormTemplateInput = {
  name: string;
  description: string;
  form: string;
  slug: string;
  organizationId?: number;
};

export type UpdateFormTemplateInput = {
  name: string;
  description: string;
  form: string;
  slug: string;
  organizationId?: number;
};
