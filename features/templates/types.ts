export type Template = {
  id: number;
  title: string;
  template: Record<string, any>;
  is_enabled: string;
};

export type CreateTemplateInput = {
  title: string;
  template: Record<string, any>;
  is_enabled: string;
};

export type UpdateTemplateInput = {
  title: string;
  template: Record<string, any>;
  is_enabled: string;
};
