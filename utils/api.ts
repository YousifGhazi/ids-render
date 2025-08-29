import type { BaseQuery } from "@/types/api";

export const serializeQuery = (
  query: BaseQuery
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  if (query.page) {
    params["page"] = query.page;
  }

  if (query.pageSize) {
    params["per_page"] = query.pageSize;
  }

  // if (query.sort) {
  //   params["sort"] = query.sort.field;
  //   params["order"] = query.sort.order;
  // }

  if (query.filter) {
    for (const f of query.filter) {
      params[f.field] = f.value;
    }
  }

  return params;
};
