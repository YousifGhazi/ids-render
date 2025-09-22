import { createApiFactory } from "@/utils/api-factory";
import type {
  FormTemplate,
  CreateFormTemplateInput,
  UpdateFormTemplateInput,
} from "./types";

const formTemplateApi = createApiFactory<
  FormTemplate,
  CreateFormTemplateInput,
  UpdateFormTemplateInput
>({
  entityName: "form",
  endpoint: "/form",
});

// Export the query keys for use in other parts of the app
export const formTemplateQueryKeys = formTemplateApi.QueryKeys;

export const useGetForms = formTemplateApi.useGetList;
export const useGetForm = formTemplateApi.useGetById;
export const useCreateForm = formTemplateApi.useCreate;
export const useUpdateForm = formTemplateApi.useUpdate;
export const useDeleteForm = formTemplateApi.useDelete;
