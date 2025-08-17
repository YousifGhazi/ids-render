import { createApiFactory } from "@/utils/api-factory";
import type { User, CreateUsersInput, UpdateUsersInput } from "./types";

const usersApi = createApiFactory<User, CreateUsersInput, UpdateUsersInput>({
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
