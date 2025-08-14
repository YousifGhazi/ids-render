import type { BaseQuery } from "@/types/api";

export const serializeQuery = (
  query: BaseQuery
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  if (query.page) {
    params["_page"] = query.page;
  }

  if (query.pageSize) {
    params["_limit"] = query.pageSize;
  }

  if (query.sort) {
    params["_sort"] = query.sort.field;
    params["_order"] = query.sort.order;
  }

  if (query.filter) {
    for (const f of query.filter) {
      params[f.field] = f.value;
    }
  }

  return params;
};
