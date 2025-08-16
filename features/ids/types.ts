export type IDCard = {
  id: number;
  name: string;
  phone: string;
  identity: Record<string, any>;
  template_id: number;
};

export type CreateIDCardInput = {
  name: string;
  phone: string;
  identity: Record<string, any>;
  template_id: number;
};

export type UpdateIDCardInput = {
  name: string;
  phone: string;
  identity: Record<string, any>;
  template_id: number;
};
