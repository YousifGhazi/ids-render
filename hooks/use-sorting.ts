import { useSetState } from "@mantine/hooks";
import type { DataTableSortStatus } from "mantine-datatable";

interface Sorting {
  field: string;
  order: "asc" | "desc";
}

interface useSortingParams {
  sorting?: Sorting;
}

export function useSorting<T>({
  sorting: defaultSorting,
}: useSortingParams = {}) {
  const [dtSorting, setDtSorting] = useSetState<DataTableSortStatus<T>>(
    defaultSorting
      ? {
          columnAccessor: defaultSorting.field,
          direction: defaultSorting.order,
          sortKey: defaultSorting.field,
        }
      : {
          columnAccessor: "createdAt",
          direction: "desc",
          sortKey: "createdAt",
        }
  );

  const [sorting, setSorting] = useSetState<Sorting>({
    field: "createdAt",
    order: "desc",
  });

  function handleSetDtSorting(newSorting: DataTableSortStatus<T>) {
    setSorting(() => {
      return {
        field: String(newSorting.sortKey || newSorting.columnAccessor),
        order: newSorting.direction,
      };
    });
    setDtSorting(() => newSorting);
  }

  return {
    sorting,
    setSorting,
    dtSorting,
    setDtSorting: handleSetDtSorting,
  };
}
