import { useSetState } from "@mantine/hooks";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/utils/constants";
import type { DataTableProps } from "mantine-datatable";
import { useSorting } from "./use-sorting";
import { GetResponse } from "@/types/api";
import type { UseQueryResult } from "@tanstack/react-query";

type getTablePropsParams = {
  query?: UseQueryResult<GetResponse<unknown[]>>;
  isPagination?: boolean;
  isSorting?: boolean;
};

type Pagination = {
  page: number;
  pageSize: number;
};

type Sorting = {
  field: string;
  order: "asc" | "desc";
};

type useDataTableParams = {
  pagination?: Pagination;
  sorting?: Sorting;
};

export function useDataTable<T>({
  pagination: defaultPagination,
  sorting: defaultSorting,
}: useDataTableParams = {}) {
  const [pagination, setPagination] = useSetState<Pagination>(
    defaultPagination || {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    }
  );

  const { sorting, setSorting, dtSorting, setDtSorting } = useSorting<T>({
    sorting: defaultSorting,
  });

  function getTableProps({
    query,
    isPagination = true,
    isSorting = true,
  }: getTablePropsParams) {
    let props: DataTableProps<T> = {
      borderRadius: "sm",
      withRowBorders: true,
      withTableBorder: true,
      withColumnBorders: true,
      verticalSpacing: "sm",
      fetching: query?.isPending,
      minHeight: query?.data?.data?.data?.length ? undefined : 200,
      columns: [],
      records: [],
    };

    if (isPagination) {
      props = {
        ...props,
        totalRecords: query?.data?.data?.meta?.total ?? 0,
        recordsPerPageOptions: PAGE_SIZE_OPTIONS,
        page: pagination.page,
        onPageChange: (page) => setPagination({ page }),
        recordsPerPage: pagination.pageSize,
        onRecordsPerPageChange: (pageSize) => setPagination({ pageSize }),
      };
    }

    if (isSorting) {
      props = {
        ...props,
        sortStatus: dtSorting,
        onSortStatusChange: setDtSorting,
      };
    }

    return props;
  }

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    getTableProps,
  };
}
