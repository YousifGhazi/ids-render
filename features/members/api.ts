import { createApiFactory } from "@/utils/api-factory";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "@/api/client";
import { objectToFormData } from "@/utils/objects";
import type {
  Member,
  CreateMembersInput,
  UpdateMembersInput,
  UploadMembersInput,
} from "./types";

const membersApi = createApiFactory<
  Member,
  CreateMembersInput,
  UpdateMembersInput
>({
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

// Custom upload hook for uploading members via Excel file
export const useUploadMembers = (
  options?: Omit<
    UseMutationOptions<any, Error, UploadMembersInput>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadMembersInput): Promise<any> => {
      const formData = objectToFormData(data);

      const response = await api.post("/member/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: MemberQueryKeys.all() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};
