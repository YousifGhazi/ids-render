import { createApiFactory } from "@/utils/api-factory";
import type { User, CreateUsersInput, UpdateUsersInput } from "./types";

const usersApi = createApiFactory<User, CreateUsersInput, UpdateUsersInput>({
  entityName: "users",
  endpoint: "/users",
});

// Export the query keys for use in other parts of the app
export const UserQueryKeys = usersApi.QueryKeys;

export const useGetUsers = usersApi.useGetList;
export const useGetUser = usersApi.useGetById;
export const useCreateUser = usersApi.useCreate;
export const useUpdateUser = usersApi.useUpdate;
export const useDeleteUser = usersApi.useDelete;
