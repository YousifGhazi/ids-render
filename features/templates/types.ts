export type Template = {
  id: number;
  title: string;
  description: string;
  price: string;
  // phone: string;
  identitiesCount: number;
  template: Record<string, unknown>;
  is_enabled: number;
};

export type CreateTemplateInput = {
  title: string;
  description: string;
  price: string;
  // phone: string;
  template: Record<string, unknown>;
  is_enabled: string;
};

export type UpdateTemplateInput = {
  title: string;
  description: string;
  price: string;
  // phone: string;
  template: Record<string, unknown>;
  is_enabled: string;
};
