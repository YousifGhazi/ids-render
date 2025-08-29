import { createApiFactory } from "@/utils/api-factory";
import type {
  IDCard,
  CreateIDCardInput,
  UpdateIDCardInput,
  ChangeStatusInput,
} from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";

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

export const useChangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ChangeStatusInput;
    }) => {
      return await api.put(`/identity/change_status/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IdsQueryKeys.all() });
    },
  });
};
