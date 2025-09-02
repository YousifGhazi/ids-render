import { createApiFactory } from "@/utils/api-factory";
import type {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
} from "./types";

const templatesApi = createApiFactory<
  Template,
  CreateTemplateInput,
  UpdateTemplateInput
>({
  entityName: "template",
  endpoint: "/template",
});

// Export the query keys for use in other parts of the app
export const TemplateQueryKeys = templatesApi.QueryKeys;

export const useGetTemplates = templatesApi.useGetList;
export const useGetTemplate = templatesApi.useGetById;
export const useCreateTemplate = templatesApi.useCreate;
export const useUpdateTemplate = templatesApi.useUpdate;
export const useDeleteTemplate = templatesApi.useDelete;
