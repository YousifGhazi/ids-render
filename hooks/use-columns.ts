import { DataTableColumn } from "mantine-datatable";

export const useColumns = <T extends Record<string, unknown>>(
  cols: DataTableColumn<T>[]
): DataTableColumn<T>[] => {
  return cols;
};
