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

export type BaseEntity = {
  id: number | string;
};

export type ApiFactoryConfig = {
  entityName: string;
  endpoint: string;
};

export function createApiFactory<
  TEntity extends BaseEntity,
  TCreateInput = unknown,
  TUpdateInput = unknown
>(config: ApiFactoryConfig) {
  const { entityName, endpoint } = config;

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
        const total: number = response.headers["x-total-count"];
        return {
          data: response.data || [],
          total,
          totalPages: Math.ceil(total / (filter.pageSize || 10)),
          currentPage: filter.page,
          pageSize: filter.pageSize || 10,
        } as GetResponse<TEntity[]>;
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
        const response = await api.post(endpoint, data);
        return response.data;
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.all() });
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
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
        const response = await api.put(`${endpoint}/${id}`, data);
        return response.data;
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.all(),
        });
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
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
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.all(),
        });
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
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
  T extends ReturnType<typeof createApiFactory<BaseEntity, unknown, unknown>>
> = T;
