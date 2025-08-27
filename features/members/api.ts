import { createApiFactory } from "@/utils/api-factory";
import type { Member, CreateMembersInput, UpdateMembersInput } from "./types";

const membersApi = createApiFactory<Member, CreateMembersInput, UpdateMembersInput>({
  entityName: "member",
  endpoint: "/member",
});

// Export the query keys for use in other parts of the app
export const MemberQueryKeys = membersApi.QueryKeys;

export const useGetMembers = membersApi.useGetList;
export const useGetMember = membersApi.useGetById;
export const useCreateMember = membersApi.useCreate;
export const useUpdateMember = membersApi.useUpdate;
export const useDeleteMember = membersApi.useDelete;
