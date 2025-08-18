import { createApiFactory } from "@/utils/api-factory";
import type {
  Organization,
  CreateOrganizationsInput,
  UpdateOrganizationsInput,
} from "./types";

const organizationsApi = createApiFactory<
  Organization,
  CreateOrganizationsInput,
  UpdateOrganizationsInput
>({
  entityName: "organization",
  endpoint: "/organization",
});

// Export the query keys for use in other parts of the app
export const OrganizationQueryKeys = organizationsApi.QueryKeys;

export const useGetOrganizations = organizationsApi.useGetList;
export const useGetOrganization = organizationsApi.useGetById;
export const useCreateOrganization = organizationsApi.useCreate;
export const useUpdateOrganization = organizationsApi.useUpdate;
export const useDeleteOrganization = organizationsApi.useDelete;
