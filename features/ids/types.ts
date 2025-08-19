import { Member } from "../members/types";
import { Template } from "../templates/types";

export type IDCard = {
  id: number;
  name: string;
  phone: string;
  request: Record<string, any>;
  template_id: number;
  createdAt: string;
  updatedAt: string;
  template: Template
  member?: Member
};

export type CreateIDCardInput = {
  name: string;
  phone: string;
  identity: string;
  template_id: number;
};

export type UpdateIDCardInput = {
  name: string;
  phone: string;
  identity: Record<string, any>;
  template_id: number;
};
