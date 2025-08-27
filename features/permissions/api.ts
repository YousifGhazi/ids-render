import { createApiFactory } from "@/utils/api-factory";
import type { Permission } from "./types";

const rolesApi = createApiFactory<Permission>({
  entityName: "permission",
  endpoint: "/permission",
});

// Export the query keys for use in other parts of the app
export const PermissionQueryKeys = rolesApi.QueryKeys;

export const useGetPermissions = rolesApi.useGetList;
