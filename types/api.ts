export type BaseQuery<
  TSortFields extends readonly string[] = string[],
  TFilterFields extends readonly string[] = string[]
> = {
  pageSize?: number;
  page: number;
  sort?: { field: TSortFields[number]; order: "asc" | "desc" };
  filter?: { field: TFilterFields[number]; value: string | string[] }[];
};

export type GetResponse<T> = {
  data: {
    data: T;
    meta: {
      total: number;
      currentPage: number;
      perPage: number;
    };
  };
};
