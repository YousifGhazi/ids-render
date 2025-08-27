import { createApiFactory } from "@/utils/api-factory";
import type { IDCard, CreateIDCardInput, UpdateIDCardInput } from "./types";

const idsApi = createApiFactory<IDCard, CreateIDCardInput, UpdateIDCardInput>({
  entityName: "identity",
  endpoint: "/identity",
});

// Export the query keys for use in other parts of the app
export const IdsQueryKeys = idsApi.QueryKeys;

export const useGetIds = idsApi.useGetList;
export const useGetId = idsApi.useGetById;
export const useCreateId = idsApi.useCreate;
export const useUpdateId = idsApi.useUpdate;
export const useDeleteId = idsApi.useDelete;
