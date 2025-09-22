export type Customer = {
  id: string;
  name: string;
  phoneNumber: string;
  gender: "male" | "female";
  organization: string;
  department: string;
  dateOfBirth: string;
};

export type CreateCustomersInput = {
  name: string;
};

export type UpdateCustomersInput = {
  name?: string | undefined;
};
