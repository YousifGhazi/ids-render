import { createApiFactory } from "@/utils/api-factory";
import type {
  Customer,
  CreateCustomersInput,
  UpdateCustomersInput,
} from "./types";

const customersApi = createApiFactory<
  Customer,
  CreateCustomersInput,
  UpdateCustomersInput
>({
  entityName: "customers",
  endpoint: "/customers",
});

// Export the query keys for use in other parts of the app
export const CustomerQueryKeys = customersApi.QueryKeys;

export const useGetCustomers = customersApi.useGetList;
export const useGetCustomer = customersApi.useGetById;
export const useCreateCustomer = customersApi.useCreate;
export const useUpdateCustomer = customersApi.useUpdate;
export const useDeleteCustomer = customersApi.useDelete;
