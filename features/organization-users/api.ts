import { createApiFactory } from "@/utils/api-factory";
import type {
  OrganizationUser,
  CreateOrganizationUsersInput,
  UpdateOrganizationUsersInput,
} from "./types";

const usersApi = createApiFactory<
  OrganizationUser,
  CreateOrganizationUsersInput,
  UpdateOrganizationUsersInput
>({
  entityName: "organization-user",
  endpoint: "/organization_user",
});

// Export the query keys for use in other parts of the app
export const OrganizationUserQueryKeys = usersApi.QueryKeys;

export const useGetOrganizationUsers = usersApi.useGetList;
export const useGetOrganizationUser = usersApi.useGetById;
export const useCreateOrganizationUser = usersApi.useCreate;
export const useUpdateOrganizationUser = usersApi.useUpdate;
export const useDeleteOrganizationUser = usersApi.useDelete;
