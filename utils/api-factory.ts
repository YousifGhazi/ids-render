import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "@/api/client";
import { serializeQuery } from "@/utils/api";
import type { BaseQuery, GetResponse } from "@/types/api";
import { objectToFormData } from "@/utils/objects";

export type BaseEntity = {
  id: number | string;
};

export type ApiFactoryConfig = {
  entityName: string;
  endpoint: string;
  isFormData?: boolean;
};

export function createApiFactory<
  TEntity extends BaseEntity,
  TCreateInput extends Record<string, unknown>,
  TUpdateInput extends Record<string, unknown>
>(config: ApiFactoryConfig) {
  const { entityName, endpoint, isFormData = false } = config;

  // Query Keys Factory
  const QueryKeys = {
    all: () => [entityName],
    list: (filter: BaseQuery) => [...QueryKeys.all(), filter],
    byId: (id: BaseEntity["id"]) => [...QueryKeys.all(), id],
  };

  // Get List Hook
  const useGetList = (
    filter: BaseQuery,
    options?: Omit<
      UseQueryOptions<GetResponse<TEntity[]>>,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery({
      queryKey: QueryKeys.list(filter),
      queryFn: async (): Promise<GetResponse<TEntity[]>> => {
        const response = await api.get(endpoint, {
          params: serializeQuery(filter),
        });
        return response;
      },
      ...options,
    });
  };

  // Get Single Item Hook
  const useGetById = (
    id: BaseEntity["id"],
    options?: Omit<UseQueryOptions<TEntity>, "queryKey" | "queryFn">
  ) => {
    return useQuery({
      queryKey: QueryKeys.byId(id),
      queryFn: async (): Promise<TEntity> => {
        const response = await api.get(`${endpoint}/${id}`);
        return response.data;
      },
      enabled: !!id,
      ...options,
    });
  };

  // Create Hook
  const useCreate = (
    options?: Omit<
      UseMutationOptions<TEntity, Error, TCreateInput>,
      "mutationFn"
    >
  ) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: TCreateInput): Promise<TEntity> => {
        let headers;
        let requestData;
        if (isFormData) {
          headers = { "Content-Type": "multipart/form-data" };
          requestData = objectToFormData(data);
        } else {
          requestData = data;
        }

        const response = await api.post(endpoint, requestData, { headers });
        return response.data;
      },

      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.all() });
        options?.onSuccess?.(data, variables, context);
      },
    });
  };

  // Update Hook
  const useUpdate = (
    options?: Omit<
      UseMutationOptions<
        TEntity,
        Error,
        { id: BaseEntity["id"]; data: TUpdateInput }
      >,
      "mutationFn"
    >
  ) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: BaseEntity["id"];
        data: TUpdateInput;
      }): Promise<TEntity> => {
        let headers;
        let requestData;
        if (isFormData) {
          headers = { "Content-Type": "multipart/form-data" };
          requestData = objectToFormData(data);
        } else {
          requestData = data;
        }

        const response = await api.put(`${endpoint}/${id}`, requestData, {
          headers,
        });
        return response.data;
      },
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.all(),
        });
        options?.onSuccess?.(data, variables, context);
      },
    });
  };

  // Delete Hook
  const useDelete = (
    options?: Omit<UseMutationOptions<void, Error, number>, "mutationFn">
  ) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`${endpoint}/${id}`);
      },
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.all(),
        });
        options?.onSuccess?.(data, variables, context);
      },
    });
  };

  return {
    QueryKeys,
    useGetList,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
  };
}

// Utility type for extracting hook types
export type ApiHooks<
  T extends ReturnType<
    typeof createApiFactory<
      BaseEntity,
      Record<string, unknown>,
      Record<string, unknown>
    >
  >
> = T;
