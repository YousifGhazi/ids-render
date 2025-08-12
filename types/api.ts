export type BaseQuery<
  TSortFields extends readonly string[] = string[],
  TFilterFields extends readonly string[] = string[]
> = {
  pageSize?: number;
  page: number;
  sort?: { field: TSortFields[number]; order: "asc" | "desc" };
  filter?: { field: TFilterFields[number]; value: string }[];
};

export type GetResponse<T> = {
  data: T;
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};
