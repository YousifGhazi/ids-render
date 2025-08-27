import { createApiFactory } from "@/utils/api-factory";
import type { Role, CreateRoleInput, UpdateRoleInput } from "./types";

const rolesApi = createApiFactory<Role, CreateRoleInput, UpdateRoleInput>({
  entityName: "role",
  endpoint: "/role",
});

// Export the query keys for use in other parts of the app
export const RoleQueryKeys = rolesApi.QueryKeys;

export const useGetRoles = rolesApi.useGetList;
export const useGetRole = rolesApi.useGetById;
export const useCreateRole = rolesApi.useCreate;
export const useUpdateRole = rolesApi.useUpdate;
export const useDeleteRole = rolesApi.useDelete;
