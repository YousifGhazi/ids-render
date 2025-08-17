export type IDCard = {
  id: number;
  name: string;
  phone: string;
  identity: Record<string, any>;
  template_id: number;
  createdAt: string;
  updatedAt: string;
  template: {
    id: number,
    template: Record<string, any>
  }
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
